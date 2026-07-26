from django.contrib import admin
from .models import (
    Appointment, Service, Trainer, ClassItem,
    GalleryItem, BlogPost, PricingPlan, ContactInfo, ContactMessage
)

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'service', 'appointment_date', 'created_at')
    search_fields = ('name', 'email', 'phone', 'service')
    list_filter = ('service', 'appointment_date')
    readonly_fields = ('created_at',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order')
    search_fields = ('title', 'description')
    list_editable = ('order',)

@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'order')
    search_fields = ('name', 'role')
    list_editable = ('order',)

@admin.register(ClassItem)
class ClassItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'trainer', 'duration', 'order')
    list_filter = ('category', 'trainer')
    search_fields = ('name', 'description')
    list_editable = ('order',)

@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title',)

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'created_at')
    list_filter = ('category', 'author')
    search_fields = ('title', 'content')

@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'period', 'order')
    search_fields = ('name', 'features')
    list_editable = ('order',)

@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('email', 'address')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'website', 'submitted_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('submitted_at',)

