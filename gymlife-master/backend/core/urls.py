from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    # Legacy Django templates commented out to run React SPA instead
    # path('', views.index_view, name='index'),
    # path('about-us/', views.about_us_view, name='about-us'),
    # path('blog-details/', views.blog_details_view, name='blog-details'),
    # path('blog/', views.blog_view, name='blog'),
    # path('bmi-calculator/', views.bmi_calculator_view, name='bmi-calculator'),
    # path('class-details/', views.class_details_view, name='class-details'),
    # path('class-timetable/', views.class_timetable_view, name='class-timetable'),
    # path('contact/', views.contact_view, name='contact'),
    # path('gallery/', views.gallery_view, name='gallery'),
    # path('services/', views.services_view, name='services'),
    # path('team/', views.team_view, name='team'),
    # path('404/', views.error_404_view, name='404'),
    # path('main/', views.main_view, name='main'),
    
    # API endpoints
    path('api/appointments/', views.create_appointment, name='create_appointment'),
    path('api/services/', views.get_services, name='get_services'),
    path('api/trainers/', views.get_trainers, name='get_trainers'),
    path('api/classes/', views.get_classes, name='get_classes'),
    path('api/classes/<int:pk>/', views.get_class_detail, name='get_class_detail'),
    path('api/gallery/', views.get_gallery, name='get_gallery'),
    path('api/blogs/', views.get_blogs, name='get_blogs'),
    path('api/blogs/<int:pk>/', views.get_blog_detail, name='get_blog_detail'),
    path('api/pricing-plans/', views.get_pricing_plans, name='get_pricing_plans'),
    path('api/contact-info/', views.get_contact_info, name='get_contact_info'),
    path('api/contact/', views.create_contact_message, name='create_contact_message'),

    # User Auth & Member APIs
    path('api/auth/register/', views.auth_register, name='auth_register'),
    path('api/auth/login/', views.auth_login, name='auth_login'),
    path('api/auth/me/', views.auth_me, name='auth_me'),
    path('api/member/dashboard/', views.member_dashboard_data, name='member_dashboard_data'),

    # Admin API endpoints
    path('api/admin/login/', views.admin_login, name='admin_login'),
    
    path('api/admin/appointments/', views.admin_appointments, name='admin_appointments'),
    path('api/admin/appointments/<int:pk>/', views.admin_appointments, name='admin_appointment_detail'),
    
    path('api/admin/messages/', views.admin_messages, name='admin_messages'),
    path('api/admin/messages/<int:pk>/', views.admin_messages, name='admin_message_detail'),
    
    path('api/admin/services/', views.admin_services, name='admin_services'),
    path('api/admin/services/<int:pk>/', views.admin_services, name='admin_service_detail'),
    
    path('api/admin/trainers/', views.admin_trainers, name='admin_trainers'),
    path('api/admin/trainers/<int:pk>/', views.admin_trainers, name='admin_trainer_detail'),
    
    path('api/admin/classes/', views.admin_classes, name='admin_classes'),
    path('api/admin/classes/<int:pk>/', views.admin_classes, name='admin_class_detail'),
    
    path('api/admin/plans/', views.admin_plans, name='admin_plans'),
    path('api/admin/plans/<int:pk>/', views.admin_plans, name='admin_plan_detail'),
    
    path('api/admin/blogs/', views.admin_blogs, name='admin_blogs'),
    path('api/admin/blogs/<int:pk>/', views.admin_blogs, name='admin_blog_detail'),
    
    path('api/admin/gallery/', views.admin_gallery, name='admin_gallery'),
    path('api/admin/gallery/<int:pk>/', views.admin_gallery, name='admin_gallery_detail'),
    
    path('api/admin/contact-info/', views.admin_contact_info, name='admin_contact_info'),
    
    # Root API health check response
    path('', views.api_root_view, name='api-root'),
    re_path(r'^.*$', views.api_root_view, name='api-root-fallback'),
]
