import logging
from django.utils import timezone
from notifications.models import NotificationLog
from .email_service import EmailService
from .sms_service import SMSService
from .whatsapp_service import WhatsAppService

logger = logging.getLogger('notifications')

class NotificationService:
    """
    Central Notification Coordinator for GymLife.
    Coordinates EmailService, SMSService, and WhatsAppService with duplicate protection,
    audit logging in NotificationLog, error isolation, and resend support.
    """

    @classmethod
    def _is_duplicate(cls, booking, notification_type, channel):
        """
        Duplicate protection: Checks if a notification of the same type was already successfully SENT.
        """
        if not booking:
            return False
        return NotificationLog.objects.filter(
            appointment=booking,
            notification_type=notification_type,
            channel=channel,
            status='SENT'
        ).exists()

    @classmethod
    def send_booking_confirmation(cls, booking, channels=('EMAIL', 'SMS', 'WHATSAPP'), force_resend=False):
        """
        Dispatches booking confirmation across selected channels with duplicate protection.
        """
        results = {
            'email': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'sms': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'whatsapp_url': None
        }

        # 1. Email Dispatch
        if 'EMAIL' in channels and booking.email:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_CONFIRMATION', 'EMAIL'):
                logger.info(f"[NotificationService] Skipping duplicate confirmation email for #{booking.ref_id}")
                results['email']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_CONFIRMATION',
                    channel='EMAIL',
                    recipient=booking.email,
                    status='PENDING',
                    provider='BREVO_SMTP'
                )
                res = EmailService.send_booking_confirmation(booking)
                if res.get('success'):
                    log.mark_as_sent(provider_message_id=res.get('message_id'))
                    results['email'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                    booking.email_delivered = True
                else:
                    log.mark_as_failed(error_message=res.get('error'))
                    results['email'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 2. SMS Dispatch
        if 'SMS' in channels and booking.phone:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_CONFIRMATION', 'SMS'):
                logger.info(f"[NotificationService] Skipping duplicate confirmation SMS for #{booking.ref_id}")
                results['sms']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_CONFIRMATION',
                    channel='SMS',
                    recipient=booking.phone,
                    status='PENDING',
                    provider='FAST2SMS'
                )
                res = SMSService.send_booking_confirmation(booking)
                if res.get('success'):
                    log.mark_as_sent(
                        provider_message_id=res.get('message_id'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                    booking.sms_delivered = True
                else:
                    log.mark_as_failed(
                        error_message=res.get('error'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 3. WhatsApp Link Generation
        if 'WHATSAPP' in channels:
            results['whatsapp_url'] = WhatsAppService.generate_booking_link(booking, event_type='CONFIRMATION')

        # Persist updated delivery flags on booking
        try:
            booking.save(update_fields=['email_delivered', 'sms_delivered'])
        except Exception:
            pass

        return results

    @classmethod
    def send_booking_cancellation(cls, booking, reason="", channels=('EMAIL', 'SMS', 'WHATSAPP'), force_resend=False):
        """
        Dispatches booking cancellation notice across selected channels.
        """
        results = {
            'email': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'sms': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'whatsapp_url': None
        }

        # 1. Email Dispatch
        if 'EMAIL' in channels and booking.email:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_CANCELLATION', 'EMAIL'):
                logger.info(f"[NotificationService] Skipping duplicate cancellation email for #{booking.ref_id}")
                results['email']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_CANCELLATION',
                    channel='EMAIL',
                    recipient=booking.email,
                    status='PENDING',
                    provider='BREVO_SMTP'
                )
                res = EmailService.send_booking_cancellation(booking, reason=reason)
                if res.get('success'):
                    log.mark_as_sent(provider_message_id=res.get('message_id'))
                    results['email'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                else:
                    log.mark_as_failed(error_message=res.get('error'))
                    results['email'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 2. SMS Dispatch
        if 'SMS' in channels and booking.phone:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_CANCELLATION', 'SMS'):
                logger.info(f"[NotificationService] Skipping duplicate cancellation SMS for #{booking.ref_id}")
                results['sms']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_CANCELLATION',
                    channel='SMS',
                    recipient=booking.phone,
                    status='PENDING',
                    provider='FAST2SMS'
                )
                res = SMSService.send_booking_cancellation(booking, reason=reason)
                if res.get('success'):
                    log.mark_as_sent(
                        provider_message_id=res.get('message_id'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                else:
                    log.mark_as_failed(
                        error_message=res.get('error'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 3. WhatsApp Link Generation
        if 'WHATSAPP' in channels:
            results['whatsapp_url'] = WhatsAppService.generate_booking_link(booking, event_type='CANCELLATION', reason=reason)

        return results

    @classmethod
    def send_booking_rescheduled(cls, booking, old_time=None, channels=('EMAIL', 'SMS', 'WHATSAPP'), force_resend=False):
        """
        Dispatches booking rescheduled notice across selected channels.
        """
        results = {
            'email': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'sms': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'whatsapp_url': None
        }

        # 1. Email Dispatch
        if 'EMAIL' in channels and booking.email:
            log = NotificationLog.objects.create(
                appointment=booking,
                customer_name=booking.name,
                customer_email=booking.email,
                customer_phone=booking.phone,
                notification_type='BOOKING_RESCHEDULED',
                channel='EMAIL',
                recipient=booking.email,
                status='PENDING',
                provider='BREVO_SMTP'
            )
            res = EmailService.send_booking_rescheduled(booking, old_time=old_time)
            if res.get('success'):
                log.mark_as_sent(provider_message_id=res.get('message_id'))
                results['email'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
            else:
                log.mark_as_failed(error_message=res.get('error'))
                results['email'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 2. SMS Dispatch
        if 'SMS' in channels and booking.phone:
            log = NotificationLog.objects.create(
                appointment=booking,
                customer_name=booking.name,
                customer_email=booking.email,
                customer_phone=booking.phone,
                notification_type='BOOKING_RESCHEDULED',
                channel='SMS',
                recipient=booking.phone,
                status='PENDING',
                provider='FAST2SMS'
            )
            res = SMSService.send_booking_rescheduled(booking, old_time=old_time)
            if res.get('success'):
                log.mark_as_sent(
                    provider_message_id=res.get('message_id'),
                    response_data=res.get('response_data', {})
                )
                results['sms'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
            else:
                log.mark_as_failed(
                    error_message=res.get('error'),
                    response_data=res.get('response_data', {})
                )
                results['sms'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 3. WhatsApp Link Generation
        if 'WHATSAPP' in channels:
            results['whatsapp_url'] = WhatsAppService.generate_booking_link(booking, event_type='RESCHEDULED', old_time=old_time)

        return results

    @classmethod
    def send_booking_reminder(cls, booking, channels=('EMAIL', 'SMS', 'WHATSAPP'), force_resend=False):
        """
        Dispatches booking reminder notice across selected channels.
        """
        results = {
            'email': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'sms': {'status': 'SKIPPED', 'log_id': None, 'error': None},
            'whatsapp_url': None
        }

        # 1. Email Dispatch
        if 'EMAIL' in channels and booking.email:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_REMINDER', 'EMAIL'):
                results['email']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_REMINDER',
                    channel='EMAIL',
                    recipient=booking.email,
                    status='PENDING',
                    provider='BREVO_SMTP'
                )
                res = EmailService.send_booking_reminder(booking)
                if res.get('success'):
                    log.mark_as_sent(provider_message_id=res.get('message_id'))
                    results['email'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                else:
                    log.mark_as_failed(error_message=res.get('error'))
                    results['email'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 2. SMS Dispatch
        if 'SMS' in channels and booking.phone:
            if not force_resend and cls._is_duplicate(booking, 'BOOKING_REMINDER', 'SMS'):
                results['sms']['status'] = 'ALREADY_SENT'
            else:
                log = NotificationLog.objects.create(
                    appointment=booking,
                    customer_name=booking.name,
                    customer_email=booking.email,
                    customer_phone=booking.phone,
                    notification_type='BOOKING_REMINDER',
                    channel='SMS',
                    recipient=booking.phone,
                    status='PENDING',
                    provider='FAST2SMS'
                )
                res = SMSService.send_booking_reminder(booking)
                if res.get('success'):
                    log.mark_as_sent(
                        provider_message_id=res.get('message_id'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'SENT', 'log_id': log.id, 'error': None}
                else:
                    log.mark_as_failed(
                        error_message=res.get('error'),
                        response_data=res.get('response_data', {})
                    )
                    results['sms'] = {'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        # 3. WhatsApp Link Generation
        if 'WHATSAPP' in channels:
            results['whatsapp_url'] = WhatsAppService.generate_booking_link(booking, event_type='REMINDER')

        return results

    @classmethod
    def resend_notification(cls, notification_log_id, admin_username="Admin"):
        """
        Performs an explicit manual resend of a past notification log attempt.
        Increments retry_count and logs status.
        """
        try:
            log = NotificationLog.objects.get(pk=notification_log_id)
        except NotificationLog.DoesNotExist:
            return {'success': False, 'error': 'Notification record not found.'}

        booking = log.appointment
        if not booking:
            return {'success': False, 'error': 'Associated booking record does not exist.'}

        log.retry_count += 1
        log.status = 'RETRYING'
        log.save()

        # Perform channel-specific dispatch
        if log.channel == 'EMAIL':
            if log.notification_type == 'BOOKING_CONFIRMATION':
                res = EmailService.send_booking_confirmation(booking)
            elif log.notification_type == 'BOOKING_CANCELLATION':
                res = EmailService.send_booking_cancellation(booking)
            elif log.notification_type == 'BOOKING_RESCHEDULED':
                res = EmailService.send_booking_rescheduled(booking)
            else:
                res = EmailService.send_booking_reminder(booking)

            if res.get('success'):
                log.mark_as_sent(provider_message_id=res.get('message_id'))
                return {'success': True, 'status': 'SENT', 'log_id': log.id, 'message': 'Email resent successfully.'}
            else:
                log.mark_as_failed(error_message=res.get('error'))
                return {'success': False, 'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        elif log.channel == 'SMS':
            if log.notification_type == 'BOOKING_CONFIRMATION':
                res = SMSService.send_booking_confirmation(booking)
            elif log.notification_type == 'BOOKING_CANCELLATION':
                res = SMSService.send_booking_cancellation(booking)
            elif log.notification_type == 'BOOKING_RESCHEDULED':
                res = SMSService.send_booking_rescheduled(booking)
            else:
                res = SMSService.send_booking_reminder(booking)

            if res.get('success'):
                log.mark_as_sent(
                    provider_message_id=res.get('message_id'),
                    response_data=res.get('response_data', {})
                )
                return {'success': True, 'status': 'SENT', 'log_id': log.id, 'message': 'SMS resent successfully.'}
            else:
                log.mark_as_failed(
                    error_message=res.get('error'),
                    response_data=res.get('response_data', {})
                )
                return {'success': False, 'status': 'FAILED', 'log_id': log.id, 'error': res.get('error')}

        return {'success': False, 'error': f"Resend not supported for channel {log.channel}"}
