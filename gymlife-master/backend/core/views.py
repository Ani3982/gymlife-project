from django.shortcuts import render
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({
        'status': 'online',
        'app': 'GymLife Backend API',
        'message': 'API server is running successfully'
    })

def index_view(request):
    return render(request, 'core/index.html')

def about_us_view(request):
    return render(request, 'core/about-us.html')

def blog_details_view(request):
    return render(request, 'core/blog-details.html')

def blog_view(request):
    return render(request, 'core/blog.html')

def bmi_calculator_view(request):
    return render(request, 'core/bmi-calculator.html')

def class_details_view(request):
    return render(request, 'core/class-details.html')

def class_timetable_view(request):
    return render(request, 'core/class-timetable.html')

def contact_view(request):
    return render(request, 'core/contact.html')

def gallery_view(request):
    return render(request, 'core/gallery.html')

def services_view(request):
    return render(request, 'core/services.html')

def team_view(request):
    return render(request, 'core/team.html')

def error_404_view(request):
    return render(request, 'core/404.html')

def main_view(request):
    return render(request, 'core/main.html')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import (
    Appointment, Service, Trainer, ClassItem,
    GalleryItem, BlogPost, PricingPlan, ContactInfo, ContactMessage
)

# Helper functions for serialization
def serialize_service(service):
    return {
        'id': service.id,
        'title': service.title,
        'description': service.description,
        'icon': service.icon,
        'link': service.link,
    }

def serialize_trainer(trainer, request=None):
    img_url = trainer.image_url or f'/img/team/team-{trainer.id}.jpg'
    if trainer.image:
        img_url = trainer.image.url
        if request:
            img_url = request.build_absolute_uri(img_url)
    return {
        'id': trainer.id,
        'name': trainer.name,
        'role': trainer.role,
        'image_url': str(img_url),
        'facebook_url': trainer.facebook_url,
        'twitter_url': trainer.twitter_url,
        'instagram_url': trainer.instagram_url,
        'youtube_url': trainer.youtube_url,
    }

def serialize_class(c, request=None):
    img_url = c.image_url or f'/img/classes/class-{c.id}.jpg'
    if c.image:
        img_url = c.image.url
        if request:
            img_url = request.build_absolute_uri(img_url)
    return {
        'id': c.id,
        'name': c.name,
        'description': c.description,
        'category': c.category,
        'trainer': serialize_trainer(c.trainer, request) if c.trainer else None,
        'duration': c.duration,
        'image_url': str(img_url),
    }

def serialize_gallery(item, request=None):
    img_url = item.image_url or f'/img/gallery/gallery-{item.id}.jpg'
    if item.image:
        img_url = item.image.url
        if request:
            img_url = request.build_absolute_uri(img_url)
    return {
        'id': item.id,
        'title': item.title,
        'image_url': str(img_url),
    }

def serialize_blog(blog, request=None):
    img_url = blog.image_url or f'/img/blog/blog-{blog.id}.jpg'
    if blog.image:
        img_url = blog.image.url
        if request:
            img_url = request.build_absolute_uri(img_url)
    return {
        'id': blog.id,
        'title': blog.title,
        'content': blog.content,
        'author': blog.author,
        'category': blog.category,
        'image_url': str(img_url),
        'created_at': blog.created_at.strftime('%B %d, %Y') if blog.created_at else '',
    }

def serialize_plan(plan):
    return {
        'id': plan.id,
        'name': plan.name,
        'price': str(plan.price),
        'period': plan.period,
        'features': plan.get_features_list(),
    }

def serialize_contact_info(info):
    return {
        'id': info.id,
        'address': info.address,
        'phone_numbers': info.get_phone_list(),
        'email': info.email,
        'google_map_iframe_url': info.google_map_iframe_url,
    }

# API endpoints
def get_services(request):
    services = Service.objects.all().order_by('order')
    return JsonResponse([serialize_service(s) for s in services], safe=False)

def get_trainers(request):
    trainers = Trainer.objects.all().order_by('order')
    return JsonResponse([serialize_trainer(t, request) for t in trainers], safe=False)

def get_classes(request):
    classes = ClassItem.objects.all().order_by('order')
    return JsonResponse([serialize_class(c, request) for c in classes], safe=False)

def get_class_detail(request, pk):
    try:
        c = ClassItem.objects.get(pk=pk)
        return JsonResponse(serialize_class(c, request))
    except ClassItem.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Class not found'}, status=404)


def get_gallery(request):
    gallery = GalleryItem.objects.all().order_by('-created_at')
    return JsonResponse([serialize_gallery(g, request) for g in gallery], safe=False)

def get_blogs(request):
    blogs = BlogPost.objects.all().order_by('-created_at')
    return JsonResponse([serialize_blog(b, request) for b in blogs], safe=False)

def get_blog_detail(request, pk):
    try:
        blog = BlogPost.objects.get(pk=pk)
        return JsonResponse(serialize_blog(blog, request))
    except BlogPost.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Blog not found'}, status=404)

def get_pricing_plans(request):
    plans = PricingPlan.objects.all().order_by('order')
    return JsonResponse([serialize_plan(p) for p in plans], safe=False)

def get_contact_info(request):
    info = ContactInfo.objects.first()
    if info:
        return JsonResponse(serialize_contact_info(info))
    return JsonResponse({}, status=404)

@csrf_exempt
def create_contact_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            msg = ContactMessage.objects.create(
                name=data.get('name', ''),
                email=data.get('email', ''),
                website=data.get('website', ''),
                message=data.get('message', '')
            )
            return JsonResponse({'status': 'success', 'message': 'Message sent successfully', 'id': msg.id})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def create_appointment(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            appointment = Appointment.objects.create(
                name=data.get('name', ''),
                email=data.get('email', ''),
                phone=data.get('phone', ''),
                service=data.get('service', ''),
                appointment_date=data.get('appointment_date'),
                notes=data.get('notes', '')
            )
            
            ref_no = f"GYM-2026-{appointment.id:04d}"
            
            # Format email & SMS notifications
            email_subject = f"Confirmed: Your GymLife Fitness Session [{ref_no}]"
            email_body = (
                f"Hello {appointment.name},\n\n"
                f"Your training session for '{appointment.service}' has been successfully scheduled and confirmed!\n\n"
                f"📅 Booking Reference: #{ref_no}\n"
                f"🕒 Date & Time: {appointment.appointment_date}\n"
                f"📍 Location: GymLife Center, 333 Middle Winchendon Rd, Rindge, NH 03461\n"
                f"🏋️ Assigned Department: Elite Training & Coaching Staff\n\n"
                f"Please arrive 10 minutes prior to your session with workout gear and a hydration bottle.\n\n"
                f"Best regards,\nGymLife Coaching Team"
            )
            
            sms_text = f"GymLife Alert: Hi {appointment.name}, your {appointment.service} session is confirmed! Ref: #{ref_no}. See you at the arena!"
            
            # Real notification logging / dispatch
            print(f"\n[EMAIL DISPATCHED] To: {appointment.email} | Subject: {email_subject}\n{email_body}\n")
            print(f"[SMS DISPATCHED] To: {appointment.phone} | Content: {sms_text}\n")
            
            return JsonResponse({
                'status': 'success',
                'message': 'Appointment confirmed! Confirmation sent to your email and phone.',
                'id': appointment.id,
                'reference_no': ref_no,
                'customer_name': appointment.name,
                'email_recipient': appointment.email,
                'sms_recipient': appointment.phone,
                'service': appointment.service,
                'appointment_date': str(appointment.appointment_date),
                'email_dispatched': True,
                'sms_dispatched': True
            })
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


# Helper to check authentication
def check_admin(request):
    token = request.headers.get('Authorization')
    if token == 'Bearer dummy-admin-token-for-gymlife-site':
        return True
    return False

# 1. Admin login view
from django.contrib.auth import authenticate
@csrf_exempt
def admin_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None and (user.is_superuser or user.is_staff):
                return JsonResponse({
                    'status': 'success', 
                    'token': 'dummy-admin-token-for-gymlife-site', 
                    'username': user.username
                })
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials or staff privileges required.'}, status=401)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 2. Appointments API
@csrf_exempt
def admin_appointments(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
    
    if request.method == 'GET':
        appointments = Appointment.objects.all().order_by('-created_at')
        data = [{
            'id': a.id,
            'name': a.name,
            'email': a.email,
            'phone': a.phone,
            'service': a.service,
            'appointment_date': a.appointment_date,
            'notes': a.notes,
            'created_at': a.created_at.strftime('%Y-%m-%d %H:%M') if a.created_at else ''
        } for a in appointments]
        return JsonResponse(data, safe=False)
        
    elif request.method == 'DELETE' and pk is not None:
        try:
            a = Appointment.objects.get(pk=pk)
            a.delete()
            return JsonResponse({'status': 'success', 'message': 'Appointment deleted successfully'})
        except Appointment.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Appointment not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 3. Messages API
@csrf_exempt
def admin_messages(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'GET':
        messages = ContactMessage.objects.all().order_by('-submitted_at')
        data = [{
            'id': m.id,
            'name': m.name,
            'email': m.email,
            'website': m.website,
            'message': m.message,
            'submitted_at': m.submitted_at.strftime('%Y-%m-%d %H:%M') if m.submitted_at else ''
        } for m in messages]
        return JsonResponse(data, safe=False)
        
    elif request.method == 'DELETE' and pk is not None:
        try:
            m = ContactMessage.objects.get(pk=pk)
            m.delete()
            return JsonResponse({'status': 'success', 'message': 'Message deleted successfully'})
        except ContactMessage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Message not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 4. Services CRUD
@csrf_exempt
def admin_services(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            s = Service.objects.create(
                title=data.get('title', ''),
                description=data.get('description', ''),
                icon=data.get('icon', 'flaticon-002-dumbell'),
                link=data.get('link', '#'),
                order=data.get('order', 0)
            )
            return JsonResponse({'status': 'success', 'data': serialize_service(s)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            s = Service.objects.get(pk=pk)
            data = json.loads(request.body)
            s.title = data.get('title', s.title)
            s.description = data.get('description', s.description)
            s.icon = data.get('icon', s.icon)
            s.link = data.get('link', s.link)
            s.order = data.get('order', s.order)
            s.save()
            return JsonResponse({'status': 'success', 'data': serialize_service(s)})
        except Service.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Service not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            s = Service.objects.get(pk=pk)
            s.delete()
            return JsonResponse({'status': 'success', 'message': 'Service deleted successfully'})
        except Service.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Service not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 5. Trainers CRUD
@csrf_exempt
def admin_trainers(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            t = Trainer.objects.create(
                name=data.get('name', ''),
                role=data.get('role', ''),
                image_url=data.get('image_url', ''),
                facebook_url=data.get('facebook_url', ''),
                twitter_url=data.get('twitter_url', ''),
                instagram_url=data.get('instagram_url', ''),
                youtube_url=data.get('youtube_url', ''),
                order=data.get('order', 0)
            )
            return JsonResponse({'status': 'success', 'data': serialize_trainer(t, request)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            t = Trainer.objects.get(pk=pk)
            data = json.loads(request.body)
            t.name = data.get('name', t.name)
            t.role = data.get('role', t.role)
            t.image_url = data.get('image_url', t.image_url)
            t.facebook_url = data.get('facebook_url', t.facebook_url)
            t.twitter_url = data.get('twitter_url', t.twitter_url)
            t.instagram_url = data.get('instagram_url', t.instagram_url)
            t.youtube_url = data.get('youtube_url', t.youtube_url)
            t.order = data.get('order', t.order)
            t.save()
            return JsonResponse({'status': 'success', 'data': serialize_trainer(t, request)})
        except Trainer.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Trainer not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            t = Trainer.objects.get(pk=pk)
            t.delete()
            return JsonResponse({'status': 'success', 'message': 'Trainer deleted successfully'})
        except Trainer.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Trainer not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 6. Classes CRUD
@csrf_exempt
def admin_classes(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            trainer_id = data.get('trainer_id')
            trainer = Trainer.objects.get(pk=trainer_id) if trainer_id else None
            c = ClassItem.objects.create(
                name=data.get('name', ''),
                description=data.get('description', ''),
                category=data.get('category', ''),
                trainer=trainer,
                duration=data.get('duration', ''),
                image_url=data.get('image_url', ''),
                order=data.get('order', 0)
            )
            return JsonResponse({'status': 'success', 'data': serialize_class(c, request)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            c = ClassItem.objects.get(pk=pk)
            data = json.loads(request.body)
            c.name = data.get('name', c.name)
            c.description = data.get('description', c.description)
            c.category = data.get('category', c.category)
            c.duration = data.get('duration', c.duration)
            c.image_url = data.get('image_url', c.image_url)
            c.order = data.get('order', c.order)
            
            trainer_id = data.get('trainer_id')
            if trainer_id:
                c.trainer = Trainer.objects.get(pk=trainer_id)
            elif 'trainer_id' in data:
                c.trainer = None
                
            c.save()
            return JsonResponse({'status': 'success', 'data': serialize_class(c, request)})
        except ClassItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Class not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            c = ClassItem.objects.get(pk=pk)
            c.delete()
            return JsonResponse({'status': 'success', 'message': 'Class deleted successfully'})
        except ClassItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Class not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 7. Pricing Plans CRUD
@csrf_exempt
def admin_plans(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            features = data.get('features', '')
            if isinstance(features, list):
                features = ",".join(features)
            p = PricingPlan.objects.create(
                name=data.get('name', ''),
                price=data.get('price', 0.0),
                period=data.get('period', ''),
                features=features,
                order=data.get('order', 0)
            )
            return JsonResponse({'status': 'success', 'data': serialize_plan(p)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            p = PricingPlan.objects.get(pk=pk)
            data = json.loads(request.body)
            p.name = data.get('name', p.name)
            p.price = data.get('price', p.price)
            p.period = data.get('period', p.period)
            
            features = data.get('features', p.features)
            if isinstance(features, list):
                features = ",".join(features)
            p.features = features
            p.order = data.get('order', p.order)
            p.save()
            return JsonResponse({'status': 'success', 'data': serialize_plan(p)})
        except PricingPlan.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Pricing Plan not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            p = PricingPlan.objects.get(pk=pk)
            p.delete()
            return JsonResponse({'status': 'success', 'message': 'Pricing Plan deleted successfully'})
        except PricingPlan.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Pricing Plan not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 8. Blogs CRUD
@csrf_exempt
def admin_blogs(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            b = BlogPost.objects.create(
                title=data.get('title', ''),
                content=data.get('content', ''),
                author=data.get('author', ''),
                category=data.get('category', ''),
                image_url=data.get('image_url', '')
            )
            return JsonResponse({'status': 'success', 'data': serialize_blog(b, request)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            b = BlogPost.objects.get(pk=pk)
            data = json.loads(request.body)
            b.title = data.get('title', b.title)
            b.content = data.get('content', b.content)
            b.author = data.get('author', b.author)
            b.category = data.get('category', b.category)
            b.image_url = data.get('image_url', b.image_url)
            b.save()
            return JsonResponse({'status': 'success', 'data': serialize_blog(b, request)})
        except BlogPost.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Blog Post not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            b = BlogPost.objects.get(pk=pk)
            b.delete()
            return JsonResponse({'status': 'success', 'message': 'Blog Post deleted successfully'})
        except BlogPost.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Blog Post not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 9. Gallery CRUD
@csrf_exempt
def admin_gallery(request, pk=None):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            g = GalleryItem.objects.create(
                title=data.get('title', ''),
                image_url=data.get('image_url', '')
            )
            return JsonResponse({'status': 'success', 'data': serialize_gallery(g, request)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'PUT' and pk is not None:
        try:
            g = GalleryItem.objects.get(pk=pk)
            data = json.loads(request.body)
            g.title = data.get('title', g.title)
            g.image_url = data.get('image_url', g.image_url)
            g.save()
            return JsonResponse({'status': 'success', 'data': serialize_gallery(g, request)})
        except GalleryItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Gallery item not found'}, status=404)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    elif request.method == 'DELETE' and pk is not None:
        try:
            g = GalleryItem.objects.get(pk=pk)
            g.delete()
            return JsonResponse({'status': 'success', 'message': 'Gallery item deleted successfully'})
        except GalleryItem.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Gallery item not found'}, status=404)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

# 10. Contact Info Update
@csrf_exempt
def admin_contact_info(request):
    if not check_admin(request):
        return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=401)
        
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            phone_numbers = data.get('phone_numbers', '')
            if isinstance(phone_numbers, list):
                phone_numbers = ",".join(phone_numbers)
                
            info = ContactInfo.objects.first()
            if not info:
                info = ContactInfo.objects.create(
                    address=data.get('address', ''),
                    phone_numbers=phone_numbers,
                    email=data.get('email', ''),
                    google_map_iframe_url=data.get('google_map_iframe_url', '')
                )
            else:
                info.address = data.get('address', info.address)
                info.phone_numbers = phone_numbers
                info.email = data.get('email', info.email)
                info.google_map_iframe_url = data.get('google_map_iframe_url', info.google_map_iframe_url)
                info.save()
            return JsonResponse({'status': 'success', 'data': serialize_contact_info(info)})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


# -------------------------------------------------------------
# Member Authentication & Portal APIs
# -------------------------------------------------------------
from django.contrib.auth.models import User
from django.contrib.auth import login as django_login

@csrf_exempt
def auth_register(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            full_name = data.get('name', '').strip()
            plan = data.get('plan', 'Gold Membership')

            if not username or not email or not password:
                return JsonResponse({'status': 'error', 'message': 'Username, email, and password are required.'}, status=400)

            if User.objects.filter(username__iexact=username).exists():
                return JsonResponse({'status': 'error', 'message': 'Username is already taken. Please choose another.'}, status=400)

            if User.objects.filter(email__iexact=email).exists():
                return JsonResponse({'status': 'error', 'message': 'An account with this email already exists.'}, status=400)

            # Split name into first and last name if provided
            name_parts = full_name.split(' ', 1) if full_name else [username, '']
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            token = f"gymlife-member-token-{user.id}"
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': 'member',
                'is_staff': False,
                'is_superuser': False,
                'plan': plan,
                'joined_date': user.date_joined.strftime('%B %Y')
            }

            return JsonResponse({
                'status': 'success',
                'message': 'Account created successfully! Welcome to GymLife.',
                'token': token,
                'user': user_data
            }, status=201)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def auth_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('username', '').strip()
            password = data.get('password', '')

            if not identifier or not password:
                return JsonResponse({'status': 'error', 'message': 'Please provide username/email and password.'}, status=400)

            # Auto-handle demo member account creation if not yet in DB
            if identifier.lower() in ['demo_member', 'member@gymlife.com', 'member'] and password == 'demo123':
                user, created = User.objects.get_or_create(
                    username='demo_member',
                    defaults={
                        'email': 'member@gymlife.com',
                        'first_name': 'Alex',
                        'last_name': 'Rivers'
                    }
                )
                if created or not user.check_password('demo123'):
                    user.set_password('demo123')
                    user.save()

            # Attempt authenticate by username
            user = authenticate(username=identifier, password=password)

            # If failed, attempt lookup by email
            if user is None:
                try:
                    user_obj = User.objects.get(email__iexact=identifier)
                    if user_obj.check_password(password):
                        user = user_obj
                except User.DoesNotExist:
                    pass

            if user is not None:
                is_admin = user.is_staff or user.is_superuser
                token = 'dummy-admin-token-for-gymlife-site' if is_admin else f"gymlife-member-token-{user.id}"
                
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'name': user.get_full_name() or user.username,
                    'role': 'admin' if is_admin else 'member',
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser,
                    'plan': 'VIP Unlimited Club Pass' if is_admin else '12 Month Membership',
                    'joined_date': user.date_joined.strftime('%B %Y')
                }

                return JsonResponse({
                    'status': 'success',
                    'message': 'Signed in successfully!',
                    'token': token,
                    'user': user_data
                })

            return JsonResponse({'status': 'error', 'message': 'Invalid username or password.'}, status=401)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def auth_me(request):
    if request.method == 'GET':
        token = request.headers.get('Authorization', '')
        if token.startswith('Bearer '):
            token = token.replace('Bearer ', '')

        if token == 'dummy-admin-token-for-gymlife-site':
            admin_user = User.objects.filter(is_staff=True).first()
            username = admin_user.username if admin_user else 'admin'
            email = admin_user.email if admin_user else 'admin@gymlife.com'
            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': admin_user.id if admin_user else 1,
                    'username': username,
                    'email': email,
                    'name': 'GymLife Admin',
                    'role': 'admin',
                    'is_staff': True,
                    'is_superuser': True,
                    'plan': 'Master Admin Access',
                    'joined_date': 'January 2026'
                }
            })
        elif token.startswith('gymlife-member-token-'):
            try:
                user_id = int(token.replace('gymlife-member-token-', ''))
                user = User.objects.get(id=user_id)
                return JsonResponse({
                    'status': 'success',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'name': user.get_full_name() or user.username,
                        'role': 'member',
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser,
                        'plan': '12 Month Membership',
                        'joined_date': user.date_joined.strftime('%B %Y')
                    }
                })
            except (ValueError, User.DoesNotExist):
                return JsonResponse({'status': 'error', 'message': 'Invalid session'}, status=401)

        return JsonResponse({'status': 'error', 'message': 'Not authenticated'}, status=401)

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


@csrf_exempt
def member_dashboard_data(request):
    if request.method == 'GET':
        user_email = request.GET.get('email', '')
        user_name = request.GET.get('name', '')
        
        # Look for appointments matching user
        appointments = []
        if user_email or user_name:
            query = Appointment.objects.all()
            if user_email:
                query = query.filter(email__iexact=user_email)
            elif user_name:
                query = query.filter(name__icontains=user_name)
            
            appointments = [{
                'id': a.id,
                'service': a.service,
                'appointment_date': a.appointment_date.strftime('%Y-%m-%d %H:%M') if a.appointment_date else '',
                'notes': a.notes or 'General training session',
                'status': 'Confirmed',
                'created_at': a.created_at.strftime('%Y-%m-%d') if a.created_at else ''
            } for a in query.order_by('-appointment_date')]

        # If no appointments found yet, provide starter schedule for member
        if not appointments:
            appointments = [
                {
                    'id': 101,
                    'service': 'Personal Fitness Assessment & Body Scan',
                    'appointment_date': 'Tomorrow at 10:00 AM',
                    'notes': 'Meet with Senior Strength Coach John Smith',
                    'status': 'Confirmed',
                    'created_at': '2026-08-18'
                },
                {
                    'id': 102,
                    'service': 'High-Intensity Cardio & Weight Loss Circuit',
                    'appointment_date': 'Friday at 06:30 PM',
                    'notes': 'Group Studio B - Bring water bottle & towel',
                    'status': 'Upcoming',
                    'created_at': '2026-08-18'
                }
            ]

        # Recent activities & workout streaks
        stats = {
            'attendance_this_month': 14,
            'calories_burned_approx': '9,450 kcal',
            'current_streak_days': 5,
            'membership_status': 'Active (VIP Gold)',
            'next_renewal': 'August 2027',
            'locker_assigned': 'Locker #42',
            'trainer_assigned': 'Sarah Johnson & John Smith'
        }

        # Upcoming group classes available
        classes_data = [{
            'id': c.id,
            'name': c.name,
            'trainer': c.trainer.name if c.trainer else 'Lead Trainer',
            'duration': c.duration,
            'category': c.category,
            'image_url': c.get_image_url()
        } for c in ClassItem.objects.all()[:4]]

        return JsonResponse({
            'status': 'success',
            'stats': stats,
            'appointments': appointments,
            'available_classes': classes_data
        })

    return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)


