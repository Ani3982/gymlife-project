from django.urls import path, re_path
from . import views

urlpatterns = [
    # -------------------------------------------------------------
    # Public APIs & Bookings
    # -------------------------------------------------------------
    path('api/bookings/', views.handle_bookings, name='handle_bookings'),
    path('api/bookings/<str:ref_id>/', views.get_booking_detail, name='get_booking_detail'),
    path('api/appointments/', views.create_appointment, name='create_appointment'),

    path('api/services/', views.get_services, name='get_services'),
    path('api/trainers/', views.get_trainers, name='get_trainers'),
    path('api/classes/', views.get_classes, name='get_classes'),
    path('api/classes/<int:pk>/', views.get_class_detail, name='get_class_detail'),
    path('api/timetable/', views.get_public_timetable, name='get_public_timetable'),
    path('api/gallery/', views.get_gallery, name='get_gallery'),
    path('api/blogs/', views.get_blogs, name='get_blogs'),
    path('api/blogs/<int:pk>/', views.get_blog_detail, name='get_blog_detail'),
    path('api/blogs/<str:pk>/', views.get_blog_detail, name='get_blog_detail_slug'),
    path('api/pricing-plans/', views.get_pricing_plans, name='get_pricing_plans'),
    path('api/contact-info/', views.get_contact_info, name='get_contact_info'),
    path('api/contact/', views.create_contact_message, name='create_contact_message'),

    # -------------------------------------------------------------
    # User Authentication & Member Portal APIs
    # -------------------------------------------------------------
    path('api/auth/register/', views.auth_register, name='auth_register'),
    path('api/auth/login/', views.auth_login, name='auth_login'),
    path('api/auth/me/', views.auth_me, name='auth_me'),
    path('api/member/dashboard/', views.member_dashboard_data, name='member_dashboard_data'),

    # -------------------------------------------------------------
    # Admin Panel APIs
    # -------------------------------------------------------------
    path('api/admin/login/', views.admin_login, name='admin_login'),
    path('api/admin/dashboard/', views.admin_dashboard_data, name='admin_dashboard_data'),
    
    # Bookings & Appointments Management
    path('api/admin/bookings/', views.admin_bookings, name='admin_bookings'),
    path('api/admin/bookings/<str:pk>/', views.admin_bookings, name='admin_booking_detail'),
    path('api/admin/appointments/', views.admin_bookings, name='admin_appointments_alias'),
    path('api/admin/appointments/<str:pk>/', views.admin_bookings, name='admin_appointment_alias_detail'),
    
    # Members Management
    path('api/admin/members/', views.admin_members, name='admin_members'),

    path('api/admin/members/<int:pk>/', views.admin_members, name='admin_member_detail'),
    
    # Trainers Management
    path('api/admin/trainers/', views.admin_trainers, name='admin_trainers'),
    path('api/admin/trainers/<int:pk>/', views.admin_trainers, name='admin_trainer_detail'),
    
    # Classes Management
    path('api/admin/classes/', views.admin_classes, name='admin_classes'),
    path('api/admin/classes/<int:pk>/', views.admin_classes, name='admin_class_detail'),
    
    # Timetable & Schedule Management
    path('api/admin/timetable/', views.admin_timetable, name='admin_timetable'),
    path('api/admin/timetable/<int:pk>/', views.admin_timetable, name='admin_timetable_detail'),
    
    # Memberships & Pricing Plans
    path('api/admin/plans/', views.admin_plans, name='admin_plans'),
    path('api/admin/plans/<int:pk>/', views.admin_plans, name='admin_plan_detail'),
    
    # Payments & Transactions
    path('api/admin/payments/', views.admin_payments, name='admin_payments'),
    path('api/admin/payments/<int:pk>/', views.admin_payments, name='admin_payment_detail'),
    
    # Contact Messages & Enquiries
    path('api/admin/messages/', views.admin_messages, name='admin_messages'),
    path('api/admin/messages/<int:pk>/', views.admin_messages, name='admin_message_detail'),
    
    # Blog Posts Management
    path('api/admin/blogs/', views.admin_blogs, name='admin_blogs'),
    path('api/admin/blogs/<int:pk>/', views.admin_blogs, name='admin_blog_detail'),
    
    # Analytics Reports
    path('api/admin/reports/', views.admin_reports_data, name='admin_reports_data'),
    
    # Audit Logs
    path('api/admin/audit-logs/', views.admin_audit_logs, name='admin_audit_logs'),
    
    # Notifications
    path('api/admin/notifications/', views.admin_notifications, name='admin_notifications'),
    path('api/admin/notifications/<str:pk>/', views.admin_notifications, name='admin_notification_action'),
    
    # Settings & Profile
    path('api/admin/settings/', views.admin_settings, name='admin_settings'),
    path('api/admin/profile/', views.admin_profile, name='admin_profile'),
    path('api/admin/gateway-test/', views.admin_gateway_test, name='admin_gateway_test'),

    # Root API health check response
    path('', views.api_root_view, name='api-root'),
    re_path(r'^.*$', views.api_root_view, name='api-root-fallback'),
]
