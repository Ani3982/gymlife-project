import json
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q, Count
from django.core.mail import get_connection

from .models import NotificationLog
from .services import NotificationService, EmailService, SMSService
from core.models import Booking
from core.views import get_authenticated_admin, log_audit

def serialize_notification_log(log):
    return {
        'id': log.id,
        'booking_id': log.appointment.id if log.appointment else None,
        'booking_ref': log.appointment.ref_id if log.appointment else 'No-Ref',
        'customer_name': log.customer_name,
        'customer_email': log.customer_email or '',
        'customer_phone': log.customer_phone or '',
        'notification_type': log.notification_type,
        'type_display': log.get_notification_type_display(),
        'channel': log.channel,
        'channel_display': log.get_channel_display(),
        'recipient': log.recipient,
        'status': log.status,
        'status_display': log.get_status_display(),
        'provider': log.provider,
        'provider_display': log.get_provider_display(),
        'provider_message_id': log.provider_message_id or '',
        'error_message': log.error_message or '',
        'response_data': log.response_data or {},
        'created_at': log.created_at.strftime('%Y-%m-%d %H:%M:%S') if log.created_at else '',
        'sent_at': log.sent_at.strftime('%Y-%m-%d %H:%M:%S') if log.sent_at else '',
        'retry_count': log.retry_count,
    }


# --------------------------------------------------------------------------
# Admin Notification Logs & Search
# --------------------------------------------------------------------------
@csrf_exempt
def admin_notification_logs(request):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized or insufficient permissions.'}, status=401)

    query = NotificationLog.objects.select_related('appointment').all()

    search = request.GET.get('search', '').strip()
    status = request.GET.get('status', '').strip()
    channel = request.GET.get('channel', '').strip()
    notif_type = request.GET.get('type', '').strip()
    booking_ref = request.GET.get('booking_ref', '').strip()

    if search:
        query = query.filter(
            Q(customer_name__icontains=search) |
            Q(recipient__icontains=search) |
            Q(appointment__ref_id__icontains=search) |
            Q(provider_message_id__icontains=search)
        )
    if status and status != 'ALL':
        query = query.filter(status=status)
    if channel and channel != 'ALL':
        query = query.filter(channel=channel)
    if notif_type and notif_type != 'ALL':
        query = query.filter(notification_type=notif_type)
    if booking_ref:
        query = query.filter(appointment__ref_id__icontains=booking_ref)

    logs_data = [serialize_notification_log(log) for log in query.order_by('-created_at')[:100]]
    return JsonResponse({
        'status': 'success',
        'data': logs_data,
        'total': len(logs_data)
    })


# --------------------------------------------------------------------------
# Notification Detail View
# --------------------------------------------------------------------------
@csrf_exempt
def admin_notification_detail(request, pk):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    try:
        log = NotificationLog.objects.select_related('appointment').get(pk=pk)
        return JsonResponse({
            'status': 'success',
            'data': serialize_notification_log(log)
        })
    except NotificationLog.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Notification log not found.'}, status=404)


# --------------------------------------------------------------------------
# Explicit Manual Resend Endpoint
# --------------------------------------------------------------------------
@csrf_exempt
def admin_resend_notification(request, pk):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed. Use POST.'}, status=405)

    res = NotificationService.resend_notification(pk, admin_username=user.username)
    if res.get('success'):
        log_audit(
            user.username,
            'ADMIN_RESENT_NOTIFICATION',
            'NotificationLog',
            str(pk),
            request,
            details=f"Admin resent {res.get('status')} notification #{pk}"
        )
        return JsonResponse({'status': 'success', 'message': res.get('message', 'Notification resent successfully.'), 'data': res})
    else:
        return JsonResponse({'status': 'error', 'message': res.get('error', 'Resend failed.'), 'data': res}, status=400)


# --------------------------------------------------------------------------
# Aggregated Notification Statistics
# --------------------------------------------------------------------------
@csrf_exempt
def admin_notification_stats(request):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    total_logs = NotificationLog.objects.count()
    sent_logs = NotificationLog.objects.filter(status='SENT').count()
    failed_logs = NotificationLog.objects.filter(status='FAILED').count()
    pending_logs = NotificationLog.objects.filter(status='PENDING').count()
    retrying_logs = NotificationLog.objects.filter(status='RETRYING').count()

    email_sent = NotificationLog.objects.filter(channel='EMAIL', status='SENT').count()
    email_failed = NotificationLog.objects.filter(channel='EMAIL', status='FAILED').count()

    sms_sent = NotificationLog.objects.filter(channel='SMS', status='SENT').count()
    sms_failed = NotificationLog.objects.filter(channel='SMS', status='FAILED').count()

    success_rate = round((sent_logs / total_logs * 100), 1) if total_logs > 0 else 100.0

    return JsonResponse({
        'status': 'success',
        'stats': {
            'total_dispatches': total_logs,
            'sent_count': sent_logs,
            'failed_count': failed_logs,
            'pending_count': pending_logs,
            'retrying_count': retrying_logs,
            'email_sent': email_sent,
            'email_failed': email_failed,
            'sms_sent': sms_sent,
            'sms_failed': sms_failed,
            'success_rate': success_rate
        }
    })


# --------------------------------------------------------------------------
# Safe Diagnostic Test Tool (SMTP & SMS Validation)
# --------------------------------------------------------------------------
@csrf_exempt
def admin_diagnostic_test(request):
    user, role = get_authenticated_admin(request, 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Administrator privileges required for diagnostic tests.'}, status=401)

    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'POST required.'}, status=405)

    try:
        data = json.loads(request.body)
        test_type = data.get('test_type', 'EMAIL')
        target = data.get('target', '').strip()

        if test_type == 'EMAIL':
            test_email = target or user.email or 'support.gymcenter@gmail.com'
            if not EmailService.validate_email(test_email):
                return JsonResponse({'status': 'error', 'message': f"Invalid test email: '{test_email}'"}, status=400)

            # Test connection
            try:
                connection = get_connection(fail_silently=False)
                connection.open()
                connection.close()
                smtp_status = 'CONNECTED'
                smtp_error = None
            except Exception as conn_err:
                smtp_status = 'CONNECTION_FAILED'
                smtp_error = str(conn_err)

            # Test actual email send
            subject = "GymLife SMTP Diagnostic Self-Test"
            html = "<h3>GymLife Notification Diagnostic</h3><p>Brevo SMTP test passed successfully.</p>"
            send_res = EmailService.send_email(test_email, subject, html, "Diagnostic test")

            return JsonResponse({
                'status': 'success' if send_res.get('success') else 'error',
                'diagnostic': {
                    'provider': 'BREVO_SMTP',
                    'connection_status': smtp_status,
                    'connection_error': smtp_error,
                    'target_email': test_email,
                    'send_success': send_res.get('success'),
                    'send_error': send_res.get('error')
                }
            })

        elif test_type == 'SMS':
            test_phone = target or '9876543210'
            is_valid, local_10, international = SMSService.normalize_phone(test_phone)

            sms_res = SMSService.send_sms(test_phone, "GymLife Diagnostic: Fast2SMS gateway check.")

            return JsonResponse({
                'status': 'success' if sms_res.get('success') else 'error',
                'diagnostic': {
                    'provider': 'FAST2SMS',
                    'phone_normalized': international,
                    'is_valid_format': is_valid,
                    'send_success': sms_res.get('success'),
                    'provider_status': sms_res.get('provider_status'),
                    'error': sms_res.get('error')
                }
            })

        return JsonResponse({'status': 'error', 'message': 'Unknown test type.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
