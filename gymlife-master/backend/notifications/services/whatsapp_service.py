import urllib.parse
from .sms_service import SMSService

class WhatsAppService:
    """
    WhatsApp Click-to-Chat Service for GymLife.
    Generates customer-initiated wa.me links with pre-filled workout pass messages.
    Note: wa.me links open WhatsApp on the user's mobile/desktop for user-confirmed sending.
    """

    @classmethod
    def generate_booking_message(cls, booking, event_type='CONFIRMATION', reason=None, old_time=None):
        ref_id = booking.ref_id or f"GYM-2026-{booking.id}"
        dt_str = booking.scheduled_time.strftime('%b %d, %Y at %I:%M %p') if booking.scheduled_time else 'Upcoming Slot'
        service_name = booking.service or "Personal Training Assessment"
        location = booking.location or "GymLife Arena (333 Middle Winchendon Rd)"
        trainer_name = booking.trainer.name if booking.trainer else "Assigned Senior Coach"

        if event_type == 'CANCELLATION':
            cancel_reason = reason or booking.cancellation_reason or "Athlete request / schedule conflict"
            return (
                f"🏋️ *GYMLIFE APPOINTMENT CANCELLED*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📋 *Reference:* #{ref_id}\n"
                f"👤 *Athlete:* {booking.name}\n"
                f"⚡ *Service:* {service_name}\n"
                f"⏰ *Original Time:* {dt_str}\n"
                f"⚠️ *Reason:* {cancel_reason}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📞 *Helpline:* +1 125-711-811 / support.gymcenter@gmail.com"
            )
        elif event_type == 'RESCHEDULED':
            old_dt_str = old_time.strftime('%b %d at %I:%M %p') if hasattr(old_time, 'strftime') else str(old_time or 'Previous Slot')
            return (
                f"🏋️ *GYMLIFE TRAINING RESCHEDULED*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📋 *Reference:* #{ref_id}\n"
                f"👤 *Athlete:* {booking.name}\n"
                f"⚡ *Session:* {service_name}\n"
                f"🔄 *Previous Time:* {old_dt_str}\n"
                f"🕒 *New Scheduled Time:* {dt_str}\n"
                f"📍 *Location:* {location}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"✅ *Status:* Rescheduled & Confirmed\n"
                f"📞 *Helpline:* +1 125-711-811"
            )
        elif event_type == 'REMINDER':
            return (
                f"🏋️ *GYMLIFE WORKOUT REMINDER*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📋 *Reference:* #{ref_id}\n"
                f"👤 *Athlete:* {booking.name}\n"
                f"⚡ *Program:* {service_name}\n"
                f"⏰ *Time:* {dt_str}\n"
                f"📍 *Arena:* {location}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"💧 Bring workout shoes & hydration. See you there!"
            )
        else: # CONFIRMATION
            return (
                f"🏋️ *GYMLIFE TRAINING PASS*\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"📋 *Reference:* #{ref_id}\n"
                f"👤 *Athlete:* {booking.name}\n"
                f"⚡ *Session:* {service_name}\n"
                f"🕒 *Scheduled Time:* {dt_str}\n"
                f"📍 *Location:* {location}\n"
                f"👤 *Coach:* {trainer_name}\n"
                f"📝 *Notes:* {booking.notes or 'Workout Readiness'}\n"
                f"━━━━━━━━━━━━━━━━━━━━\n"
                f"✅ *Status:* Confirmed & Scheduled\n"
                f"📞 *Helpline:* +1 125-711-811"
            )

    @classmethod
    def generate_booking_link(cls, booking, event_type='CONFIRMATION', reason=None, old_time=None):
        """
        Generates https://wa.me/<international_number>?text=<encoded_text>
        """
        is_valid, local_10, international = SMSService.normalize_phone(booking.phone)
        phone_target = international if international else booking.phone
        msg = cls.generate_booking_message(booking, event_type=event_type, reason=reason, old_time=old_time)
        encoded_text = urllib.parse.quote(msg)
        return f"https://api.whatsapp.com/send?phone={phone_target}&text={encoded_text}"
