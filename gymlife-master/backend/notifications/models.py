from django.db import models
from django.utils import timezone
from core.models import Booking

class NotificationLog(models.Model):
    TYPE_CHOICES = [
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('BOOKING_CANCELLATION', 'Booking Cancellation'),
        ('BOOKING_RESCHEDULED', 'Booking Rescheduled'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
    ]

    CHANNEL_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('WHATSAPP', 'WhatsApp'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed'),
        ('RETRYING', 'Retrying'),
    ]

    PROVIDER_CHOICES = [
        ('BREVO_SMTP', 'Brevo SMTP'),
        ('FAST2SMS', 'Fast2SMS API'),
        ('TWILIO', 'Twilio SMS'),
        ('WA_ME', 'WhatsApp Click-to-Chat'),
    ]

    appointment = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notification_logs',
        help_text="Linked booking/appointment record"
    )
    customer_name = models.CharField(max_length=255)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=30, blank=True, null=True)
    notification_type = models.CharField(max_length=40, choices=TYPE_CHOICES, default='BOOKING_CONFIRMATION')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='EMAIL')
    recipient = models.CharField(max_length=255, help_text="Email address or normalized phone number")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    provider = models.CharField(max_length=30, choices=PROVIDER_CHOICES, default='BREVO_SMTP')
    provider_message_id = models.CharField(max_length=255, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    response_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['appointment', 'notification_type', 'channel', 'status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        ref = self.appointment.ref_id if self.appointment else 'No-Ref'
        return f"[{self.get_channel_display()}] {self.get_notification_type_display()} - {ref} ({self.status})"

    def mark_as_sent(self, provider_message_id=None, response_data=None):
        self.status = 'SENT'
        self.sent_at = timezone.now()
        if provider_message_id:
            self.provider_message_id = provider_message_id
        if response_data:
            self.response_data = response_data
        self.error_message = None
        self.save()

    def mark_as_failed(self, error_message, response_data=None):
        self.status = 'FAILED'
        self.error_message = str(error_message)
        if response_data:
            self.response_data = response_data
        self.save()
