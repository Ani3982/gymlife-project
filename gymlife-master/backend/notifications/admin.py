from django.contrib import admin
from .models import NotificationLog

@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'appointment_ref',
        'customer_name',
        'channel',
        'notification_type',
        'recipient',
        'status',
        'provider',
        'created_at',
        'sent_at',
        'retry_count'
    )
    list_filter = ('status', 'channel', 'notification_type', 'provider', 'created_at')
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'recipient', 'appointment__ref_id', 'provider_message_id')
    readonly_fields = ('created_at', 'sent_at')

    def appointment_ref(self, obj):
        return obj.appointment.ref_id if obj.appointment else '-'
    appointment_ref.short_description = 'Booking Ref'
