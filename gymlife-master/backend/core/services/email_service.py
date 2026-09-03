from notifications.services import EmailService

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except Exception:
        clean_args = [str(a).encode('ascii', 'replace').decode('ascii') for a in args]
        try:
            print(*clean_args, **kwargs)
        except Exception:
            pass

def send_booking_email(booking):
    """
    Backward-compatible wrapper for EmailService.send_booking_confirmation.
    """
    res = EmailService.send_booking_confirmation(booking)
    if res.get('success'):
        return True, "Delivered via Brevo SMTP"
    return False, res.get('error', 'Email delivery failed')
