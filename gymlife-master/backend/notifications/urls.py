from django.urls import path
from . import views

urlpatterns = [
    # Notification Logs & Audit Trail
    path('api/admin/notification-logs/', views.admin_notification_logs, name='admin_notification_logs'),
    path('api/admin/notification-logs/stats/', views.admin_notification_stats, name='admin_notification_stats'),
    path('api/admin/notification-logs/diagnostic/', views.admin_diagnostic_test, name='admin_diagnostic_test'),
    path('api/admin/notification-logs/<int:pk>/', views.admin_notification_detail, name='admin_notification_detail'),
    path('api/admin/notification-logs/<int:pk>/resend/', views.admin_resend_notification, name='admin_resend_notification'),
    
    # Aliases
    path('api/admin/notifications-audit/', views.admin_notification_logs, name='admin_notification_audit_alias'),
    path('api/admin/notifications-stats/', views.admin_notification_stats, name='admin_notification_stats_alias'),
]
