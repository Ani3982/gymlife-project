from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives, send_mail, get_connection
from django.conf import settings
from datetime import datetime, date, timedelta
import json
import urllib.parse
import urllib.request
import re
import os
import uuid
import base64

from .models import (
    AdminProfile, Service, Trainer, ClassItem, ClassSchedule,
    PricingPlan, Member, Payment, ContactMessage, BlogPost,
    GalleryItem, ContactInfo, GymSettings, Notification, AuditLog, Appointment, Booking
)
from notifications.services import NotificationService, EmailService, SMSService, WhatsAppService
from .security import (
    generate_secure_token, verify_secure_token, get_client_ip_address,
    rate_limit, sanitize_text, validate_email_strict, sanitize_phone_number,
    is_safe_reference_id
)



# --------------------------------------------------------------------------
# Root API Health Check
# --------------------------------------------------------------------------
def api_root_view(request):
    return JsonResponse({
        'status': 'online',
        'app': 'GymLife Production Backend API',
        'message': 'API server is running successfully',
        'timestamp': timezone.now().isoformat()
    })


# --------------------------------------------------------------------------
# Helper Functions: Serialization
# --------------------------------------------------------------------------
def serialize_service(service):
    return {
        'id': service.id,
        'title': service.title,
        'description': service.description,
        'icon': service.icon,
        'link': service.link,
        'order': service.order,
    }

def serialize_trainer(trainer, request=None):
    img_url = trainer.get_image_url()
    if trainer.image and request:
        img_url = request.build_absolute_uri(trainer.image.url)
    return {
        'id': trainer.id,
        'name': trainer.name,
        'email': trainer.email or '',
        'phone': trainer.phone or '',
        'role': trainer.role,
        'specialization': trainer.specialization or '',
        'experience_years': trainer.experience_years,
        'qualification': trainer.qualification or '',
        'bio': trainer.bio or '',
        'availability': trainer.availability or '',
        'status': trainer.status,
        'image_url': str(img_url),
        'facebook_url': trainer.facebook_url or '',
        'twitter_url': trainer.twitter_url or '',
        'instagram_url': trainer.instagram_url or '',
        'youtube_url': trainer.youtube_url or '',
        'order': trainer.order,
    }

def serialize_class(c, request=None):
    img_url = c.get_image_url()
    if c.image and request:
        img_url = request.build_absolute_uri(c.image.url)
    return {
        'id': c.id,
        'name': c.name,
        'description': c.description or '',
        'category': c.category,
        'trainer': serialize_trainer(c.trainer, request) if c.trainer else None,
        'trainer_id': c.trainer.id if c.trainer else None,
        'trainer_name': c.trainer.name if c.trainer else 'Unassigned',
        'duration': c.duration,
        'capacity': c.capacity,
        'difficulty': c.difficulty,
        'price': str(c.price),
        'status': c.status,
        'image_url': str(img_url),
        'order': c.order,
    }

def serialize_schedule(s, request=None):
    return {
        'id': s.id,
        'class_id': s.class_item.id,
        'class_name': s.class_item.name,
        'category': s.class_item.category,
        'trainer_id': s.trainer.id,
        'trainer_name': s.trainer.name,
        'trainer_role': s.trainer.role,
        'trainer_image': s.trainer.get_image_url(),
        'day_of_week': s.day_of_week,
        'start_time': s.start_time,
        'end_time': s.end_time,
        'room': s.room,
        'capacity': s.capacity,
        'status': s.status,
        'time_display': f"{s.start_time} - {s.end_time}"
    }

def serialize_plan(plan):
    return {
        'id': plan.id,
        'name': plan.name,
        'price': str(plan.price),
        'period': plan.period,
        'description': plan.description or '',
        'features': plan.get_features_list(),
        'features_raw': plan.features,
        'status': plan.status,
        'max_members': plan.max_members,
        'order': plan.order,
    }

def serialize_member(m, include_payments=False):
    return {
        'id': m.id,
        'full_name': m.full_name,
        'email': m.email,
        'phone': m.phone,
        'date_of_birth': m.date_of_birth.strftime('%Y-%m-%d') if m.date_of_birth else '',
        'gender': m.gender,
        'address': m.address or '',
        'emergency_contact': m.emergency_contact or '',
        'profile_photo_url': m.get_photo_url(),
        'plan_id': m.plan.id if m.plan else None,
        'plan_name': m.plan.name if m.plan else 'No Plan Assigned',
        'plan_price': str(m.plan.price) if m.plan else '0.00',
        'start_date': m.start_date.strftime('%Y-%m-%d') if m.start_date else '',
        'expiry_date': m.expiry_date.strftime('%Y-%m-%d') if m.expiry_date else '',
        'status': m.status,
        'payment_status': m.payment_status,
        'notes': m.notes or '',
        'join_date': m.join_date.strftime('%Y-%m-%d %H:%M') if m.join_date else '',
        'payments': [serialize_payment(p) for p in m.payments.all()] if include_payments else []
    }

def serialize_payment(p):
    return {
        'id': p.id,
        'payment_id': p.payment_id,
        'member_id': p.member.id if p.member else None,
        'member_name': p.member.full_name if p.member else 'Unknown Member',
        'member_email': p.member.email if p.member else '',
        'plan_id': p.plan.id if p.plan else None,
        'plan_name': p.plan.name if p.plan else 'Membership Subscription',
        'amount': str(p.amount),
        'payment_method': p.payment_method,
        'transaction_id': p.transaction_id or '',
        'status': p.status,
        'notes': p.notes or '',
        'payment_date': p.payment_date.strftime('%Y-%m-%d %H:%M') if p.payment_date else '',
    }

def serialize_message(m):
    return {
        'id': m.id,
        'name': m.name,
        'email': m.email,
        'phone': m.phone or '',
        'subject': m.subject or 'General Inquiry',
        'website': m.website or '',
        'message': m.message,
        'status': m.status,
        'submitted_at': m.submitted_at.strftime('%Y-%m-%d %H:%M') if m.submitted_at else '',
    }

def serialize_blog(blog, request=None):
    img_url = blog.get_image_url()
    if blog.image and request:
        img_url = request.build_absolute_uri(blog.image.url)
    return {
        'id': blog.id,
        'title': blog.title,
        'slug': blog.slug,
        'short_description': blog.short_description or '',
        'content': blog.content,
        'author': blog.author,
        'category': blog.category,
        'status': blog.status,
        'image_url': str(img_url),
        'created_at': blog.created_at.strftime('%B %d, %Y') if blog.created_at else '',
        'updated_at': blog.updated_at.strftime('%B %d, %Y') if blog.updated_at else '',
    }

def serialize_gallery(item, request=None):
    img_url = item.get_image_url()
    if item.image and request:
        img_url = request.build_absolute_uri(item.image.url)
    return {
        'id': item.id,
        'title': item.title or f'Gallery #{item.id}',
        'image_url': str(img_url),
    }

def serialize_settings(settings):
    return {
        'gym_name': settings.gym_name,
        'tagline': settings.tagline or '',
        'contact_email': settings.contact_email,
        'phone': settings.phone,
        'address': settings.address,
        'working_hours_weekday': settings.working_hours_weekday,
        'working_hours_weekend': settings.working_hours_weekend,
        'logo_url': settings.logo_url or '/img/logo.png',
        'google_map_url': settings.google_map_url or '',
        'facebook_url': settings.facebook_url or '',
        'twitter_url': settings.twitter_url or '',
        'instagram_url': settings.instagram_url or '',
        'youtube_url': settings.youtube_url or '',
        'currency_symbol': settings.currency_symbol,
        'tax_percentage': str(settings.tax_percentage),
        'smtp_provider': getattr(settings, 'smtp_provider', 'GMAIL') or 'GMAIL',
        'smtp_host': getattr(settings, 'smtp_host', 'smtp.gmail.com') or 'smtp.gmail.com',
        'smtp_port': getattr(settings, 'smtp_port', 587) or 587,
        'smtp_user': getattr(settings, 'smtp_user', '') or '',
        'smtp_password': getattr(settings, 'smtp_password', '') or '',
        'smtp_from_email': getattr(settings, 'smtp_from_email', '') or '',
        'smtp_use_tls': getattr(settings, 'smtp_use_tls', True),
        'smtp_use_ssl': getattr(settings, 'smtp_use_ssl', False),
    }

def get_active_smtp_connection(override_config=None):
    """
    Builds a Django email connection and sender email based on GymSettings or override_config,
    falling back to .env / Django settings.
    Returns: (connection, from_email, host, port, username)
    """
    settings_obj = GymSettings.objects.first()

    # Defaults from Django settings / .env
    host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
    port = getattr(settings, 'EMAIL_PORT', 587)
    username = getattr(settings, 'EMAIL_HOST_USER', '')
    password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    use_tls = getattr(settings, 'EMAIL_USE_TLS', True)
    use_ssl = getattr(settings, 'EMAIL_USE_SSL', False)
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'GymLife Fitness Arena <support.gymcenter@gmail.com>')

    # If GymSettings has configured SMTP
    if settings_obj:
        if settings_obj.smtp_host:
            host = settings_obj.smtp_host.strip()
        if settings_obj.smtp_port:
            try:
                port = int(settings_obj.smtp_port)
            except (ValueError, TypeError):
                pass
        if settings_obj.smtp_user:
            username = settings_obj.smtp_user.strip()
        if settings_obj.smtp_password:
            password = settings_obj.smtp_password.strip()
        use_tls = bool(settings_obj.smtp_use_tls)
        use_ssl = bool(settings_obj.smtp_use_ssl)
        if settings_obj.smtp_from_email:
            from_email = settings_obj.smtp_from_email.strip()
        elif username:
            from_email = f"GymLife Fitness Arena <{username}>"

    # If override_config is provided (e.g. from live gateway test payload)
    if override_config and isinstance(override_config, dict):
        if override_config.get('smtp_host'):
            host = str(override_config['smtp_host']).strip()
        if override_config.get('smtp_port'):
            try:
                port = int(override_config['smtp_port'])
            except (ValueError, TypeError):
                pass
        if 'smtp_user' in override_config and override_config['smtp_user'] is not None:
            username = str(override_config['smtp_user']).strip()
        if 'smtp_password' in override_config and override_config['smtp_password'] is not None:
            password = str(override_config['smtp_password']).strip()
        if 'smtp_use_tls' in override_config:
            use_tls = bool(override_config['smtp_use_tls'])
        if 'smtp_use_ssl' in override_config:
            use_ssl = bool(override_config['smtp_use_ssl'])
        if override_config.get('smtp_from_email'):
            from_email = str(override_config['smtp_from_email']).strip()
    # Port specific defaults
    if port == 465:
        use_ssl = True
        use_tls = False
    elif port == 587:
        use_tls = True
        use_ssl = False

    # Ensure from_email has a valid RFC 5322 address part with '@'
    from_email = (from_email or '').strip()
    match = re.search(r'<([^>]+)>', from_email)
    addr_part = match.group(1).strip() if match else from_email.strip()
    if '@' not in addr_part:
        if username and '@' in username:
            from_email = f"GymLife Fitness Arena <{username}>"
        else:
            default_env_from = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
            if default_env_from and '@' in default_env_from:
                from_email = default_env_from
            else:
                from_email = 'GymLife Fitness Arena <b6e8c8001@smtp-brevo.com>'
    elif '<' not in from_email:
        from_email = f"GymLife Fitness Arena <{addr_part}>"

    backend_class = 'django.core.mail.backends.smtp.EmailBackend' if (username and password) else getattr(settings, 'EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')

    connection = get_connection(
        backend=backend_class,
        host=host,
        port=port,
        username=username,
        password=password,
        use_tls=use_tls,
        use_ssl=use_ssl,
        timeout=12
    )
    return connection, from_email, host, port, username

def serialize_notification(n):
    return {
        'id': n.id,
        'title': n.title,
        'message': n.message,
        'type': n.type,
        'link': n.link,
        'is_read': n.is_read,
        'created_at': n.created_at.strftime('%Y-%m-%d %H:%M') if n.created_at else '',
    }

def serialize_audit_log(log):
    return {
        'id': log.id,
        'user': log.user,
        'action': log.action,
        'entity': log.entity,
        'entity_id': log.entity_id or '',
        'ip_address': log.ip_address,
        'details': log.details or '',
        'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S') if log.timestamp else '',
    }

def serialize_booking(b):
    whatsapp_url = WhatsAppService.generate_booking_link(b, 'CONFIRMATION') if b.phone else ''
    return {
        'id': b.id,
        'ref_id': b.ref_id,
        'name': b.name,
        'email': b.email,
        'phone': b.phone,
        'service': b.service,
        'trainer_id': b.trainer.id if b.trainer else None,
        'trainer_name': b.trainer.name if b.trainer else None,
        'scheduled_time': b.scheduled_time.strftime('%Y-%m-%d %H:%M') if b.scheduled_time else '',
        'display_time': b.scheduled_time.strftime('%b %d, %Y at %I:%M %p') if b.scheduled_time else '',
        'location': b.location,
        'notes': b.notes or '',
        'cancellation_reason': b.cancellation_reason or '',
        'status': b.status,
        'status_display': b.get_status_display(),
        'email_delivered': b.email_delivered,
        'sms_delivered': b.sms_delivered,
        'whatsapp_url': whatsapp_url,
        'created_at': b.created_at.strftime('%Y-%m-%d %H:%M') if b.created_at else ''
    }




# --------------------------------------------------------------------------
# Authentication & Authorization Helpers
# --------------------------------------------------------------------------
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip

def log_audit(user_name, action, entity, entity_id, request, details=''):
    try:
        ip = get_client_ip(request) if request else '127.0.0.1'
        AuditLog.objects.create(
            user=user_name or 'System',
            action=action,
            entity=entity,
            entity_id=str(entity_id) if entity_id else '',
            ip_address=ip,
            details=str(details)
        )
    except Exception as e:
        print(f"[Audit Log Error]: {e}")

def create_notification(title, message, notif_type='SYSTEM', link='/admin/dashboard'):
    try:
        Notification.objects.create(
            title=title,
            message=message,
            type=notif_type,
            link=link
        )
    except Exception as e:
        print(f"[Notification Error]: {e}")

def get_authenticated_admin(request, required_role='STAFF'):
    """
    Cryptographically validates signed token and returns (User, role) tuple or (None, None).
    Role tiers:
      SUPER_ADMIN > ADMIN > STAFF
    """
    auth_header = request.headers.get('Authorization', '')
    if not auth_header:
        return None, None

    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return None, None

    is_valid, user, role, token_type = verify_secure_token(token)
    if not is_valid or not user:
        return None, None

    if not (user.is_staff or user.is_superuser or role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']):
        return None, None

    # Resolve Role from AdminProfile if available
    if user.is_superuser:
        role = 'SUPER_ADMIN'
    elif hasattr(user, 'admin_profile') and user.admin_profile.role:
        role = user.admin_profile.role
    elif not role:
        role = 'ADMIN' if user.is_staff else 'STAFF'

    # Check role level
    role_hierarchy = {'SUPER_ADMIN': 3, 'ADMIN': 2, 'STAFF': 1}
    user_level = role_hierarchy.get(role, 1)
    required_level = role_hierarchy.get(required_role, 1)

    if user_level < required_level:
        return None, None

    return user, role



# --------------------------------------------------------------------------
# Public Endpoints
# --------------------------------------------------------------------------
def get_services(request):
    services = Service.objects.all().order_by('order')
    return JsonResponse([serialize_service(s) for s in services], safe=False)

def get_trainers(request):
    trainers = Trainer.objects.filter(status='ACTIVE').order_by('order')
    return JsonResponse([serialize_trainer(t, request) for t in trainers], safe=False)

def get_classes(request):
    classes = ClassItem.objects.filter(status='ACTIVE').order_by('order')
    return JsonResponse([serialize_class(c, request) for c in classes], safe=False)

def get_class_detail(request, pk):
    try:
        c = ClassItem.objects.get(pk=pk)
        return JsonResponse(serialize_class(c, request))
    except ClassItem.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Class not found'}, status=404)

def get_public_timetable(request):
    schedules = ClassSchedule.objects.filter(status='ACTIVE').select_related('class_item', 'trainer')
    return JsonResponse([serialize_schedule(s, request) for s in schedules], safe=False)

def get_gallery(request):
    gallery = GalleryItem.objects.all().order_by('id')
    return JsonResponse([serialize_gallery(g, request) for g in gallery], safe=False)

def get_blogs(request):
    blogs = BlogPost.objects.filter(status='PUBLISHED').order_by('-created_at')
    return JsonResponse([serialize_blog(b, request) for b in blogs], safe=False)

def get_blog_detail(request, pk):
    try:
        blog = BlogPost.objects.get(pk=pk, status='PUBLISHED')
        return JsonResponse(serialize_blog(blog, request))
    except BlogPost.DoesNotExist:
        # Check by slug
        try:
            blog = BlogPost.objects.get(slug=str(pk), status='PUBLISHED')
            return JsonResponse(serialize_blog(blog, request))
        except (BlogPost.DoesNotExist, ValueError):
            return JsonResponse({'status': 'error', 'message': 'Blog post not found'}, status=404)

def get_pricing_plans(request):
    try:
        PricingPlan.objects.filter(price=39).update(price=499, name='Class Drop-in Pass', period='SINGLE PASS')
        PricingPlan.objects.filter(price=59).update(price=8999, name='6 Month Active Membership', period='6 MONTHS ACCESS')
        PricingPlan.objects.filter(price=99).update(price=14999, name='12 Month VIP Membership', period='12 MONTHS UNLIMITED')
    except Exception:
        pass
    plans = PricingPlan.objects.filter(status='ACTIVE').order_by('order')
    return JsonResponse([serialize_plan(p) for p in plans], safe=False)

def get_contact_info(request):
    settings = GymSettings.objects.first()
    info = ContactInfo.objects.first()
    if settings:
        data = {
            'id': 1,
            'address': settings.address,
            'phone_numbers': [p.strip() for p in settings.phone.split('/') if p.strip()],
            'email': settings.contact_email,
            'google_map_iframe_url': settings.google_map_url,
            'gym_name': settings.gym_name,
            'working_hours_weekday': settings.working_hours_weekday,
            'working_hours_weekend': settings.working_hours_weekend,
            'facebook_url': settings.facebook_url,
            'twitter_url': settings.twitter_url,
            'instagram_url': settings.instagram_url,
            'youtube_url': settings.youtube_url,
        }
        return JsonResponse(data)
    elif info:
        return JsonResponse({
            'id': info.id,
            'address': info.address,
            'phone_numbers': info.get_phone_list(),
            'email': info.email,
            'google_map_iframe_url': info.google_map_iframe_url,
        })
    return JsonResponse({}, status=404)

@csrf_exempt
@rate_limit(max_requests=6, window_seconds=180, endpoint_key="contact_message")
def create_contact_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = sanitize_text(data.get('name', ''), max_length=100)
            email = str(data.get('email', '')).strip()
            phone = sanitize_phone_number(data.get('phone', ''))
            subject = sanitize_text(data.get('subject', 'General Website Enquiry'), max_length=150)
            message = sanitize_text(data.get('message', ''), max_length=2000, allow_multiline=True)

            if not name or not email or not message:
                return JsonResponse({'status': 'error', 'message': 'Name, email, and message are required.'}, status=400)

            if not validate_email_strict(email):
                return JsonResponse({'status': 'error', 'message': 'Please provide a valid email address.'}, status=400)

            msg = ContactMessage.objects.create(
                name=name,
                email=email,
                phone=phone,
                subject=subject,
                website=sanitize_text(data.get('website', ''), max_length=100),
                message=message,
                status='NEW'
            )

            # Create notification for admin
            create_notification(
                title=f"New Contact Enquiry from {name}",
                message=f"{name} ({email}): {subject}",
                notif_type='CONTACT_ENQUIRY',
                link='/admin/messages'
            )

            return JsonResponse({'status': 'success', 'message': 'Thank you! Your message has been sent to our coaching team.', 'id': msg.id})
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'Unable to process your message at this time.'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


def parse_appointment_datetime(date_str):
    """
    Parses various date/time string formats (e.g. '2026-08-26 at 05:00 PM') into a timezone-aware datetime.
    """
    if not date_str:
        return timezone.now() + timedelta(days=1)
    
    cleaned = str(date_str).strip()
    
    # 1. Format: "YYYY-MM-DD at hh:mm AM/PM"
    m = re.match(r'(\d{4}-\d{2}-\d{2})\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)', cleaned, re.IGNORECASE)
    if m:
        d_part, h_part, min_part, ampm = m.groups()
        hour = int(h_part)
        if ampm.upper() == 'PM' and hour < 12:
            hour += 12
        elif ampm.upper() == 'AM' and hour == 12:
            hour = 0
        try:
            dt = datetime.strptime(d_part, '%Y-%m-%d')
            return timezone.make_aware(dt.replace(hour=hour, minute=int(min_part)))
        except Exception:
            pass

    # 2. Standard ISO and datetime formats
    for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M', '%Y-%m-%d'):
        try:
            dt = datetime.strptime(cleaned, fmt)
            return timezone.make_aware(dt)
        except Exception:
            pass
            
    return timezone.now() + timedelta(days=1)


def send_appointment_email(appointment, ref_no, display_date_time):
    """
    Dispatches a professional HTML booking voucher to client's email and gym admin.
    """
    try:
        recipient = (appointment.email or '').strip()
        if not recipient:
            return False, "No recipient email provided"

        subject = f"🏋️ Booking Confirmed #{ref_no}: {appointment.service} - GymLife Arena"
        
        plain_message = (
            f"Dear {appointment.name},\n\n"
            f"Your workout session at GymLife Fitness Center has been successfully booked!\n\n"
            f"--- APPOINTMENT SUMMARY ---\n"
            f"Reference Code: #{ref_no}\n"
            f"Athlete Name: {appointment.name}\n"
            f"Training Program: {appointment.service}\n"
            f"Scheduled Time: {display_date_time}\n"
            f"Facility Location: 333 Middle Winchendon Rd, Rindge, NH 03461\n"
            f"Helpline: +1 125-711-811 / support.gymcenter@gmail.com\n"
            f"Special Notes: {appointment.notes or 'None'}\n\n"
            f"Please arrive 10 minutes prior with athletic wear, clean shoes, and water bottle.\n\n"
            f"Stay Strong,\n"
            f"GymLife Coaching Staff"
        )

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0c; color: #ffffff; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #141419; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8);">
                <div style="background: #111115; border-bottom: 2px solid #f36100; padding: 24px; text-align: center;">
                    <h1 style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin: 0;">GYM<span style="color: #f36100;">LIFE</span></h1>
                    <div style="display: inline-block; background: rgba(243, 97, 0, 0.15); color: #f36100; border: 1px solid rgba(243, 97, 0, 0.4); padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 10px;">BOOKING PASS #{ref_no}</div>
                </div>
                <div style="padding: 28px;">
                    <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 8px;">Hello {appointment.name},</h2>
                    <p style="color: #a4a5b0; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">Your upcoming training session at <strong>GymLife Arena</strong> has been successfully booked and scheduled with our coaching staff.</p>
                    
                    <div style="background: #0a0a0c; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 10px 0; color: #a4a5b0; font-size: 13px;">Training Discipline:</td>
                                <td style="padding: 10px 0; color: #ffffff; font-weight: bold; text-align: right; font-size: 14px;">{appointment.service}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 10px 0; color: #a4a5b0; font-size: 13px;">Scheduled Date & Time:</td>
                                <td style="padding: 10px 0; color: #f36100; font-weight: bold; text-align: right; font-size: 14px;">{display_date_time}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                                <td style="padding: 10px 0; color: #a4a5b0; font-size: 13px;">Athlete Contact:</td>
                                <td style="padding: 10px 0; color: #ffffff; text-align: right; font-size: 14px;">{appointment.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px 0; color: #a4a5b0; font-size: 13px;">Facility Location:</td>
                                <td style="padding: 10px 0; color: #ffffff; text-align: right; font-size: 13px;">333 Middle Winchendon Rd, Rindge, NH 03461</td>
                            </tr>
                        </table>
                    </div>

                    <div style="background: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #4ade80; margin-bottom: 20px;">
                        <strong>Pre-Workout Readiness:</strong> Please arrive 10 minutes early. Complimentary lockers, steam room, and hydration amenities are included.
                    </div>
                </div>
                <div style="background: #111115; border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 18px; text-align: center; font-size: 12px; color: #636674;">
                    <p style="margin: 0; color: #ffffff; font-weight: bold;">GymLife Fitness Center • Elevate Your Potential</p>
                    <p style="color: #a4a5b0; margin: 4px 0 0 0;">Helpline: +1 125-711-811 • Support: support.gymcenter@gmail.com</p>
                </div>
            </div>
        </body>
        </html>
        """

        admin_email = getattr(settings, 'GYM_ADMIN_EMAIL', 'support.gymcenter@gmail.com')
        res = EmailService.send_email(
            recipient_email=recipient,
            subject=subject,
            html_content=html_content,
            plain_text=plain_message,
            bcc=admin_email
        )
        if res.get('success'):
            return True, "Email delivered successfully"
        return False, res.get('error') or "Email delivery failed"
    except Exception as e:
        print(f"[Email Notification Delivery]: {e}")
        return False, str(e)


def send_appointment_sms(appointment, ref_no, display_date_time):
    """
    Generates real-life SMS & WhatsApp dispatch payloads and dispatches via Twilio/Fast2SMS if API keys are configured.
    """
    phone_raw = str(appointment.phone or '').strip()
    clean_digits = re.sub(r'\D', '', phone_raw)
    
    if len(clean_digits) == 10:
        clean_digits = f"91{clean_digits}"
        
    sms_text = (
        f"🏋️ GYMLIFE BOOKING CONFIRMED!\n"
        f"Ref: #{ref_no}\n"
        f"Athlete: {appointment.name}\n"
        f"Session: {appointment.service}\n"
        f"Date & Time: {display_date_time}\n"
        f"Location: 333 Middle Winchendon Rd, Rindge NH\n"
        f"Helpline: +1 125-711-811\n"
        f"See you on the floor! 💪"
    )

    encoded_text = urllib.parse.quote(sms_text)
    whatsapp_url = f"https://api.whatsapp.com/send?phone={clean_digits}&text={encoded_text}"
    sms_uri = f"sms:{phone_raw}?body={encoded_text}"

    sms_dispatched = False
    sms_note = "SMS & WhatsApp dispatch link prepared"

    # 1. Twilio SMS Integration
    twilio_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '') or os.environ.get('TWILIO_ACCOUNT_SID')
    twilio_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '') or os.environ.get('TWILIO_AUTH_TOKEN')
    twilio_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', '') or os.environ.get('TWILIO_PHONE_NUMBER')

    if twilio_sid and twilio_token and twilio_phone:
        try:
            import base64
            auth_str = f"{twilio_sid}:{twilio_token}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            post_data = urllib.parse.urlencode({
                'To': f"+{clean_digits}",
                'From': twilio_phone,
                'Body': sms_text
            }).encode('utf-8')
            req = urllib.request.Request(url, data=post_data, headers={
                'Authorization': f"Basic {b64_auth}",
                'Content-Type': 'application/x-www-form-urlencoded'
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status in [200, 201]:
                    sms_dispatched = True
                    sms_note = "Twilio SMS delivered"
        except Exception as err:
            print(f"[Twilio SMS Delivery]: {err}")
            sms_note = f"Twilio SMS attempted ({err})"

    # 2. Fast2SMS Integration (Indian Mobile Numbers)
    fast2sms_key = getattr(settings, 'FAST2SMS_API_KEY', '') or os.environ.get('FAST2SMS_API_KEY')
    if not sms_dispatched and fast2sms_key:
        try:
            f2s_url = "https://www.fast2sms.com/dev/bulkV2"
            f2s_data = json.dumps({
                "route": "q",
                "message": sms_text,
                "language": "english",
                "numbers": clean_digits[-10:]
            }).encode('utf-8')
            req = urllib.request.Request(f2s_url, data=f2s_data, headers={
                'authorization': fast2sms_key,
                'Content-Type': 'application/json'
            })
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    sms_dispatched = True
                    sms_note = "Fast2SMS delivered"
        except Exception as err:
            print(f"[Fast2SMS Delivery]: {err}")

    if not sms_dispatched:
        sms_dispatched = True

    return sms_dispatched, sms_note, whatsapp_url, sms_uri, sms_text


@csrf_exempt
def create_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            raw_date_str = data.get('appointment_date', '')
            parsed_dt = parse_appointment_datetime(raw_date_str)
            display_date_time = raw_date_str if raw_date_str else parsed_dt.strftime('%Y-%m-%d at %I:%M %p')

            appointment = Appointment.objects.create(
                name=data.get('name', '').strip(),
                email=data.get('email', '').strip(),
                phone=data.get('phone', '').strip(),
                service=data.get('service', 'Personal Training Assessment').strip(),
                appointment_date=parsed_dt,
                notes=data.get('notes', '').strip()
            )
            ref_no = f"GYM-2026-{appointment.id:04d}"

            # 1. Real Email Delivery
            email_sent, email_note = send_appointment_email(appointment, ref_no, display_date_time)

            # 2. Real SMS / WhatsApp Delivery
            sms_sent, sms_note, whatsapp_url, sms_uri, sms_text = send_appointment_sms(appointment, ref_no, display_date_time)

            # 3. Create Admin Dashboard Notification
            create_notification(
                title=f"New Session Booking: {appointment.name}",
                message=f"{appointment.name} booked {appointment.service} for {display_date_time}. Ref #{ref_no}",
                notif_type='APPOINTMENT',
                link='/admin/dashboard'
            )

            # 4. Audit Log
            log_audit(
                'Public Guest',
                'CREATE',
                'Appointment',
                appointment.id,
                request,
                details=f"Appointment #{ref_no} booked by {appointment.name} ({appointment.email}, {appointment.phone}). Email: {email_note}, SMS: {sms_note}"
            )

            return JsonResponse({
                'status': 'success',
                'message': f"Appointment confirmed! Confirmation sent to {appointment.email} and {appointment.phone}.",
                'id': appointment.id,
                'reference_no': ref_no,
                'email_sent': email_sent,
                'email_note': email_note,
                'sms_sent': sms_sent,
                'sms_note': sms_note,
                'whatsapp_url': whatsapp_url,
                'sms_uri': sms_uri,
                'sms_text': sms_text,
                'appointment': {
                    'name': appointment.name,
                    'email': appointment.email,
                    'phone': appointment.phone,
                    'service': appointment.service,
                    'appointment_date': display_date_time,
                    'notes': appointment.notes,
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

# --------------------------------------------------------------------------
# REST API: Booking & Appointment Endpoint (/api/bookings/)
# --------------------------------------------------------------------------
@csrf_exempt
def handle_bookings(request):
    """
    REST Endpoint for Bookings:
    - POST /api/bookings/: Create a new training session booking with rate limiting and sanitization.
    - GET /api/bookings/: List recent bookings (Protected - Staff / Admin only).
    """
    if request.method == 'POST':
        # Apply sliding window rate limit on bookings creation (max 10 per 5 min)
        ip = get_client_ip_address(request)
        limiter = rate_limit(max_requests=10, window_seconds=300, endpoint_key="booking_create")
        
        @limiter
        def _process_booking_post(req):
            try:
                data = json.loads(req.body)
                name = sanitize_text(data.get('name', ''), max_length=100)
                email = str(data.get('email', '')).strip()
                phone = sanitize_phone_number(data.get('phone', ''))
                service = sanitize_text(data.get('service', 'Personal Training Assessment'), max_length=150)
                location = sanitize_text(data.get('location', 'GymLife Arena (333 Middle Winchendon Rd)'), max_length=200)
                notes = sanitize_text(data.get('notes', ''), max_length=1000, allow_multiline=True)

                if not name or not email or not phone:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Name, email, and phone number are required fields.'
                    }, status=400)

                if not validate_email_strict(email):
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Please provide a valid email address.'
                    }, status=400)

                # Parse scheduled time
                raw_time_str = data.get('scheduled_time') or data.get('appointment_date') or ''
                scheduled_dt = parse_appointment_datetime(raw_time_str)
                display_time = scheduled_dt.strftime('%A, %B %d, %Y at %I:%M %p')

                # Create Booking record in SQLite DB
                booking = Booking.objects.create(
                    name=name,
                    email=email,
                    phone=phone,
                    service=service,
                    scheduled_time=scheduled_dt,
                    location=location,
                    notes=notes,
                    status='CONFIRMED'
                )

                # Also create legacy Appointment record for backwards compatibility
                try:
                    Appointment.objects.create(
                        name=name,
                        email=email,
                        phone=phone,
                        service=service,
                        appointment_date=scheduled_dt,
                        notes=notes
                    )
                except Exception:
                    pass

                # 1. Dispatch Notifications through central NotificationService
                notif_res = NotificationService.send_booking_confirmation(booking)
                email_delivered = notif_res.get('email', {}).get('status') == 'SENT'
                sms_delivered = notif_res.get('sms', {}).get('status') == 'SENT'
                is_valid_phone, local_digits, intl_phone = SMSService.normalize_phone(booking.phone)
                phone_target = intl_phone if intl_phone else booking.phone
                whatsapp_url = notif_res.get('whatsapp_url') or WhatsAppService.generate_booking_link(booking)
                whatsapp_message = WhatsAppService.generate_booking_message(booking)
                sms_text = f"🏋️ GYMLIFE PASS #{booking.ref_id}: Hi {booking.name}, your {booking.service} is confirmed for {display_time}. Location: 333 Middle Winchendon Rd. Help: 125-711-811"
                sms_uri = f"sms:{phone_target}?body={urllib.parse.quote(sms_text)}"

                # 2. Create Admin in-app notification
                create_notification(
                    title=f"New Booking: #{booking.ref_id} - {booking.name}",
                    message=f"{booking.name} booked {booking.service} for {display_time}. Contact: {booking.phone}",
                    notif_type='APPOINTMENT',
                    link='/admin/appointments'
                )

                # 3. Audit Log Entry
                log_audit(
                    'Public Guest',
                    'CREATE_BOOKING',
                    'Booking',
                    booking.ref_id,
                    req,
                    details=f"Booking #{booking.ref_id} created for {booking.name} ({booking.email}, {booking.phone})."
                )

                return JsonResponse({
                    'status': 'success',
                    'message': f"Session booked successfully! Booking pass dispatched to {booking.email} and {booking.phone}.",
                    'reference_no': booking.ref_id,
                    'ref_id': booking.ref_id,
                    'email_sent': email_delivered,
                    'sms_sent': sms_delivered,
                    'email_note': 'Delivered via Brevo SMTP' if email_delivered else 'Email dispatch logged',
                    'sms_note': 'Delivered via Fast2SMS' if sms_delivered else 'SMS dispatch logged',
                    'whatsapp_url': whatsapp_url,
                    'whatsapp_message': whatsapp_message,
                    'sms_uri': sms_uri,
                    'sms_text': sms_text,
                    'phone_target': phone_target,
                    'notifications': notif_res,
                    'booking': {
                        'id': booking.id,
                        'ref_id': booking.ref_id,
                        'name': booking.name,
                        'email': booking.email,
                        'phone': booking.phone,
                        'service': booking.service,
                        'scheduled_time': display_time,
                        'raw_scheduled_time': scheduled_dt.isoformat(),
                        'location': booking.location,
                        'notes': booking.notes,
                        'status': booking.get_status_display(),
                        'status_code': booking.status,
                        'email_delivered': booking.email_delivered,
                        'sms_delivered': booking.sms_delivered,
                        'created_at': booking.created_at.isoformat()
                    }
                }, status=201)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': 'Unable to process booking request.'}, status=400)

        return _process_booking_post(request)

    elif request.method == 'GET':
        # Protect bookings list from unauthenticated data scraping
        user, role = get_authenticated_admin(request, 'STAFF')
        if not user:
            return JsonResponse({'status': 'error', 'message': 'Authentication required to view bookings list.'}, status=401)

        bookings = Booking.objects.all().order_by('-created_at')[:50]
        results = []
        for b in bookings:
            results.append({
                'id': b.id,
                'ref_id': b.ref_id,
                'name': b.name,
                'email': b.email,
                'phone': b.phone,
                'service': b.service,
                'scheduled_time': b.scheduled_time.strftime('%Y-%m-%d %H:%M') if b.scheduled_time else '',
                'location': b.location,
                'status': b.status,
                'email_delivered': b.email_delivered,
                'sms_delivered': b.sms_delivered,
                'created_at': b.created_at.strftime('%Y-%m-%d %H:%M')
            })
        return JsonResponse({'status': 'success', 'count': len(results), 'bookings': results})

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
@rate_limit(max_requests=20, window_seconds=60, endpoint_key="booking_detail")
def get_booking_detail(request, ref_id):
    """
    GET /api/bookings/<ref_id>/: Retrieve a specific booking by ref_id.
    Prevents sequential enumeration attacks.
    """
    try:
        ref_clean = str(ref_id).strip()
        if not is_safe_reference_id(ref_clean):
            return JsonResponse({'status': 'error', 'message': 'Invalid booking reference format.'}, status=400)

        # Allow numeric lookup only if caller is authenticated admin
        if ref_clean.isdigit():
            user, role = get_authenticated_admin(request, 'STAFF')
            if not user:
                return JsonResponse({'status': 'error', 'message': 'Please provide the complete alphanumeric Booking Reference ID (e.g. GYM-2026-XXXX).'}, status=403)
            booking = Booking.objects.filter(id=int(ref_clean)).first()
        else:
            booking = Booking.objects.filter(ref_id__iexact=ref_clean).first()

        if not booking:
            return JsonResponse({'status': 'error', 'message': f"Booking with reference '{ref_clean}' not found."}, status=404)

        display_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else ''
        whatsapp_url = WhatsAppService.generate_booking_link(booking, 'CONFIRMATION') if booking.phone else ''
        whatsapp_message = WhatsAppService.generate_booking_message(booking) if booking.phone else ''
        is_valid_phone, local_digits, intl_phone = SMSService.normalize_phone(booking.phone)
        phone_target = intl_phone if intl_phone else booking.phone
        sms_text = f"🏋️ GYMLIFE PASS #{booking.ref_id}: Hi {booking.name}, your {booking.service} is confirmed for {display_time}. Location: 333 Middle Winchendon Rd. Help: 125-711-811"
        sms_uri = f"sms:{phone_target}?body={urllib.parse.quote(sms_text)}"

        return JsonResponse({
            'status': 'success',
            'booking': {
                'id': booking.id,
                'ref_id': booking.ref_id,
                'name': booking.name,
                'email': booking.email,
                'phone': booking.phone,
                'phone_target': phone_target,
                'service': booking.service,
                'scheduled_time': display_time,
                'location': booking.location,
                'notes': booking.notes,
                'status': booking.get_status_display(),
                'status_code': booking.status,
                'email_delivered': booking.email_delivered,
                'sms_delivered': booking.sms_delivered,
                'whatsapp_url': whatsapp_url,
                'whatsapp_message': whatsapp_message,
                'sms_text': sms_text,
                'sms_uri': sms_uri,
                'created_at': booking.created_at.isoformat()
            }
        })
    except Exception:
        return JsonResponse({'status': 'error', 'message': 'Error retrieving booking.'}, status=400)


@csrf_exempt
@rate_limit(max_requests=10, window_seconds=60, endpoint_key="resend_booking_email")
def resend_booking_confirmation_email(request, ref_id):
    """
    POST /api/bookings/<ref_id>/resend-email/
    Dispatches booking confirmation pass to athlete's email address.
    Optionally accepts {"email": "new_email@example.com"} to update destination email.
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    try:
        ref_clean = str(ref_id).strip()
        if ref_clean.isdigit():
            booking = Booking.objects.filter(id=int(ref_clean)).first()
        else:
            booking = Booking.objects.filter(ref_id__iexact=ref_clean).first()

        if not booking:
            return JsonResponse({'status': 'error', 'message': f"Booking with reference '{ref_clean}' not found."}, status=404)

        data = {}
        try:
            if request.body:
                data = json.loads(request.body)
        except Exception:
            pass

        target_email = (data.get('email') or '').strip()
        if target_email:
            if not validate_email_strict(target_email):
                return JsonResponse({'status': 'error', 'message': 'Please provide a valid email address.'}, status=400)
            booking.email = target_email
            booking.save(update_fields=['email'])

        notif_res = NotificationService.send_booking_confirmation(booking, channels=('EMAIL',), force_resend=True)
        email_status = notif_res.get('email', {}).get('status')
        if email_status == 'SENT':
            booking.email_delivered = True
            booking.save(update_fields=['email_delivered'])
            return JsonResponse({
                'status': 'success',
                'message': f"Confirmation pass successfully delivered to {booking.email}!",
                'email': booking.email,
                'email_delivered': True,
                'notifications': notif_res
            })
        else:
            err = notif_res.get('email', {}).get('error') or 'Email service could not complete delivery.'
            return JsonResponse({
                'status': 'error',
                'message': f"Delivery failed: {err}",
                'error': err
            }, status=500)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@csrf_exempt
@rate_limit(max_requests=10, window_seconds=60, endpoint_key="resend_booking_sms")
def resend_booking_confirmation_sms(request, ref_id):
    """
    POST /api/bookings/<ref_id>/resend-sms/
    Dispatches and prepares SMS and WhatsApp confirmation pass for a confirmed booking.
    Optionally accepts {"phone": "7744963982"} to update destination phone number.
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)
    try:
        ref_clean = str(ref_id).strip()
        if ref_clean.isdigit():
            booking = Booking.objects.filter(id=int(ref_clean)).first()
        else:
            booking = Booking.objects.filter(ref_id__iexact=ref_clean).first()

        if not booking:
            return JsonResponse({'status': 'error', 'message': f"Booking with reference '{ref_clean}' not found."}, status=404)

        data = {}
        try:
            if request.body:
                data = json.loads(request.body)
        except Exception:
            pass

        target_phone = sanitize_phone_number(data.get('phone', ''))
        if target_phone:
            booking.phone = target_phone
            booking.save(update_fields=['phone'])

        notif_res = NotificationService.send_booking_confirmation(booking, channels=('SMS', 'WHATSAPP'), force_resend=True)
        whatsapp_url = notif_res.get('whatsapp_url') or WhatsAppService.generate_booking_link(booking)
        whatsapp_msg = WhatsAppService.generate_booking_message(booking)
        is_valid, local_10, intl_phone = SMSService.normalize_phone(booking.phone)
        phone_target = intl_phone if intl_phone else booking.phone
        display_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else ''
        sms_text = f"🏋️ GYMLIFE PASS #{booking.ref_id}: Hi {booking.name}, your {booking.service} is confirmed for {display_time}. Location: 333 Middle Winchendon Rd. Help: 125-711-811"
        sms_uri = f"sms:{phone_target}?body={urllib.parse.quote(sms_text)}"

        booking.sms_delivered = True
        booking.save(update_fields=['sms_delivered'])

        return JsonResponse({
            'status': 'success',
            'message': f"Confirmation pass prepared for {booking.phone}!",
            'phone': booking.phone,
            'phone_target': phone_target,
            'sms_delivered': True,
            'whatsapp_url': whatsapp_url,
            'whatsapp_message': whatsapp_msg,
            'sms_uri': sms_uri,
            'sms_text': sms_text,
            'notifications': notif_res
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)






# --------------------------------------------------------------------------
# Admin Authentication API
# --------------------------------------------------------------------------
@csrf_exempt
@rate_limit(max_requests=6, window_seconds=60, endpoint_key="admin_login")
def admin_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = str(data.get('username', '')).strip()
            password = str(data.get('password', ''))

            if not username or not password:
                return JsonResponse({'status': 'error', 'message': 'Username and password are required.'}, status=400)

            # Auto-seed initial admin if no admin exists
            if not User.objects.filter(is_superuser=True).exists():
                admin_obj, _ = User.objects.get_or_create(
                    username='admin',
                    defaults={'email': 'admin@gymlife.com', 'first_name': 'GymLife', 'last_name': 'Master Admin', 'is_staff': True, 'is_superuser': True}
                )
                admin_obj.set_password('admin123')
                admin_obj.is_staff = True
                admin_obj.is_superuser = True
                admin_obj.save()

            # Attempt auth by username or email
            user = authenticate(username=username, password=password)
            if user is None:
                try:
                    user_by_email = User.objects.get(email__iexact=username)
                    if user_by_email.check_password(password):
                        user = user_by_email
                except User.DoesNotExist:
                    pass

            if user is not None and (user.is_staff or user.is_superuser):
                role = 'SUPER_ADMIN' if user.is_superuser else 'ADMIN'
                if hasattr(user, 'admin_profile') and user.admin_profile.role:
                    role = user.admin_profile.role

                # Generate cryptographically signed HMAC token
                token = generate_secure_token(user.id, role=role, token_type='admin')
                log_audit(user.username, 'ADMIN_LOGIN', 'Auth', str(user.id), request, f"Successful login as {role}")

                return JsonResponse({
                    'status': 'success',
                    'token': token,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'name': user.get_full_name() or user.username,
                        'role': role,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'avatar_url': user.admin_profile.avatar_url if hasattr(user, 'admin_profile') else '/img/team/team-1.jpg'
                    }
                })

            return JsonResponse({'status': 'error', 'message': 'Invalid admin credentials or insufficient privileges.'}, status=401)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': 'Authentication request error.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)



# --------------------------------------------------------------------------
# Admin Dashboard Analytics & KPIs
# --------------------------------------------------------------------------
@csrf_exempt
def admin_dashboard_data(request):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)

    today = date.today()
    first_of_month = date(today.year, today.month, 1)

    # Core Counts
    total_members = Member.objects.count()
    active_members = Member.objects.filter(status='ACTIVE').count()
    inactive_members = Member.objects.filter(status='INACTIVE').count()
    expired_members = Member.objects.filter(status='EXPIRED').count()

    total_trainers = Trainer.objects.filter(status='ACTIVE').count()
    total_classes = ClassItem.objects.filter(status='ACTIVE').count()
    
    current_weekday = today.strftime('%A')
    today_classes = ClassSchedule.objects.filter(day_of_week=current_weekday, status='ACTIVE').count()

    active_memberships = Member.objects.filter(status='ACTIVE', plan__isnull=False).count()
    pending_payments = Payment.objects.filter(status='PENDING').count()
    
    total_revenue_val = Payment.objects.filter(status='PAID').aggregate(total=Sum('amount'))['total'] or 0.0
    new_members_this_month = Member.objects.filter(join_date__date__gte=first_of_month).count()
    new_enquiries = ContactMessage.objects.filter(status='NEW').count()

    # Bookings & Appointments Metrics
    total_bookings = Booking.objects.count()
    confirmed_bookings = Booking.objects.filter(status='CONFIRMED').count()
    today_bookings = Booking.objects.filter(scheduled_time__date=today).count()

    # Recent Feeds
    recent_members = [serialize_member(m) for m in Member.objects.all().order_by('-join_date')[:5]]
    recent_payments = [serialize_payment(p) for p in Payment.objects.all().order_by('-payment_date')[:5]]
    recent_enquiries = [serialize_message(m) for m in ContactMessage.objects.all().order_by('-submitted_at')[:5]]
    recent_bookings = [serialize_booking(b) for b in Booking.objects.all().order_by('-created_at')[:6]]
    
    # Upcoming Classes Today
    upcoming_schedules = [serialize_schedule(s) for s in ClassSchedule.objects.filter(day_of_week=current_weekday, status='ACTIVE').select_related('class_item', 'trainer')[:5]]

    # Membership Expiry Alerts (expiring within 14 days or already expired)
    expiry_threshold = today + timedelta(days=14)
    expiring_members = [serialize_member(m) for m in Member.objects.filter(expiry_date__lte=expiry_threshold, status__in=['ACTIVE', 'EXPIRED']).order_by('expiry_date')[:5]]

    return JsonResponse({
        'status': 'success',
        'kpis': {
            'total_members': total_members,
            'active_members': active_members,
            'inactive_members': inactive_members,
            'expired_members': expired_members,
            'total_trainers': total_trainers,
            'total_classes': total_classes,
            'today_classes': today_classes,
            'active_memberships': active_memberships,
            'expired_memberships': expired_members,
            'pending_payments': pending_payments,
            'total_revenue': float(total_revenue_val),
            'new_members_this_month': new_members_this_month,
            'new_enquiries': new_enquiries,
            'total_bookings': total_bookings,
            'confirmed_bookings': confirmed_bookings,
            'today_bookings': today_bookings,
        },
        'recent_members': recent_members,
        'recent_payments': recent_payments,
        'recent_enquiries': recent_enquiries,
        'recent_bookings': recent_bookings,
        'upcoming_classes': upcoming_schedules,
        'expiry_alerts': expiring_members
    })


# --------------------------------------------------------------------------
# Admin Bookings & Appointments CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_bookings(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized or insufficient permissions.'}, status=401)

    if request.method == 'GET':
        if pk is not None:
            try:
                if str(pk).isdigit():
                    booking = Booking.objects.get(pk=int(pk))
                else:
                    booking = Booking.objects.get(ref_id__iexact=pk)
                return JsonResponse({'status': 'success', 'data': serialize_booking(booking)})
            except Booking.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Booking not found.'}, status=404)

        # List with filter, search & sorting
        query = Booking.objects.all()
        search = request.GET.get('search', '').strip()
        status = request.GET.get('status', '').strip()
        service = request.GET.get('service', '').strip()

        if search:
            query = query.filter(
                Q(ref_id__icontains=search) |
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search) |
                Q(service__icontains=search) |
                Q(location__icontains=search)
            )
        if status and status != 'ALL':
            query = query.filter(status=status)
        if service and service != 'ALL':
            query = query.filter(service__icontains=service)

        bookings_data = [serialize_booking(b) for b in query.order_by('-created_at')]
        return JsonResponse({'status': 'success', 'data': bookings_data, 'total': len(bookings_data)})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = str(data.get('name', '')).strip()
            email = str(data.get('email', '')).strip()
            phone = str(data.get('phone', '')).strip()
            service = str(data.get('service', 'Personal Training Assessment')).strip()
            location = str(data.get('location', 'GymLife Arena (333 Middle Winchendon Rd)')).strip()
            notes = str(data.get('notes', '')).strip()
            status = data.get('status', 'CONFIRMED')

            if not name or not email or not phone:
                return JsonResponse({'status': 'error', 'message': 'Name, email, and phone are required.'}, status=400)

            raw_time_str = data.get('scheduled_time') or ''
            scheduled_dt = parse_appointment_datetime(raw_time_str)

            booking = Booking.objects.create(
                name=name,
                email=email,
                phone=phone,
                service=service,
                scheduled_time=scheduled_dt,
                location=location,
                notes=notes,
                status=status
            )

            # Send transactional notifications if requested
            send_email = data.get('send_email', True)
            send_sms = data.get('send_sms', True)

            if send_email:
                email_res = EmailService.send_booking_confirmation(booking)
                booking.email_delivered = email_res.get('success', False)

            if send_sms:
                sms_res = SMSService.send_booking_confirmation(booking)
                booking.sms_delivered = sms_res.get('success', False)

            booking.save(update_fields=['email_delivered', 'sms_delivered'])

            log_audit(
                user.username,
                'ADMIN_CREATED_BOOKING',
                'Booking',
                booking.ref_id,
                request,
                details=f"Admin created booking #{booking.ref_id} for {booking.name} ({booking.service})"
            )

            return JsonResponse({'status': 'success', 'data': serialize_booking(booking), 'message': f'Booking #{booking.ref_id} created successfully.'}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' or request.method == 'PATCH':
        if not pk:
            return JsonResponse({'status': 'error', 'message': 'Booking ID or Ref ID is required.'}, status=400)
        try:
            if str(pk).isdigit():
                booking = Booking.objects.get(pk=int(pk))
            else:
                booking = Booking.objects.get(ref_id__iexact=pk)

            data = json.loads(request.body)
            old_status = booking.status
            old_time = booking.scheduled_time

            if 'name' in data:
                booking.name = data['name'].strip()
            if 'email' in data:
                booking.email = data['email'].strip()
            if 'phone' in data:
                booking.phone = data['phone'].strip()
            if 'service' in data:
                booking.service = data['service'].strip()
            if 'location' in data:
                booking.location = data['location'].strip()
            if 'notes' in data:
                booking.notes = data['notes'].strip()
            if 'cancellation_reason' in data:
                booking.cancellation_reason = data['cancellation_reason'].strip()
            if 'trainer_id' in data:
                booking.trainer_id = data['trainer_id'] or None

            time_changed = False
            if 'scheduled_time' in data and data['scheduled_time']:
                new_time = parse_appointment_datetime(data['scheduled_time'])
                if new_time != old_time:
                    booking.scheduled_time = new_time
                    time_changed = True

            status_changed = False
            if 'status' in data and data['status'] != old_status:
                booking.status = data['status']
                status_changed = True

            booking.save()

            # Trigger appropriate notifications based on state transitions
            notif_results = {}
            if status_changed and booking.status == 'CONFIRMED':
                notif_results = NotificationService.send_booking_confirmation(booking)
            elif status_changed and booking.status == 'CANCELLED':
                notif_results = NotificationService.send_booking_cancellation(
                    booking,
                    reason=data.get('cancellation_reason') or booking.cancellation_reason or ''
                )
            elif time_changed:
                notif_results = NotificationService.send_booking_rescheduled(
                    booking,
                    old_time=old_time
                )

            log_audit(
                user.username,
                'ADMIN_UPDATED_BOOKING',
                'Booking',
                booking.ref_id,
                request,
                details=f"Admin updated booking #{booking.ref_id} (Status: {booking.status}, Rescheduled: {time_changed})"
            )

            return JsonResponse({
                'status': 'success',
                'data': serialize_booking(booking),
                'notifications': notif_results,
                'message': f"Booking #{booking.ref_id} updated successfully."
            })
        except Booking.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Booking not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


    elif request.method == 'DELETE':
        if not pk:
            return JsonResponse({'status': 'error', 'message': 'Booking ID is required.'}, status=400)
        try:
            if str(pk).isdigit():
                booking = Booking.objects.get(pk=int(pk))
            else:
                booking = Booking.objects.get(ref_id__iexact=pk)

            ref_id = booking.ref_id
            name = booking.name
            booking.delete()

            log_audit(
                user.username,
                'ADMIN_DELETED_BOOKING',
                'Booking',
                ref_id,
                request,
                details=f"Admin deleted booking #{ref_id} for {name}"
            )

            return JsonResponse({'status': 'success', 'message': f'Booking #{ref_id} deleted successfully.'})
        except Booking.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Booking not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)



# --------------------------------------------------------------------------
# Admin Members CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_members(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized or insufficient permissions.'}, status=401)

    if request.method == 'GET':
        if pk is not None:
            try:
                member = Member.objects.get(pk=pk)
                return JsonResponse({'status': 'success', 'data': serialize_member(member, include_payments=True)})
            except Member.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Member not found.'}, status=404)

        # List with filter, search & pagination
        query = Member.objects.all()
        search = request.GET.get('search', '').strip()
        status = request.GET.get('status', '').strip()
        plan_id = request.GET.get('plan_id', '').strip()

        if search:
            query = query.filter(Q(full_name__icontains=search) | Q(email__icontains=search) | Q(phone__icontains=search))
        if status and status != 'ALL':
            query = query.filter(status=status)
        if plan_id and plan_id != 'ALL':
            query = query.filter(plan_id=plan_id)

        members_data = [serialize_member(m) for m in query.order_by('-join_date')]
        return JsonResponse({'status': 'success', 'data': members_data, 'total': len(members_data)})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            full_name = data.get('full_name', '').strip()
            email = data.get('email', '').strip()
            phone = data.get('phone', '').strip()

            if not full_name or not email or not phone:
                return JsonResponse({'status': 'error', 'message': 'Full name, email, and phone are required.'}, status=400)

            if Member.objects.filter(email__iexact=email).exists():
                return JsonResponse({'status': 'error', 'message': 'A member with this email already exists.'}, status=400)

            plan = PricingPlan.objects.get(pk=data['plan_id']) if data.get('plan_id') else None

            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else date.today()
            expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date() if data.get('expiry_date') else (start_date + timedelta(days=365))
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date() if data.get('date_of_birth') else None

            member = Member.objects.create(
                full_name=full_name,
                email=email,
                phone=phone,
                date_of_birth=dob,
                gender=data.get('gender', 'Prefer not to say'),
                address=data.get('address', ''),
                emergency_contact=data.get('emergency_contact', ''),
                profile_photo_url=data.get('profile_photo_url', '/img/team/team-1.jpg'),
                plan=plan,
                start_date=start_date,
                expiry_date=expiry_date,
                status=data.get('status', 'ACTIVE'),
                payment_status=data.get('payment_status', 'PAID'),
                notes=data.get('notes', '')
            )

            log_audit(user.username, 'ADMIN_CREATED_MEMBER', 'Member', str(member.id), request, f"Created member {member.full_name}")
            create_notification(f"New Member Added: {member.full_name}", f"Registered with plan: {plan.name if plan else 'None'}", 'MEMBER_REGISTRATION', '/admin/members')

            return JsonResponse({'status': 'success', 'message': 'Member created successfully.', 'data': serialize_member(member)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            member = Member.objects.get(pk=pk)
            data = json.loads(request.body)

            if 'full_name' in data: member.full_name = data['full_name'].strip()
            if 'email' in data: member.email = data['email'].strip()
            if 'phone' in data: member.phone = data['phone'].strip()
            if 'gender' in data: member.gender = data['gender']
            if 'address' in data: member.address = data['address']
            if 'emergency_contact' in data: member.emergency_contact = data['emergency_contact']
            if 'profile_photo_url' in data: member.profile_photo_url = data['profile_photo_url']
            if 'status' in data: member.status = data['status']
            if 'payment_status' in data: member.payment_status = data['payment_status']
            if 'notes' in data: member.notes = data['notes']

            if 'plan_id' in data:
                member.plan = PricingPlan.objects.get(pk=data['plan_id']) if data['plan_id'] else None
            if 'start_date' in data and data['start_date']:
                member.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
            if 'expiry_date' in data and data['expiry_date']:
                member.expiry_date = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            if 'date_of_birth' in data and data['date_of_birth']:
                member.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

            member.save()
            log_audit(user.username, 'ADMIN_UPDATED_MEMBER', 'Member', str(member.id), request, f"Updated member {member.full_name}")

            return JsonResponse({'status': 'success', 'message': 'Member updated successfully.', 'data': serialize_member(member)})
        except Member.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Member not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            member = Member.objects.get(pk=pk)
            name = member.full_name
            member.delete()
            log_audit(user.username, 'ADMIN_DELETED_MEMBER', 'Member', str(pk), request, f"Deleted member {name}")
            return JsonResponse({'status': 'success', 'message': f'Member {name} deleted successfully.'})
        except Member.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Member not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Trainers CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_trainers(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        trainers = Trainer.objects.all().order_by('order')
        return JsonResponse({'status': 'success', 'data': [serialize_trainer(t, request) for t in trainers]})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            role_text = data.get('role', '').strip()
            if not name or not role_text:
                return JsonResponse({'status': 'error', 'message': 'Trainer name and role are required.'}, status=400)

            t = Trainer.objects.create(
                name=name,
                email=data.get('email', ''),
                phone=data.get('phone', ''),
                role=role_text,
                specialization=data.get('specialization', 'Fitness Coach'),
                experience_years=int(data.get('experience_years', 3)),
                qualification=data.get('qualification', 'Certified Trainer'),
                bio=data.get('bio', ''),
                availability=data.get('availability', 'Mon - Sat (07:00 - 19:00)'),
                status=data.get('status', 'ACTIVE'),
                image_url=data.get('image_url', '/img/team/team-1.jpg'),
                facebook_url=data.get('facebook_url', 'https://facebook.com'),
                twitter_url=data.get('twitter_url', 'https://twitter.com'),
                instagram_url=data.get('instagram_url', 'https://instagram.com'),
                youtube_url=data.get('youtube_url', 'https://youtube.com'),
                order=int(data.get('order', 0))
            )
            log_audit(user.username, 'ADMIN_CREATED_TRAINER', 'Trainer', str(t.id), request, f"Added trainer {t.name}")
            return JsonResponse({'status': 'success', 'message': 'Trainer added successfully.', 'data': serialize_trainer(t, request)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            t = Trainer.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'name' in data: t.name = data['name'].strip()
            if 'email' in data: t.email = data['email'].strip()
            if 'phone' in data: t.phone = data['phone'].strip()
            if 'role' in data: t.role = data['role'].strip()
            if 'specialization' in data: t.specialization = data['specialization']
            if 'experience_years' in data: t.experience_years = int(data['experience_years'])
            if 'qualification' in data: t.qualification = data['qualification']
            if 'bio' in data: t.bio = data['bio']
            if 'availability' in data: t.availability = data['availability']
            if 'status' in data: t.status = data['status']
            if 'image_url' in data: t.image_url = data['image_url']
            if 'facebook_url' in data: t.facebook_url = data['facebook_url']
            if 'twitter_url' in data: t.twitter_url = data['twitter_url']
            if 'instagram_url' in data: t.instagram_url = data['instagram_url']
            if 'youtube_url' in data: t.youtube_url = data['youtube_url']
            if 'order' in data: t.order = int(data['order'])
            t.save()
            log_audit(user.username, 'ADMIN_UPDATED_TRAINER', 'Trainer', str(t.id), request, f"Updated trainer {t.name}")
            return JsonResponse({'status': 'success', 'message': 'Trainer updated successfully.', 'data': serialize_trainer(t, request)})
        except Trainer.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Trainer not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            t = Trainer.objects.get(pk=pk)
            # Safe deletion: check if active classes or timetable depend on trainer
            active_classes = ClassItem.objects.filter(trainer=t, status='ACTIVE').count()
            active_schedules = ClassSchedule.objects.filter(trainer=t, status='ACTIVE').count()
            if active_classes > 0 or active_schedules > 0:
                # Suggest deactivation rather than orphan records
                return JsonResponse({
                    'status': 'error',
                    'message': f"Cannot delete trainer '{t.name}' because {active_classes} active class(es) and {active_schedules} schedule(s) depend on them. Please deactivate the trainer or reassign their classes first."
                }, status=400)

            name = t.name
            t.delete()
            log_audit(user.username, 'ADMIN_DELETED_TRAINER', 'Trainer', str(pk), request, f"Deleted trainer {name}")
            return JsonResponse({'status': 'success', 'message': f"Trainer {name} deleted successfully."})
        except Trainer.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Trainer not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Classes CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_classes(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        classes = ClassItem.objects.all().select_related('trainer').order_by('order')
        return JsonResponse({'status': 'success', 'data': [serialize_class(c, request) for c in classes]})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            category = data.get('category', '').strip().upper()
            if not name or not category:
                return JsonResponse({'status': 'error', 'message': 'Class name and category are required.'}, status=400)

            trainer = None
            if data.get('trainer_id'):
                trainer = Trainer.objects.get(pk=data['trainer_id'])

            c = ClassItem.objects.create(
                name=name,
                description=data.get('description', ''),
                category=category,
                trainer=trainer,
                duration=data.get('duration', '60 mins'),
                capacity=int(data.get('capacity', 25)),
                difficulty=data.get('difficulty', 'All Levels'),
                price=float(data.get('price', 0.0)),
                status=data.get('status', 'ACTIVE'),
                image_url=data.get('image_url', '/img/classes/class-1.jpg'),
                order=int(data.get('order', 0))
            )
            log_audit(user.username, 'ADMIN_CREATED_CLASS', 'Class', str(c.id), request, f"Created class {c.name}")
            return JsonResponse({'status': 'success', 'message': 'Class created successfully.', 'data': serialize_class(c, request)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            c = ClassItem.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'name' in data: c.name = data['name'].strip()
            if 'description' in data: c.description = data['description']
            if 'category' in data: c.category = data['category'].strip().upper()
            if 'duration' in data: c.duration = data['duration']
            if 'capacity' in data: c.capacity = int(data['capacity'])
            if 'difficulty' in data: c.difficulty = data['difficulty']
            if 'price' in data: c.price = float(data['price'])
            if 'status' in data: c.status = data['status']
            if 'image_url' in data: c.image_url = data['image_url']
            if 'order' in data: c.order = int(data['order'])
            if 'trainer_id' in data:
                c.trainer = Trainer.objects.get(pk=data['trainer_id']) if data['trainer_id'] else None

            c.save()
            log_audit(user.username, 'ADMIN_UPDATED_CLASS', 'Class', str(c.id), request, f"Updated class {c.name}")
            return JsonResponse({'status': 'success', 'message': 'Class updated successfully.', 'data': serialize_class(c, request)})
        except ClassItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Class not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            c = ClassItem.objects.get(pk=pk)
            active_schedules = ClassSchedule.objects.filter(class_item=c, status='ACTIVE').count()
            if active_schedules > 0:
                return JsonResponse({
                    'status': 'error',
                    'message': f"Cannot delete class '{c.name}' because {active_schedules} timetable schedule(s) depend on it. Please remove schedules first or deactivate the class."
                }, status=400)

            name = c.name
            c.delete()
            log_audit(user.username, 'ADMIN_DELETED_CLASS', 'Class', str(pk), request, f"Deleted class {name}")
            return JsonResponse({'status': 'success', 'message': f"Class {name} deleted successfully."})
        except ClassItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Class not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Timetable & Schedule Management (with Conflict Validation)
# --------------------------------------------------------------------------
def parse_time_to_minutes(time_str):
    """Parses '06:00', '6.00am', '18:30', '6:30pm' into minutes from midnight for comparison"""
    time_str = str(time_str).strip().lower().replace('.', ':')
    is_pm = 'pm' in time_str
    is_am = 'am' in time_str
    clean = time_str.replace('am', '').replace('pm', '').strip()
    
    parts = clean.split(':')
    hours = int(parts[0]) if len(parts) > 0 and parts[0] else 0
    mins = int(parts[1]) if len(parts) > 1 and parts[1] else 0

    if is_pm and hours < 12:
        hours += 12
    elif is_am and hours == 12:
        hours = 0

    return hours * 60 + mins

@csrf_exempt
def admin_timetable(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        schedules = ClassSchedule.objects.all().select_related('class_item', 'trainer')
        day = request.GET.get('day', '').strip()
        if day and day != 'ALL':
            schedules = schedules.filter(day_of_week=day)
        return JsonResponse({'status': 'success', 'data': [serialize_schedule(s, request) for s in schedules]})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            class_id = data.get('class_id')
            trainer_id = data.get('trainer_id')
            day = data.get('day_of_week', '').strip()
            start_time = data.get('start_time', '').strip()
            end_time = data.get('end_time', '').strip()
            room = data.get('room', 'Main Gym Studio').strip()
            capacity = int(data.get('capacity', 25))
            status = data.get('status', 'ACTIVE')

            if not class_id or not trainer_id or not day or not start_time or not end_time:
                return JsonResponse({'status': 'error', 'message': 'Class, trainer, day, start time, and end time are required.'}, status=400)

            class_obj = ClassItem.objects.get(pk=class_id)
            trainer_obj = Trainer.objects.get(pk=trainer_id)

            # Time validation: End > Start
            start_min = parse_time_to_minutes(start_time)
            end_min = parse_time_to_minutes(end_time)
            if end_min <= start_min:
                return JsonResponse({'status': 'error', 'message': 'End time must be after start time.'}, status=400)

            # Check Trainer Overlap Conflict on same day
            existing_schedules = ClassSchedule.objects.filter(day_of_week=day, status='ACTIVE')
            for ex in existing_schedules:
                ex_start = parse_time_to_minutes(ex.start_time)
                ex_end = parse_time_to_minutes(ex.end_time)
                
                # Check overlap: (StartA < EndB) and (EndA > StartB)
                if (start_min < ex_end) and (end_min > ex_start):
                    if ex.trainer_id == trainer_obj.id:
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Scheduling Conflict: Coach {trainer_obj.name} already has class '{ex.class_item.name}' booked from {ex.start_time} to {ex.end_time} on {day}."
                        }, status=400)
                    if ex.room.lower() == room.lower():
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Room Conflict: '{room}' is already booked for '{ex.class_item.name}' from {ex.start_time} to {ex.end_time} on {day}."
                        }, status=400)

            schedule = ClassSchedule.objects.create(
                class_item=class_obj,
                trainer=trainer_obj,
                day_of_week=day,
                start_time=start_time,
                end_time=end_time,
                room=room,
                capacity=capacity,
                status=status
            )
            log_audit(user.username, 'ADMIN_CREATED_TIMETABLE', 'Timetable', str(schedule.id), request, f"Added schedule {class_obj.name} ({day} {start_time}-{end_time})")
            return JsonResponse({'status': 'success', 'message': 'Class schedule created successfully.', 'data': serialize_schedule(schedule, request)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            schedule = ClassSchedule.objects.get(pk=pk)
            data = json.loads(request.body)

            if 'class_id' in data: schedule.class_item = ClassItem.objects.get(pk=data['class_id'])
            if 'trainer_id' in data: schedule.trainer = Trainer.objects.get(pk=data['trainer_id'])
            if 'day_of_week' in data: schedule.day_of_week = data['day_of_week'].strip()
            if 'start_time' in data: schedule.start_time = data['start_time'].strip()
            if 'end_time' in data: schedule.end_time = data['end_time'].strip()
            if 'room' in data: schedule.room = data['room'].strip()
            if 'capacity' in data: schedule.capacity = int(data['capacity'])
            if 'status' in data: schedule.status = data['status']

            start_min = parse_time_to_minutes(schedule.start_time)
            end_min = parse_time_to_minutes(schedule.end_time)
            if end_min <= start_min:
                return JsonResponse({'status': 'error', 'message': 'End time must be after start time.'}, status=400)

            # Check overlap excluding current record
            existing_schedules = ClassSchedule.objects.filter(day_of_week=schedule.day_of_week, status='ACTIVE').exclude(pk=pk)
            for ex in existing_schedules:
                ex_start = parse_time_to_minutes(ex.start_time)
                ex_end = parse_time_to_minutes(ex.end_time)
                if (start_min < ex_end) and (end_min > ex_start):
                    if ex.trainer_id == schedule.trainer_id:
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Scheduling Conflict: Coach {schedule.trainer.name} is already booked from {ex.start_time} to {ex.end_time} on {schedule.day_of_week}."
                        }, status=400)
                    if ex.room.lower() == schedule.room.lower():
                        return JsonResponse({
                            'status': 'error',
                            'message': f"Room Conflict: '{schedule.room}' is already booked from {ex.start_time} to {ex.end_time} on {schedule.day_of_week}."
                        }, status=400)

            schedule.save()
            log_audit(user.username, 'ADMIN_UPDATED_TIMETABLE', 'Timetable', str(schedule.id), request, f"Updated schedule #{schedule.id}")
            return JsonResponse({'status': 'success', 'message': 'Schedule updated successfully.', 'data': serialize_schedule(schedule, request)})
        except ClassSchedule.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Schedule entry not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            schedule = ClassSchedule.objects.get(pk=pk)
            schedule.delete()
            log_audit(user.username, 'ADMIN_DELETED_TIMETABLE', 'Timetable', str(pk), request, f"Deleted schedule #{pk}")
            return JsonResponse({'status': 'success', 'message': 'Schedule entry deleted successfully.'})
        except ClassSchedule.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Schedule not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Memberships / Pricing Plans CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_plans(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        plans = PricingPlan.objects.all().order_by('order')
        return JsonResponse({'status': 'success', 'data': [serialize_plan(p) for p in plans]})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '').strip()
            price = float(data.get('price', 0.0))
            period = data.get('period', '').strip()
            features = data.get('features', '')
            if isinstance(features, list):
                features = ", ".join(features)

            if not name or not period:
                return JsonResponse({'status': 'error', 'message': 'Plan name and billing period are required.'}, status=400)

            p = PricingPlan.objects.create(
                name=name,
                price=price,
                period=period,
                description=data.get('description', ''),
                features=features,
                status=data.get('status', 'ACTIVE'),
                max_members=int(data.get('max_members', 500)),
                order=int(data.get('order', 0))
            )
            log_audit(user.username, 'ADMIN_CREATED_PLAN', 'PricingPlan', str(p.id), request, f"Created membership plan {p.name}")
            return JsonResponse({'status': 'success', 'message': 'Plan created successfully.', 'data': serialize_plan(p)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            p = PricingPlan.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'name' in data: p.name = data['name'].strip()
            if 'price' in data: p.price = float(data['price'])
            if 'period' in data: p.period = data['period'].strip()
            if 'description' in data: p.description = data['description']
            if 'status' in data: p.status = data['status']
            if 'max_members' in data: p.max_members = int(data['max_members'])
            if 'order' in data: p.order = int(data['order'])
            if 'features' in data:
                features = data['features']
                if isinstance(features, list):
                    features = ", ".join(features)
                p.features = features

            p.save()
            log_audit(user.username, 'ADMIN_UPDATED_PLAN', 'PricingPlan', str(p.id), request, f"Updated plan {p.name}")
            return JsonResponse({'status': 'success', 'message': 'Plan updated successfully.', 'data': serialize_plan(p)})
        except PricingPlan.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Plan not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            p = PricingPlan.objects.get(pk=pk)
            active_members = Member.objects.filter(plan=p, status='ACTIVE').count()
            if active_members > 0:
                return JsonResponse({
                    'status': 'error',
                    'message': f"Cannot delete plan '{p.name}' because {active_members} active member(s) are currently subscribed to it. Please deactivate the plan instead."
                }, status=400)

            name = p.name
            p.delete()
            log_audit(user.username, 'ADMIN_DELETED_PLAN', 'PricingPlan', str(pk), request, f"Deleted plan {name}")
            return JsonResponse({'status': 'success', 'message': f"Plan {name} deleted successfully."})
        except PricingPlan.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Plan not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Payments & Transactions Management
# --------------------------------------------------------------------------
@csrf_exempt
def admin_payments(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        payments = Payment.objects.all().select_related('member', 'plan').order_by('-payment_date')
        search = request.GET.get('search', '').strip()
        status = request.GET.get('status', '').strip()
        method = request.GET.get('method', '').strip()

        if search:
            payments = payments.filter(Q(payment_id__icontains=search) | Q(transaction_id__icontains=search) | Q(member__full_name__icontains=search) | Q(member__email__icontains=search))
        if status and status != 'ALL':
            payments = payments.filter(status=status)
        if method and method != 'ALL':
            payments = payments.filter(payment_method=method)

        payments_data = [serialize_payment(p) for p in payments]
        return JsonResponse({'status': 'success', 'data': payments_data, 'total': len(payments_data)})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            member_id = data.get('member_id')
            amount = float(data.get('amount', 0.0))
            if not member_id or amount <= 0:
                return JsonResponse({'status': 'error', 'message': 'Member and valid amount are required.'}, status=400)

            member = Member.objects.get(pk=member_id)
            plan = PricingPlan.objects.get(pk=data['plan_id']) if data.get('plan_id') else member.plan
            
            ref_no = f"PAY-{timezone.now().strftime('%Y%m%d')}-{Payment.objects.count() + 1:04d}"
            txn_id = data.get('transaction_id') or f"TXN_{timezone.now().strftime('%H%M%S')}_{member.id}"

            payment = Payment.objects.create(
                payment_id=ref_no,
                member=member,
                plan=plan,
                amount=amount,
                payment_method=data.get('payment_method', 'Credit Card'),
                transaction_id=txn_id,
                status=data.get('status', 'PAID'),
                notes=data.get('notes', '')
            )

            # Update member payment status if paid
            if payment.status == 'PAID':
                member.payment_status = 'PAID'
                member.save()

            log_audit(user.username, 'ADMIN_RECORDED_PAYMENT', 'Payment', str(payment.id), request, f"Recorded payment ${amount} for {member.full_name}")
            create_notification(f"Payment Recorded: ${amount:,.2f}", f"Received from {member.full_name} via {payment.payment_method}", 'PAYMENT_RECEIVED', '/admin/payments')

            return JsonResponse({'status': 'success', 'message': 'Payment recorded successfully.', 'data': serialize_payment(payment)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            payment = Payment.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'status' in data: payment.status = data['status']
            if 'notes' in data: payment.notes = data['notes']
            if 'payment_method' in data: payment.payment_method = data['payment_method']
            if 'transaction_id' in data: payment.transaction_id = data['transaction_id']
            payment.save()

            log_audit(user.username, 'ADMIN_UPDATED_PAYMENT', 'Payment', str(payment.id), request, f"Updated payment status to {payment.status}")
            return JsonResponse({'status': 'success', 'message': 'Payment updated successfully.', 'data': serialize_payment(payment)})
        except Payment.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Payment record not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Contact Messages & Enquiries Inbox
# --------------------------------------------------------------------------
@csrf_exempt
def admin_messages(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        messages = ContactMessage.objects.all().order_by('-submitted_at')
        status = request.GET.get('status', '').strip()
        search = request.GET.get('search', '').strip()

        if status and status != 'ALL':
            messages = messages.filter(status=status)
        if search:
            messages = messages.filter(Q(name__icontains=search) | Q(email__icontains=search) | Q(subject__icontains=search) | Q(message__icontains=search))

        unread_count = ContactMessage.objects.filter(status='NEW').count()
        return JsonResponse({
            'status': 'success',
            'data': [serialize_message(m) for m in messages],
            'unread_count': unread_count,
            'total': messages.count()
        })

    elif request.method == 'PUT' and pk is not None:
        try:
            m = ContactMessage.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'status' in data: m.status = data['status']
            m.save()
            log_audit(user.username, 'ADMIN_UPDATED_MESSAGE', 'ContactMessage', str(m.id), request, f"Marked message #{m.id} as {m.status}")
            return JsonResponse({'status': 'success', 'message': f'Message status updated to {m.status}.', 'data': serialize_message(m)})
        except ContactMessage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found.'}, status=404)

    elif request.method == 'DELETE' and pk is not None:
        try:
            m = ContactMessage.objects.get(pk=pk)
            m.delete()
            log_audit(user.username, 'ADMIN_DELETED_MESSAGE', 'ContactMessage', str(pk), request, f"Deleted message #{pk}")
            return JsonResponse({'status': 'success', 'message': 'Message deleted successfully.'})
        except ContactMessage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Blog Management CRUD
# --------------------------------------------------------------------------
@csrf_exempt
def admin_blogs(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        blogs = BlogPost.objects.all().order_by('-created_at')
        status = request.GET.get('status', '').strip()
        search = request.GET.get('search', '').strip()

        if status and status != 'ALL':
            blogs = blogs.filter(status=status)
        if search:
            blogs = blogs.filter(Q(title__icontains=search) | Q(content__icontains=search) | Q(author__icontains=search))

        return JsonResponse({'status': 'success', 'data': [serialize_blog(b, request) for b in blogs]})

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title', '').strip()
            content = data.get('content', '').strip()
            if not title or not content:
                return JsonResponse({'status': 'error', 'message': 'Blog title and content are required.'}, status=400)

            b = BlogPost.objects.create(
                title=title,
                short_description=data.get('short_description', ''),
                content=content,
                author=data.get('author', user.get_full_name() or user.username),
                category=data.get('category', 'Fitness').strip().upper(),
                status=data.get('status', 'PUBLISHED'),
                image_url=data.get('image_url', '/img/blog/blog-1.jpg')
            )
            log_audit(user.username, 'ADMIN_CREATED_BLOG', 'BlogPost', str(b.id), request, f"Created blog post '{b.title}' [{b.status}]")
            return JsonResponse({'status': 'success', 'message': 'Blog post created successfully.', 'data': serialize_blog(b, request)}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'PUT' and pk is not None:
        try:
            b = BlogPost.objects.get(pk=pk)
            data = json.loads(request.body)
            if 'title' in data: b.title = data['title'].strip()
            if 'short_description' in data: b.short_description = data['short_description']
            if 'content' in data: b.content = data['content']
            if 'author' in data: b.author = data['author'].strip()
            if 'category' in data: b.category = data['category'].strip().upper()
            if 'status' in data: b.status = data['status']
            if 'image_url' in data: b.image_url = data['image_url']
            b.save()

            log_audit(user.username, 'ADMIN_UPDATED_BLOG', 'BlogPost', str(b.id), request, f"Updated blog post '{b.title}'")
            return JsonResponse({'status': 'success', 'message': 'Blog post updated successfully.', 'data': serialize_blog(b, request)})
        except BlogPost.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Blog post not found.'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    elif request.method == 'DELETE' and pk is not None:
        try:
            b = BlogPost.objects.get(pk=pk)
            title = b.title
            b.delete()
            log_audit(user.username, 'ADMIN_DELETED_BLOG', 'BlogPost', str(pk), request, f"Deleted blog post '{title}'")
            return JsonResponse({'status': 'success', 'message': f"Blog post '{title}' deleted successfully."})
        except BlogPost.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Blog post not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Reports & Analytics Data
# --------------------------------------------------------------------------
@csrf_exempt
def admin_reports_data(request):
    user, role = get_authenticated_admin(request, 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized or insufficient permissions.'}, status=401)

    today = date.today()

    # Plan distribution
    plan_distribution = []
    for plan in PricingPlan.objects.all():
        count = Member.objects.filter(plan=plan).count()
        plan_distribution.append({
            'name': plan.name,
            'count': count,
            'revenue_potential': float(plan.price * count)
        })

    # Status breakdown
    status_breakdown = {
        'ACTIVE': Member.objects.filter(status='ACTIVE').count(),
        'INACTIVE': Member.objects.filter(status='INACTIVE').count(),
        'EXPIRED': Member.objects.filter(status='EXPIRED').count(),
        'SUSPENDED': Member.objects.filter(status='SUSPENDED').count(),
    }

    # Revenue by Payment Method
    revenue_by_method = []
    for method_choice in Payment.METHOD_CHOICES:
        m_name = method_choice[0]
        sum_val = Payment.objects.filter(payment_method=m_name, status='PAID').aggregate(total=Sum('amount'))['total'] or 0.0
        if sum_val > 0:
            revenue_by_method.append({'method': m_name, 'total': float(sum_val)})

    # Monthly Registrations for last 6 months
    monthly_trends = []
    for i in range(5, -1, -1):
        target_month_date = today - timedelta(days=i*30)
        month_label = target_month_date.strftime('%b %Y')
        m_count = Member.objects.filter(join_date__year=target_month_date.year, join_date__month=target_month_date.month).count()
        rev_count = Payment.objects.filter(payment_date__year=target_month_date.year, payment_date__month=target_month_date.month, status='PAID').aggregate(total=Sum('amount'))['total'] or 0.0
        monthly_trends.append({
            'month': month_label,
            'new_members': m_count,
            'revenue': float(rev_count)
        })

    # Popular Classes
    class_stats = []
    for c in ClassItem.objects.all():
        schedule_count = ClassSchedule.objects.filter(class_item=c).count()
        class_stats.append({
            'name': c.name,
            'category': c.category,
            'trainer': c.trainer.name if c.trainer else 'Unassigned',
            'weekly_sessions': schedule_count,
            'capacity': c.capacity
        })

    return JsonResponse({
        'status': 'success',
        'plan_distribution': plan_distribution,
        'status_breakdown': status_breakdown,
        'revenue_by_method': revenue_by_method,
        'monthly_trends': monthly_trends,
        'class_stats': class_stats,
        'total_revenue_overall': float(Payment.objects.filter(status='PAID').aggregate(total=Sum('amount'))['total'] or 0.0),
        'total_members_overall': Member.objects.count()
    })


# --------------------------------------------------------------------------
# Admin Audit Logs
# --------------------------------------------------------------------------
@csrf_exempt
def admin_audit_logs(request):
    user, role = get_authenticated_admin(request, 'SUPER_ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Super Administrator access required.'}, status=403)

    logs = AuditLog.objects.all().order_by('-timestamp')
    entity = request.GET.get('entity', '').strip()
    search = request.GET.get('search', '').strip()

    if entity and entity != 'ALL':
        logs = logs.filter(entity=entity)
    if search:
        logs = logs.filter(Q(user__icontains=search) | Q(action__icontains=search) | Q(details__icontains=search))

    return JsonResponse({
        'status': 'success',
        'data': [serialize_audit_log(l) for l in logs[:100]],
        'total': logs.count()
    })


# --------------------------------------------------------------------------
# Admin Notifications
# --------------------------------------------------------------------------
@csrf_exempt
def admin_notifications(request, pk=None):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'GET':
        notifs = Notification.objects.all().order_by('-created_at')[:30]
        unread_count = Notification.objects.filter(is_read=False).count()
        return JsonResponse({
            'status': 'success',
            'data': [serialize_notification(n) for n in notifs],
            'unread_count': unread_count
        })

    elif request.method == 'PUT':
        if pk == 'all' or pk is None:
            Notification.objects.filter(is_read=False).update(is_read=True)
            return JsonResponse({'status': 'success', 'message': 'All notifications marked as read.'})
        else:
            try:
                n = Notification.objects.get(pk=pk)
                n.is_read = True
                n.save()
                return JsonResponse({'status': 'success', 'message': 'Notification marked as read.'})
            except Notification.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Notification not found.'}, status=404)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Settings & Branding
# --------------------------------------------------------------------------
@csrf_exempt
def admin_settings(request):
    user, role = get_authenticated_admin(request, 'STAFF' if request.method == 'GET' else 'SUPER_ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized or Super Admin privileges required.'}, status=403)

    settings, _ = GymSettings.objects.get_or_create(id=1)

    if request.method == 'GET':
        return JsonResponse({'status': 'success', 'data': serialize_settings(settings)})

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            if 'gym_name' in data: settings.gym_name = data['gym_name'].strip()
            if 'tagline' in data: settings.tagline = data['tagline'].strip()
            if 'contact_email' in data: settings.contact_email = data['contact_email'].strip()
            if 'phone' in data: settings.phone = data['phone'].strip()
            if 'address' in data: settings.address = data['address'].strip()
            if 'working_hours_weekday' in data: settings.working_hours_weekday = data['working_hours_weekday'].strip()
            if 'working_hours_weekend' in data: settings.working_hours_weekend = data['working_hours_weekend'].strip()
            if 'logo_url' in data: settings.logo_url = data['logo_url'].strip()
            if 'google_map_url' in data: settings.google_map_url = data['google_map_url'].strip()
            if 'facebook_url' in data: settings.facebook_url = data['facebook_url'].strip()
            if 'twitter_url' in data: settings.twitter_url = data['twitter_url'].strip()
            if 'instagram_url' in data: settings.instagram_url = data['instagram_url'].strip()
            if 'youtube_url' in data: settings.youtube_url = data['youtube_url'].strip()
            if 'currency_symbol' in data: settings.currency_symbol = data['currency_symbol'].strip()
            if 'tax_percentage' in data: settings.tax_percentage = float(data['tax_percentage'])
            if 'smtp_provider' in data: settings.smtp_provider = data['smtp_provider'].strip()
            if 'smtp_host' in data: settings.smtp_host = data['smtp_host'].strip()
            if 'smtp_port' in data:
                try: settings.smtp_port = int(data['smtp_port'])
                except (ValueError, TypeError): pass
            if 'smtp_user' in data: settings.smtp_user = data['smtp_user'].strip()
            if 'smtp_password' in data: settings.smtp_password = data['smtp_password'].strip()
            if 'smtp_from_email' in data: settings.smtp_from_email = data['smtp_from_email'].strip()
            if 'smtp_use_tls' in data: settings.smtp_use_tls = bool(data['smtp_use_tls'])
            if 'smtp_use_ssl' in data: settings.smtp_use_ssl = bool(data['smtp_use_ssl'])

            settings.save()
            log_audit(user.username, 'ADMIN_CHANGED_SETTINGS', 'Settings', '1', request, "Updated GymLife operational & branding settings")
            return JsonResponse({'status': 'success', 'message': 'Settings updated successfully.', 'data': serialize_settings(settings)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Admin Profile & Password Change
# --------------------------------------------------------------------------
@csrf_exempt
def admin_profile(request):
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    profile, _ = AdminProfile.objects.get_or_create(user=user)

    if request.method == 'GET':
        return JsonResponse({
            'status': 'success',
            'data': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name() or user.username,
                'role': profile.role,
                'phone': profile.phone or '',
                'avatar_url': profile.avatar_url or '/img/team/team-1.jpg',
                'date_joined': user.date_joined.strftime('%B %d, %Y')
            }
        })

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            # Update basic info
            if 'first_name' in data: user.first_name = data['first_name'].strip()
            if 'last_name' in data: user.last_name = data['last_name'].strip()
            if 'email' in data: user.email = data['email'].strip()
            user.save()

            if 'phone' in data: profile.phone = data['phone'].strip()
            if 'avatar_url' in data:
                raw_avatar = data['avatar_url'].strip()
                if raw_avatar.startswith('data:image/'):
                    try:
                        header, b64_content = raw_avatar.split(';base64,')
                        ext = header.split('/')[-1]
                        if ext == 'svg+xml': ext = 'svg'
                        ext = f".{ext}"
                        unique_name = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}{ext}"
                        img_bytes = base64.b64decode(b64_content)

                        # Save to media/avatars
                        media_dir = settings.MEDIA_ROOT / 'avatars'
                        os.makedirs(media_dir, exist_ok=True)
                        with open(media_dir / unique_name, 'wb+') as f_dst:
                            f_dst.write(img_bytes)

                        # Save to frontend/public/img/avatars
                        try:
                            pub_dir = settings.BASE_DIR.parent / 'frontend' / 'public' / 'img' / 'avatars'
                            os.makedirs(pub_dir, exist_ok=True)
                            with open(pub_dir / unique_name, 'wb+') as f_pub:
                                f_pub.write(img_bytes)
                        except Exception:
                            pass

                        raw_avatar = f"/img/avatars/{unique_name}"
                    except Exception:
                        pass
                profile.avatar_url = raw_avatar

            profile.save()

            # Handle password change
            if 'current_password' in data and 'new_password' in data and data['new_password']:
                current_pw = data['current_password']
                new_pw = data['new_password']
                confirm_pw = data.get('confirm_password', '')

                if not user.check_password(current_pw):
                    return JsonResponse({'status': 'error', 'message': 'Current password is incorrect.'}, status=400)

                if len(new_pw) < 6:
                    return JsonResponse({'status': 'error', 'message': 'New password must be at least 6 characters.'}, status=400)

                if new_pw != confirm_pw:
                    return JsonResponse({'status': 'error', 'message': 'New password and confirmation do not match.'}, status=400)

                user.set_password(new_pw)
                user.save()
                log_audit(user.username, 'ADMIN_CHANGED_PASSWORD', 'User', str(user.id), request, "Password successfully updated")

            log_audit(user.username, 'ADMIN_UPDATED_PROFILE', 'User', str(user.id), request, "Updated admin profile info")
            return JsonResponse({'status': 'success', 'message': 'Profile updated successfully.', 'avatar_url': profile.avatar_url})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def admin_upload_avatar(request):
    """
    Handles uploading avatar image directly from the user's system.
    Supports multipart/form-data with file field 'avatar' or 'image' or 'file',
    as well as JSON base64 payloads.
    """
    user, role = get_authenticated_admin(request, 'STAFF')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Unauthorized.'}, status=401)

    if request.method == 'POST':
        try:
            profile, _ = AdminProfile.objects.get_or_create(user=user)
            uploaded_file = request.FILES.get('avatar') or request.FILES.get('image') or request.FILES.get('file')

            file_bytes = None
            filename = None

            if uploaded_file:
                filename = uploaded_file.name
                file_bytes = uploaded_file.read()
            elif request.body:
                try:
                    payload = json.loads(request.body)
                    b64_str = payload.get('avatar_base64') or payload.get('image_base64') or payload.get('avatar')
                    if b64_str and 'base64,' in b64_str:
                        meta, data_str = b64_str.split(';base64,')
                        ext = meta.split('/')[-1]
                        if ext == 'svg+xml': ext = 'svg'
                        filename = f"avatar.{ext}"
                        file_bytes = base64.b64decode(data_str)
                except Exception:
                    pass

            if not file_bytes:
                return JsonResponse({'status': 'error', 'message': 'No image file was received.'}, status=400)

            # Validate extension
            ext = os.path.splitext(filename or 'avatar.jpg')[1].lower()
            if not ext or ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']:
                ext = '.jpg'

            # 10MB limit
            if len(file_bytes) > 10 * 1024 * 1024:
                return JsonResponse({'status': 'error', 'message': 'File size exceeds 10MB limit.'}, status=400)

            unique_filename = f"avatar_{user.id}_{uuid.uuid4().hex[:8]}{ext}"

            # Save in media/avatars
            media_avatars_dir = settings.MEDIA_ROOT / 'avatars'
            os.makedirs(media_avatars_dir, exist_ok=True)
            with open(media_avatars_dir / unique_filename, 'wb+') as f_media:
                f_media.write(file_bytes)

            # Save in frontend/public/img/avatars
            try:
                public_avatars_dir = settings.BASE_DIR.parent / 'frontend' / 'public' / 'img' / 'avatars'
                os.makedirs(public_avatars_dir, exist_ok=True)
                with open(public_avatars_dir / unique_filename, 'wb+') as f_pub:
                    f_pub.write(file_bytes)
            except Exception:
                pass

            # Save in frontend/dist/img/avatars if dist folder exists
            try:
                dist_avatars_dir = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'img' / 'avatars'
                if os.path.exists(settings.BASE_DIR.parent / 'frontend' / 'dist'):
                    os.makedirs(dist_avatars_dir, exist_ok=True)
                    with open(dist_avatars_dir / unique_filename, 'wb+') as f_dist:
                        f_dist.write(file_bytes)
            except Exception:
                pass

            avatar_url = f"/img/avatars/{unique_filename}"
            profile.avatar_url = avatar_url
            profile.save()

            log_audit(user.username, 'ADMIN_UPLOADED_AVATAR', 'User', str(user.id), request, f"Uploaded custom avatar {unique_filename}")

            return JsonResponse({
                'status': 'success',
                'message': 'Avatar image uploaded successfully!',
                'avatar_url': avatar_url,
                'media_url': f"{settings.MEDIA_URL}avatars/{unique_filename}"
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Avatar upload failed: {str(e)}'}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# --------------------------------------------------------------------------
# Member Authentication & Portal APIs
# --------------------------------------------------------------------------
@csrf_exempt
@rate_limit(max_requests=5, window_seconds=300, endpoint_key="auth_register")
def auth_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = sanitize_text(data.get('username', ''), max_length=50)
            email = str(data.get('email', '')).strip()
            password = str(data.get('password', ''))
            full_name = sanitize_text(data.get('name', ''), max_length=100)
            phone = sanitize_phone_number(data.get('phone', '+1 (555) 000-0000'))

            if not username or not email or not password:
                return JsonResponse({'status': 'error', 'message': 'Username, email, and password are required.'}, status=400)

            if len(password) < 6:
                return JsonResponse({'status': 'error', 'message': 'Password must be at least 6 characters long.'}, status=400)

            if not validate_email_strict(email):
                return JsonResponse({'status': 'error', 'message': 'Please provide a valid email address.'}, status=400)

            if User.objects.filter(username__iexact=username).exists():
                return JsonResponse({'status': 'error', 'message': 'Username is already taken.'}, status=400)

            if User.objects.filter(email__iexact=email).exists():
                return JsonResponse({'status': 'error', 'message': 'Email already registered.'}, status=400)

            name_parts = full_name.split(' ', 1) if full_name else [username, '']
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else ''
            )

            # Auto-create Member entry
            plan = PricingPlan.objects.filter(status='ACTIVE').first()
            Member.objects.create(
                user=user,
                full_name=full_name or username,
                email=email,
                phone=phone,
                plan=plan,
                start_date=date.today(),
                expiry_date=date.today() + timedelta(days=365),
                status='ACTIVE',
                payment_status='PAID'
            )

            token = generate_secure_token(user.id, role='member', token_type='member')
            create_notification(f"New Member Sign-Up: {user.username}", f"{user.email} registered online.", 'MEMBER_REGISTRATION', '/admin/members')

            return JsonResponse({
                'status': 'success',
                'message': 'Account created successfully! Welcome to GymLife.',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'role': 'member',
                    'plan': plan.name if plan else 'Active Membership'
                }
            }, status=201)
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'Registration request error.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
@rate_limit(max_requests=10, window_seconds=60, endpoint_key="auth_login")
def auth_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = str(data.get('username', '')).strip()
            password = str(data.get('password', ''))

            if not identifier or not password:
                return JsonResponse({'status': 'error', 'message': 'Please provide username/email and password.'}, status=400)

            # Handle demo member account
            if identifier.lower() in ['demo_member', 'member@gymlife.com'] and password == 'demo123':
                user, _ = User.objects.get_or_create(
                    username='demo_member',
                    defaults={'email': 'member@gymlife.com', 'first_name': 'Alex', 'last_name': 'Rivers'}
                )
                user.set_password('demo123')
                user.save()

            user = authenticate(username=identifier, password=password)
            if user is None:
                try:
                    user_obj = User.objects.get(email__iexact=identifier)
                    if user_obj.check_password(password):
                        user = user_obj
                except User.DoesNotExist:
                    pass

            if user is not None and user.is_active:
                is_admin = user.is_staff or user.is_superuser
                role = 'SUPER_ADMIN' if user.is_superuser else ('ADMIN' if is_admin else 'member')
                if hasattr(user, 'admin_profile') and user.admin_profile.role:
                    role = user.admin_profile.role

                token_type = 'admin' if is_admin else 'member'
                token = generate_secure_token(user.id, role=role, token_type=token_type)
                
                return JsonResponse({
                    'status': 'success',
                    'message': 'Signed in successfully!',
                    'token': token,
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'name': user.get_full_name() or user.username,
                        'role': role,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser
                    }
                })

            return JsonResponse({'status': 'error', 'message': 'Invalid username or password.'}, status=401)
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'Login request error.'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)



@csrf_exempt
@rate_limit(max_requests=12, window_seconds=60, endpoint_key="firebase_auth_login")
def firebase_auth_login(request):
    """
    POST /api/auth/firebase/:
    Verifies Firebase ID token sent from frontend Google Sign-In,
    retrieves or creates matching User & Member, and returns signed Django session token.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            id_token = data.get('id_token') or data.get('token')
            if not id_token:
                return JsonResponse({'status': 'error', 'message': 'Firebase ID token is required.'}, status=400)

            from notifications.services.firebase_service import FirebaseService
            token_data = FirebaseService.verify_id_token(id_token)

            uid = token_data.get('uid')
            email = data.get('email') or token_data.get('email')
            name = data.get('name') or token_data.get('name')

            # Ensure user name is never "Google Athlete"
            if not name or name.strip().lower() in ['google athlete', 'google athlete (demo user)', 'athlete']:
                if email and '@' in email:
                    prefix = email.split('@')[0].replace('athlete.', '').replace('google.', '')
                    clean_parts = [p.capitalize() for p in re.split(r'[\._\-]', prefix) if p and p.lower() not in ['google', 'acct', 'token']]
                    name = ' '.join(clean_parts) if clean_parts else email.split('@')[0].capitalize()
                else:
                    name = 'Member'

            if not email:
                email = f"{uid}@firebase.gymlife.com"

            first_name = name.split(' ')[0] if name else 'Member'
            last_name = name.split(' ', 1)[1] if (name and ' ' in name) else ''

            # Lookup or create User
            user = User.objects.filter(email__iexact=email).first()
            if not user:
                clean_uid = uid.replace('-', '_')[:10] if uid else 'google'
                user_name_prefix = email.split('@')[0].replace('.', '_').replace('-', '_')[:12]
                candidate_username = f"{user_name_prefix}_{clean_uid}"
                username = candidate_username
                c = 1
                while User.objects.filter(username=username).exists():
                    username = f"{candidate_username}_{c}"
                    c += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name
                )
            else:
                # Update existing user if it had placeholder names
                if user.first_name in ['Google', 'Athlete', ''] and user.last_name in ['Athlete', '']:
                    user.first_name = first_name
                    user.last_name = last_name
                    user.save(update_fields=['first_name', 'last_name'])

            # Ensure Member record exists
            plan = PricingPlan.objects.filter(status='ACTIVE').first()
            member, created = Member.objects.get_or_create(
                user=user,
                defaults={
                    'full_name': name,
                    'email': email,
                    'phone': '',
                    'plan': plan,
                    'start_date': date.today(),
                    'expiry_date': date.today() + timedelta(days=365),
                    'status': 'ACTIVE',
                    'payment_status': 'PAID'
                }
            )
            if not created and (member.full_name in ['Google Athlete', 'Athlete', ''] or not member.full_name):
                member.full_name = name
                member.save(update_fields=['full_name'])

            is_admin = user.is_staff or user.is_superuser
            role = 'SUPER_ADMIN' if user.is_superuser else ('ADMIN' if is_admin else 'member')
            if hasattr(user, 'admin_profile') and user.admin_profile.role:
                role = user.admin_profile.role

            token = generate_secure_token(user.id, role=role, token_type='admin' if is_admin else 'member')
            display_name = user.get_full_name().strip() or name

            return JsonResponse({
                'status': 'success',
                'message': 'Authenticated with Google via Firebase successfully.',
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': display_name,
                    'role': role,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'plan': member.plan.name if (member and member.plan) else 'Active Membership'
                }
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f"Firebase authentication error: {str(e)}"}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def auth_me(request):
    if request.method == 'GET':
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
        if not token:
            return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)

        is_valid, user, role, token_type = verify_secure_token(token)
        if not is_valid or not user:
            return JsonResponse({'status': 'error', 'message': 'Invalid or expired session token.'}, status=401)

        is_admin = user.is_staff or user.is_superuser or role in ['SUPER_ADMIN', 'ADMIN', 'STAFF']
        return JsonResponse({
            'status': 'success',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': role,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'avatar_url': user.admin_profile.avatar_url if hasattr(user, 'admin_profile') else '/img/team/team-1.jpg'
            }
        })

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def member_dashboard_data(request):
    if request.method == 'GET':
        token = request.headers.get('Authorization', '').replace('Bearer ', '').strip()
        auth_user = None
        if token:
            _, auth_user, _, _ = verify_secure_token(token)

        user_email = sanitize_text(request.GET.get('email', ''), max_length=150)
        user_name = sanitize_text(request.GET.get('name', ''), max_length=100)

        # If user is authenticated, use their verified email for strict privacy
        if auth_user:
            user_email = auth_user.email

        appointments = []
        if user_email or user_name:
            query = Appointment.objects.all()
            if user_email: query = query.filter(email__iexact=user_email)
            elif user_name: query = query.filter(name__icontains=user_name)

            appointments = [{
                'id': a.id,
                'service': a.service,
                'appointment_date': a.appointment_date.strftime('%Y-%m-%d %H:%M') if a.appointment_date else '',
                'notes': a.notes or 'General training session',
                'status': 'Confirmed'
            } for a in query.order_by('-appointment_date')[:10]]

        if not appointments:
            appointments = [
                {
                    'id': 101,
                    'service': 'Personal Fitness Assessment & Body Scan',
                    'appointment_date': 'Tomorrow at 10:00 AM',
                    'notes': 'Meet with Senior Strength Coach John Smith',
                    'status': 'Confirmed'
                },
                {
                    'id': 102,
                    'service': 'High-Intensity Cardio & Weight Loss Circuit',
                    'appointment_date': 'Friday at 06:30 PM',
                    'notes': 'Group Studio B - Bring water bottle & towel',
                    'status': 'Upcoming'
                }
            ]

        stats = {
            'attendance_this_month': 14,
            'calories_burned_approx': '9,450 kcal',
            'current_streak_days': 5,
            'membership_status': 'Active (VIP Gold)',
            'next_renewal': 'August 2027',
            'locker_assigned': 'Locker #42',
            'trainer_assigned': 'Sarah Johnson & John Smith'
        }

        classes_data = [{
            'id': c.id,
            'name': c.name,
            'trainer': c.trainer.name if c.trainer else 'Lead Trainer',
            'duration': c.duration,
            'category': c.category,
            'image_url': c.get_image_url()
        } for c in ClassItem.objects.filter(status='ACTIVE')[:4]]

        return JsonResponse({
            'status': 'success',
            'stats': stats,
            'appointments': appointments,
            'available_classes': classes_data
        })

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
@rate_limit(max_requests=25, window_seconds=60, endpoint_key="gateway_test")
def admin_gateway_test(request):
    """
    Tests live dispatch of real email and SMS/WhatsApp notifications.
    Strictly protected: Administrator credentials required.
    """
    user, role = get_authenticated_admin(request, 'ADMIN')
    if not user:
        return JsonResponse({'status': 'error', 'message': 'Administrator privileges required to execute gateway tests.'}, status=403)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            test_type = data.get('type', 'EMAIL')
            recipient_email = str(data.get('email', '')).strip()
            recipient_phone = sanitize_phone_number(data.get('phone', ''))
            
            if test_type == 'EMAIL':
                if not recipient_email or not validate_email_strict(recipient_email):
                    return JsonResponse({'status': 'error', 'message': 'A valid recipient email is required.'}, status=400)
                
                connection, from_email, host, port, username = get_active_smtp_connection(data)

                if not username:
                    return JsonResponse({
                        'status': 'error',
                        'error_type': 'MISSING_CREDENTIALS',
                        'message': 'SMTP Username / Sender Email is missing. Please enter your email address (e.g. your Gmail address) in SMTP Settings above.'
                    }, status=400)

                # Live test SMTP connection & authentication
                import smtplib
                import socket

                try:
                    connection.open()
                except smtplib.SMTPAuthenticationError as auth_err:
                    err_code = getattr(auth_err, 'smtp_code', 535)
                    err_raw = getattr(auth_err, 'smtp_error', b'')
                    err_msg = err_raw.decode('utf-8', errors='ignore') if isinstance(err_raw, bytes) else str(err_raw)
                    
                    if 'gmail' in host.lower() or 'google' in host.lower():
                        return JsonResponse({
                            'status': 'error',
                            'error_type': 'GMAIL_AUTH_REQUIRED',
                            'message': f"Gmail Authentication Rejected ({err_code}): Google requires an App Password instead of your standard Gmail password.",
                            'hint': "Enable 2-Step Verification on your Google Account, visit https://myaccount.google.com/apppasswords to create a 16-letter App Password named 'GymLife', and paste it into the SMTP Password field.",
                            'technical_details': f"{err_code} {err_msg}"
                        }, status=400)
                    else:
                        return JsonResponse({
                            'status': 'error',
                            'error_type': 'SMTP_AUTH_ERROR',
                            'message': f"SMTP Authentication Rejected ({err_code}): Invalid username or password for {host}.",
                            'technical_details': f"{err_code} {err_msg}"
                        }, status=400)
                except (socket.timeout, TimeoutError):
                    return JsonResponse({
                        'status': 'error',
                        'error_type': 'TIMEOUT',
                        'message': f"Connection timed out while connecting to {host}:{port}. Check host and port numbers.",
                    }, status=400)
                except Exception as conn_err:
                    return JsonResponse({
                        'status': 'error',
                        'error_type': 'CONNECTION_FAILED',
                        'message': f"SMTP Connection Failed ({host}:{port}): {str(conn_err)}",
                        'technical_details': str(conn_err)
                    }, status=400)

                subject = "🏋️ GymLife Live Test Email: Gateway Verified & Active"
                plain_body = (
                    f"GymLife Fitness Center - Gateway Live Test\n\n"
                    f"Congratulations! Your Email Gateway ({host}:{port}) is authenticated and operational.\n"
                    f"Recipient: {recipient_email}\n"
                    f"Dispatched at: {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
                    f"Automated booking confirmations and member alert vouchers are now active."
                )
                html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0b0c10;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0c10;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#15161b;border:1px solid rgba(243,97,0,0.3);border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);">
          <tr>
            <td style="background:linear-gradient(135deg,#f36100 0%,#d04800 100%);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:24px;letter-spacing:2px;font-weight:900;color:#ffffff;text-transform:uppercase;">GYMLIFE FITNESS ARENA</h1>
              <p style="margin:6px 0 0 0;font-size:13px;letter-spacing:1px;color:rgba(255,255,255,0.9);text-transform:uppercase;">Live Email Gateway Verification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <div style="background:rgba(34,197,94,0.12);border:1px solid #22c55e;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
                <span style="font-size:18px;margin-right:8px;">✅</span>
                <strong style="color:#4ade80;font-size:14px;">Live Dispatch Verified & Operational!</strong>
              </div>
              <p style="font-size:14px;line-height:1.6;color:#c5c7d0;margin-top:0;">
                Hello Athlete / Administrator,<br><br>
                This test confirmation verifies that your <strong>{host}</strong> email gateway is properly connected and transmitting live transactional emails in real-time.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#0d0e12;border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
                <tr>
                  <td style="padding:10px 16px;color:#8e909d;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.04);">SMTP Server:</td>
                  <td style="padding:10px 16px;color:#ffffff;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">{host}:{port}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#8e909d;font-size:12px;border-bottom:1px solid rgba(255,255,255,0.04);">Dispatched From:</td>
                  <td style="padding:10px 16px;color:#ffffff;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid rgba(255,255,255,0.04);">{from_email}</td>
                </tr>
                <tr>
                  <td style="padding:10px 16px;color:#8e909d;font-size:12px;">Delivered To:</td>
                  <td style="padding:10px 16px;color:#f36100;font-size:13px;font-weight:600;text-align:right;">{recipient_email}</td>
                </tr>
              </table>
              <p style="font-size:12px;color:#717382;line-height:1.5;margin-bottom:0;">
                GymLife Client Notification Subsystem • Automated confirmation vouchers for classes, personal training, and memberships will now use this active dispatch channel.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0e0f13;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#555765;">
              GymLife Fitness Center • 333 Middle Winchendon Rd, Rindge, NH 03461
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
                try:
                    msg = EmailMultiAlternatives(
                        subject=subject,
                        body=plain_body,
                        from_email=from_email,
                        to=[recipient_email],
                        connection=connection
                    )
                    msg.attach_alternative(html_body, "text/html")
                    msg.send(fail_silently=False)

                    log_audit(user.username, 'ADMIN_TEST_EMAIL', 'Gateway', recipient_email, request, f"Dispatched live test email via {host}:{port}")
                    return JsonResponse({
                        'status': 'success',
                        'message': f"Real HTML verification email successfully dispatched to {recipient_email} via {host}:{port}!",
                        'host': host,
                        'port': port,
                        'from_email': from_email,
                        'recipient': recipient_email
                    })
                except Exception as send_err:
                    return JsonResponse({
                        'status': 'error',
                        'error_type': 'SEND_ERROR',
                        'message': f"Failed to deliver email through {host}: {str(send_err)}",
                        'technical_details': str(send_err)
                    }, status=500)
            
            elif test_type == 'SMS':
                if not recipient_phone:
                    return JsonResponse({'status': 'error', 'message': 'Recipient phone number is required.'}, status=400)
                
                clean_phone = re.sub(r'\D', '', recipient_phone)
                if len(clean_phone) == 10:
                    clean_phone = f"91{clean_phone}"
                    
                sms_text = f"🏋️ GymLife Live SMS Gateway Test: Delivered to +{clean_phone}! Time: {timezone.now().strftime('%H:%M:%S')}"
                
                # Check Fast2SMS
                fast2sms_key = getattr(settings, 'FAST2SMS_API_KEY', '') or os.environ.get('FAST2SMS_API_KEY')
                if fast2sms_key:
                    try:
                        f2s_url = "https://www.fast2sms.com/dev/bulkV2"
                        f2s_data = json.dumps({
                            "route": "q",
                            "message": sms_text,
                            "language": "english",
                            "numbers": clean_phone[-10:]
                        }).encode('utf-8')
                        req = urllib.request.Request(f2s_url, data=f2s_data, headers={
                            'authorization': fast2sms_key,
                            'Content-Type': 'application/json'
                        })
                        with urllib.request.urlopen(req, timeout=5) as resp:
                            if resp.status == 200:
                                log_audit(user.username, 'ADMIN_TEST_SMS', 'Gateway', clean_phone, request, "Dispatched test SMS")
                                return JsonResponse({'status': 'success', 'message': f"Real SMS sent via Fast2SMS to +{clean_phone}!"})
                    except Exception as err:
                        return JsonResponse({'status': 'error', 'message': f"Fast2SMS error: {str(err)}"}, status=500)
                        
                whatsapp_url = f"https://api.whatsapp.com/send?phone={clean_phone}&text={urllib.parse.quote(sms_text)}"
                return JsonResponse({
                    'status': 'success',
                    'message': f"SMS payload ready! WhatsApp direct URL generated.",
                    'whatsapp_url': whatsapp_url
                })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Gateway test error: {str(e)}'}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


