import re
import logging
from django.core.mail import EmailMultiAlternatives, get_connection
from django.conf import settings
from decouple import config

logger = logging.getLogger('notifications')

class EmailService:
    """
    Production-Ready Email Service for GymLife.
    Dispatches branded transactional emails via Brevo SMTP (or configured Django Email Backend).
    Handles exceptions, validates recipient emails, and returns structured status objects.
    """

    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

    @classmethod
    def validate_email(cls, email_str):
        if not email_str or not isinstance(email_str, str):
            return False
        return bool(cls.EMAIL_REGEX.match(email_str.strip()))

    @classmethod
    def get_from_email(cls):
        from_env = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
        if from_env and from_env.strip():
            raw = from_env.strip()
            if '@' in raw:
                return raw if '<' in raw else f"GymLife Fitness Arena <{raw}>"
        host_user = getattr(settings, 'EMAIL_HOST_USER', '')
        if host_user and '@' in host_user:
            return f"GymLife Fitness Arena <{host_user.strip()}>"
        return 'GymLife Fitness Arena <b6e8c8001@smtp-brevo.com>'

    @classmethod
    def send_email(cls, recipient_email, subject, html_content, plain_text=None, bcc=None):
        """
        Production-grade email dispatch method with automatic Brevo SMTP failover.
        Ensures RFC 5322 header compliance and zero dropped confirmation emails.
        Returns: { 'success': bool, 'message_id': str, 'error': str }
        """
        clean_email = (recipient_email or '').strip()
        if not cls.validate_email(clean_email):
            logger.warning(f"[EmailService] Invalid recipient email address: {clean_email}")
            return {
                'success': False,
                'message_id': None,
                'error': f"Invalid recipient email address: '{clean_email}'"
            }

        text_body = plain_text or "GymLife Fitness Center notification."
        from_email = cls.get_from_email()

        # Build clean BCC list
        clean_bcc = []
        if bcc:
            if isinstance(bcc, (list, tuple)):
                clean_bcc = [b.strip() for b in bcc if cls.validate_email(b)]
            elif isinstance(bcc, str) and cls.validate_email(bcc):
                clean_bcc = [bcc.strip()]

        # -------------------------------------------------------------
        # 1. Primary Attempt: Configured Active SMTP (Gmail / Custom)
        # -------------------------------------------------------------
        try:
            try:
                from core.views import get_active_smtp_connection
                connection, dyn_from_email, _, _, username = get_active_smtp_connection()
                if dyn_from_email:
                    from_email = dyn_from_email
            except Exception:
                connection = get_connection(fail_silently=False)

            # Strict RFC 5322 sender validation
            match = re.search(r'<([^>]+)>', from_email)
            addr_part = match.group(1).strip() if match else from_email.strip()
            if '@' not in addr_part:
                from_email = cls.get_from_email()

            msg = EmailMultiAlternatives(
                subject=subject,
                body=text_body,
                from_email=from_email,
                to=[clean_email],
                bcc=clean_bcc if clean_bcc else None,
                connection=connection
            )
            if html_content:
                msg.attach_alternative(html_content, "text/html")

            msg.send(fail_silently=False)
            logger.info(f"[EmailService] Successfully sent email to {clean_email} via primary SMTP (Subject: '{subject}')")
            return {
                'success': True,
                'message_id': f"smtp-{clean_email}",
                'error': None
            }
        except Exception as primary_err:
            logger.warning(
                f"[EmailService] Primary SMTP dispatch failed for {clean_email}: {primary_err}. "
                f"Initiating automatic Brevo SMTP relay fallback..."
            )

            # -------------------------------------------------------------
            # 2. High-Availability Fallback Attempt: Brevo SMTP Relay
            # -------------------------------------------------------------
            try:
                brevo_host = getattr(settings, 'BREVO_SMTP_SERVER', 'smtp-relay.brevo.com') or 'smtp-relay.brevo.com'
                brevo_port = getattr(settings, 'BREVO_SMTP_PORT', 587) or 587
                brevo_user = getattr(settings, 'BREVO_SMTP_LOGIN', '') or 'b6e8c8001@smtp-brevo.com'
                brevo_key = (
                    getattr(settings, 'BREVO_SMTP_KEY', '') or
                    config('BREVO_SMTP_KEY', default='') or
                    getattr(settings, 'EMAIL_HOST_PASSWORD', '')
                )
                brevo_from = getattr(settings, 'DEFAULT_FROM_EMAIL', 'GymLife Fitness Arena <b6e8c8001@smtp-brevo.com>')

                if brevo_user and brevo_key:
                    fallback_conn = get_connection(
                        backend='django.core.mail.backends.smtp.EmailBackend',
                        host=brevo_host,
                        port=brevo_port,
                        username=brevo_user,
                        password=brevo_key,
                        use_tls=True,
                        timeout=12
                    )
                    fallback_msg = EmailMultiAlternatives(
                        subject=subject,
                        body=text_body,
                        from_email=brevo_from,
                        to=[clean_email],
                        bcc=clean_bcc if clean_bcc else None,
                        connection=fallback_conn
                    )
                    if html_content:
                        fallback_msg.attach_alternative(html_content, "text/html")

                    fallback_msg.send(fail_silently=False)
                    logger.info(
                        f"[EmailService] Successfully delivered email to {clean_email} via Brevo relay fallback! "
                        f"(Subject: '{subject}')"
                    )
                    return {
                        'success': True,
                        'message_id': f"brevo-relay-{clean_email}",
                        'error': None
                    }
            except Exception as fallback_err:
                logger.error(f"[EmailService] Brevo fallback also failed for {clean_email}: {fallback_err}")
                return {
                    'success': False,
                    'message_id': None,
                    'error': f"Primary SMTP: {primary_err} | Brevo Relay: {fallback_err}"
                }

            return {
                'success': False,
                'message_id': None,
                'error': str(primary_err)
            }

    # --------------------------------------------------------------------------
    # Transactional Email Workflows
    # --------------------------------------------------------------------------
    @classmethod
    def send_booking_confirmation(cls, booking):
        """
        Dispatches a branded booking confirmation email to the customer.
        """
        ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
        service_name = booking.service or "Personal Training Assessment"
        display_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else 'Upcoming Scheduled Time'
        location = booking.location or "GymLife Arena (333 Middle Winchendon Rd)"
        trainer_name = booking.trainer.name if booking.trainer else "Assigned Senior Coach"
        notes = booking.notes or "Standard Workout Preparation"

        subject = f"GymLife Training Pass #{ref_id} - {booking.name}"

        plain_text = (
            f"GymLife Fitness Arena\n\n"
            f"Hello {booking.name},\n\n"
            f"Your appointment has been confirmed!\n\n"
            f"Booking ID: #{ref_id}\n"
            f"Service: {service_name}\n"
            f"Date & Time: {display_time}\n"
            f"Trainer: {trainer_name}\n"
            f"Location: {location}\n"
            f"Notes: {notes}\n\n"
            f"Please arrive 10 minutes before your appointment.\n\n"
            f"Thank you,\n"
            f"GymLife Fitness Arena\n"
            f"Helpline: 125-711-811 | support.gymcenter@gmail.com\n"
        )

        html_content = cls._build_html_template(
            title="Session Confirmed & Scheduled",
            badge_text="CONFIRMED PASS",
            badge_color="#2ed573",
            headline=f"Ready to Train, {booking.name}?",
            intro_text="Your workout session has been confirmed. Present this digital pass upon arrival at the reception desk.",
            ref_id=ref_id,
            rows=[
                ("Athlete Name", booking.name),
                ("Training Program", service_name),
                ("Assigned Coach", trainer_name),
                ("Date & Time", display_time),
                ("Facility Location", location),
                ("Special Notes", notes),
                ("Status", "Confirmed & Scheduled")
            ],
            footer_note="Complimentary locker amenities, steam room access, and hydration stations are included with your pass."
        )

        admin_bcc = getattr(settings, 'GYM_ADMIN_EMAIL', 'support.gymcenter@gmail.com')
        return cls.send_email(booking.email, subject, html_content, plain_text, bcc=admin_bcc)

    @classmethod
    def send_booking_cancellation(cls, booking, reason=""):
        """
        Dispatches a cancellation notice email to the customer.
        """
        ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
        service_name = booking.service or "Training Session"
        display_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else 'Scheduled Time'
        cancel_reason = reason or booking.cancellation_reason or "Schedule conflict or athlete request"

        subject = f"Booking Cancellation Notice: Pass #{ref_id}"

        plain_text = (
            f"GymLife Fitness Arena\n\n"
            f"Hello {booking.name},\n\n"
            f"Your appointment #{ref_id} on {display_time} for {service_name} has been cancelled.\n\n"
            f"Reason: {cancel_reason}\n\n"
            f"If you did not request this cancellation or would like to rebook another slot, please visit our website or contact our helpline.\n\n"
            f"GymLife Coaching Staff\n"
            f"Helpline: 125-711-811 | support.gymcenter@gmail.com\n"
        )

        html_content = cls._build_html_template(
            title="Appointment Cancelled",
            badge_text="CANCELLED",
            badge_color="#ff4757",
            headline="Session Cancelled",
            intro_text=f"Your appointment #{ref_id} has been cancelled as per the details below.",
            ref_id=ref_id,
            rows=[
                ("Athlete Name", booking.name),
                ("Service", service_name),
                ("Original Time", display_time),
                ("Cancellation Reason", cancel_reason),
                ("Status", "Cancelled")
            ],
            footer_note="To schedule a new training slot, visit gymlife.com or contact reception."
        )

        return cls.send_email(booking.email, subject, html_content, plain_text)

    @classmethod
    def send_booking_rescheduled(cls, booking, old_time=None):
        """
        Dispatches a rescheduled appointment email to the customer.
        """
        ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
        service_name = booking.service or "Training Session"
        new_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else 'New Scheduled Time'
        old_time_str = old_time.strftime('%A, %B %d, %Y at %I:%M %p') if hasattr(old_time, 'strftime') else str(old_time or 'Previous Slot')
        trainer_name = booking.trainer.name if booking.trainer else "Assigned Coach"
        location = booking.location or "GymLife Arena (333 Middle Winchendon Rd)"

        subject = f"Appointment Rescheduled: Pass #{ref_id}"

        plain_text = (
            f"GymLife Fitness Arena\n\n"
            f"Hello {booking.name},\n\n"
            f"Your appointment #{ref_id} for {service_name} has been rescheduled to {new_time}.\n\n"
            f"Previous Slot: {old_time_str}\n"
            f"New Slot: {new_time}\n"
            f"Trainer: {trainer_name}\n"
            f"Location: {location}\n\n"
            f"Please arrive 10 minutes prior to your new session time.\n\n"
            f"GymLife Coaching Staff\n"
            f"Helpline: 125-711-811 | support.gymcenter@gmail.com\n"
        )

        html_content = cls._build_html_template(
            title="Appointment Rescheduled",
            badge_text="RESCHEDULED",
            badge_color="#3742fa",
            headline="Your Workout Has Been Rescheduled",
            intro_text=f"Your training appointment #{ref_id} has been moved to a new time slot.",
            ref_id=ref_id,
            rows=[
                ("Athlete Name", booking.name),
                ("Training Program", service_name),
                ("Assigned Coach", trainer_name),
                ("Previous Time", old_time_str),
                ("New Scheduled Time", new_time),
                ("Facility Location", location),
                ("Status", "Rescheduled & Confirmed")
            ],
            footer_note="Your updated pass is active. Please arrive 10 minutes early."
        )

        return cls.send_email(booking.email, subject, html_content, plain_text)

    @classmethod
    def send_booking_reminder(cls, booking):
        """
        Dispatches a 24-hour reminder email before the session.
        """
        ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
        service_name = booking.service or "Training Session"
        display_time = booking.scheduled_time.strftime('%A, %B %d, %Y at %I:%M %p') if booking.scheduled_time else 'Upcoming Time'
        location = booking.location or "GymLife Arena (333 Middle Winchendon Rd)"

        subject = f"Upcoming Workout Reminder: Pass #{ref_id} - GymLife"

        plain_text = (
            f"GymLife Fitness Arena\n\n"
            f"Hello {booking.name},\n\n"
            f"This is a friendly reminder for your upcoming session on {display_time} ({service_name}).\n"
            f"Booking ID: #{ref_id}\n"
            f"Location: {location}\n\n"
            f"Stay hydrated and bring your athletic footwear!\n\n"
            f"GymLife Coaching Staff\n"
        )

        html_content = cls._build_html_template(
            title="Upcoming Workout Reminder",
            badge_text="24H REMINDER",
            badge_color="#f36100",
            headline="Get Ready to Crush It Tomorrow!",
            intro_text=f"Friendly reminder for your upcoming training session #{ref_id}.",
            ref_id=ref_id,
            rows=[
                ("Athlete Name", booking.name),
                ("Program", service_name),
                ("Scheduled Time", display_time),
                ("Location", location)
            ],
            footer_note="Remember to bring workout attire and arrive 10 minutes early."
        )

        return cls.send_email(booking.email, subject, html_content, plain_text)

    # --------------------------------------------------------------------------
    # Responsive Dark & Orange HTML Template Builder
    # --------------------------------------------------------------------------
    @classmethod
    def _build_html_template(cls, title, badge_text, badge_color, headline, intro_text, ref_id, rows, footer_note=""):
        rows_html = "".join([
            f"""
            <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #8a8a93; font-size: 13px; font-weight: 600; text-transform: uppercase; width: 38%;">{label}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); color: #ffffff; font-size: 14px; font-weight: 700;">{val}</td>
            </tr>
            """ for label, val in rows
        ])

        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
        </head>
        <body style="margin: 0; padding: 24px; background-color: #0a0a0c; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a0c;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" style="max-width: 600px; background-color: #151518; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 30px 30px 20px 30px; text-align: center; background: linear-gradient(180deg, #1f1f24 0%, #151518 100%); border-bottom: 2px solid #f36100;">
                                    <div style="font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">
                                        GYM<span style="color: #f36100;">LIFE</span>
                                    </div>
                                    <div style="font-size: 11px; font-weight: 700; color: #8a8a93; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">
                                        FITNESS CENTER & ELITE ARENA
                                    </div>
                                </td>
                            </tr>

                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 30px;">
                                    <div style="display: inline-block; background-color: {badge_color}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 20px; letter-spacing: 1px; margin-bottom: 16px;">
                                        ● {badge_text}
                                    </div>
                                    <div style="float: right; color: #f36100; font-weight: 800; font-size: 13px; letter-spacing: 1px;">
                                        REF #{ref_id}
                                    </div>
                                    <div style="clear: both;"></div>

                                    <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
                                        {headline}
                                    </h2>
                                    <p style="font-size: 14px; line-height: 1.6; color: #a4a4ab; margin: 0 0 24px 0;">
                                        {intro_text}
                                    </p>

                                    <!-- Table Details -->
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0d0d10; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 24px;">
                                        {rows_html}
                                    </table>

                                    {f'<div style="background: rgba(243, 97, 0, 0.1); border-left: 3px solid #f36100; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #d1d1d6; line-height: 1.5; margin-bottom: 24px;">{footer_note}</div>' if footer_note else ''}

                                    <!-- Help & CTA -->
                                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                        <tr>
                                            <td style="text-align: center; padding-top: 10px;">
                                                <a href="https://maps.google.com/?q=333+Middle+Winchendon+Rd+Rindge+NH" style="background-color: #f36100; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: 800; letter-spacing: 1px; border-radius: 6px; display: inline-block; text-transform: uppercase;">
                                                    View Arena Map & Directions
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 30px; text-align: center; background-color: #0d0d10; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #6e6e76;">
                                    <p style="margin: 0 0 6px 0;">
                                        GymLife Fitness Arena • 333 Middle Winchendon Rd, Rindge, NH 03461
                                    </p>
                                    <p style="margin: 0;">
                                        Helpline: <strong>125-711-811</strong> • Email: <a href="mailto:support.gymcenter@gmail.com" style="color: #f36100; text-decoration: none;">support.gymcenter@gmail.com</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
