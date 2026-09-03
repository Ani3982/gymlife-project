from notifications.services import SMSService, WhatsAppService

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except Exception:
        clean_args = [str(a).encode('ascii', 'replace').decode('ascii') for a in args]
        try:
            print(*clean_args, **kwargs)
        except Exception:
            pass

def format_clean_phone(phone_str):
    _, local_10, international = SMSService.normalize_phone(phone_str)
    return local_10, international

def generate_booking_sms_text(booking):
    ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
    dt_str = booking.scheduled_time.strftime('%b %d, %I:%M %p') if booking.scheduled_time else 'Upcoming Time'
    first_name = booking.name.split()[0] if booking.name else 'Athlete'
    return f"GymLife: Hi {first_name}, appointment #{ref_id} is confirmed for {dt_str}. Arena: 333 Middle Winchendon Rd. Help: 125-711-811"

def send_booking_sms(booking):
    """
    Backward-compatible wrapper for SMSService and WhatsAppService.
    """
    sms_res = SMSService.send_booking_confirmation(booking)
    wa_url = WhatsAppService.generate_booking_link(booking, event_type='CONFIRMATION')
    sms_text = generate_booking_sms_text(booking)
    sms_uri = f"sms:{booking.phone}?body={sms_text}"

    return {
        'sms_delivered': sms_res.get('success', False),
        'sms_note': sms_res.get('provider_status', 'SMS processed'),
        'whatsapp_url': wa_url,
        'sms_uri': sms_uri,
        'sms_text': sms_text
    }
