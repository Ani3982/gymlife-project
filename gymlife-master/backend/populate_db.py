import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymlife_project.settings')
django.setup()

from core.models import Service, Trainer, ClassItem, GalleryItem, BlogPost, PricingPlan, ContactInfo

# Clear existing data
Service.objects.all().delete()
Trainer.objects.all().delete()
ClassItem.objects.all().delete()
GalleryItem.objects.all().delete()
BlogPost.objects.all().delete()
PricingPlan.objects.all().delete()
ContactInfo.objects.all().delete()

# Create Services
services = [
    Service.objects.create(
        title='Modern Equipment',
        description='State-of-the-art fitness equipment to enhance your workout experience.',
        icon='flaticon-034-stationary-bike',
        order=1
    ),
    Service.objects.create(
        title='Healthy Nutrition Plan',
        description='Personalized nutrition plans tailored to your fitness goals.',
        icon='flaticon-033-juice',
        order=2
    ),
    Service.objects.create(
        title='Professional Training',
        description='Expert trainers to guide you through your fitness journey.',
        icon='flaticon-002-dumbell',
        order=3
    ),
    Service.objects.create(
        title='Unique to Your Needs',
        description='Customized fitness programs based on your individual requirements.',
        icon='flaticon-014-heart-beat',
        order=4
    ),
]

# Create Trainers
trainers = [
    Trainer.objects.create(
        name='John Smith',
        role='Strength Coach',
        image_url='/img/team/team-1.jpg',
        order=1
    ),
    Trainer.objects.create(
        name='Sarah Johnson',
        role='Yoga Instructor',
        image_url='/img/team/team-2.jpg',
        order=2
    ),
    Trainer.objects.create(
        name='Mike Davis',
        role='Cardio Specialist',
        image_url='/img/team/team-3.jpg',
        order=3
    ),
    Trainer.objects.create(
        name='Emma Wilson',
        role='CrossFit Coach',
        image_url='/img/team/team-4.jpg',
        order=4
    ),
]

# Create Classes
classes = [
    ClassItem.objects.create(
        name='Strength Training',
        category='STRENGTH',
        trainer=trainers[0],
        duration='60 mins',
        image_url='/img/classes/class-1.jpg',
        order=1
    ),
    ClassItem.objects.create(
        name='Yoga & Meditation',
        category='YOGA',
        trainer=trainers[1],
        duration='45 mins',
        image_url='/img/classes/class-2.jpg',
        order=2
    ),
    ClassItem.objects.create(
        name='Cardio Blast',
        category='CARDIO',
        trainer=trainers[2],
        duration='50 mins',
        image_url='/img/classes/class-3.jpg',
        order=3
    ),
    ClassItem.objects.create(
        name='CrossFit WOD',
        category='CROSSFIT',
        trainer=trainers[3],
        duration='60 mins',
        image_url='/img/classes/class-4.jpg',
        order=4
    ),
    ClassItem.objects.create(
        name='Pilates Core',
        category='PILATES',
        trainer=trainers[1],
        duration='55 mins',
        image_url='/img/classes/class-5.jpg',
        order=5
    ),
]

# Create Gallery Items
gallery_items = [
    GalleryItem.objects.create(image_url='/img/gallery/gallery-1.jpg'),
    GalleryItem.objects.create(image_url='/img/gallery/gallery-2.jpg'),
    GalleryItem.objects.create(image_url='/img/gallery/gallery-3.jpg'),
    GalleryItem.objects.create(image_url='/img/gallery/gallery-4.jpg'),
    GalleryItem.objects.create(image_url='/img/gallery/gallery-5.jpg'),
    GalleryItem.objects.create(image_url='/img/gallery/gallery-6.jpg'),
]

# Create Blog Posts
blogs = [
    BlogPost.objects.create(
        title='The Benefits of Regular Workout',
        content='Regular exercise improves both physical and mental health...',
        author='John Smith',
        category='FITNESS',
        image_url='/img/blog/blog-1.jpg'
    ),
    BlogPost.objects.create(
        title='Nutrition Tips for Fitness',
        content='A balanced diet is crucial for achieving your fitness goals...',
        author='Sarah Johnson',
        category='NUTRITION',
        image_url='/img/blog/blog-2.jpg'
    ),
]

# Create Pricing Plans
plans = [
    PricingPlan.objects.create(
        name='Basic Plan',
        price='29.99',
        period='Per Month',
        features='Gym Access|Basic Equipment|Community Support',
        order=1
    ),
    PricingPlan.objects.create(
        name='Standard Plan',
        price='59.99',
        period='Per Month',
        features='Gym Access|All Equipment|Personal Training (4x/month)|Community Support',
        order=2
    ),
    PricingPlan.objects.create(
        name='Premium Plan',
        price='99.99',
        period='Per Month',
        features='24/7 Gym Access|All Equipment|Personal Training (Unlimited)|Nutrition Counseling|VIP Support',
        order=3
    ),
]

# Create Contact Info
ContactInfo.objects.create(
    address='333 Middle Winchendon Rd, Rindge, NH 03461',
    phone_numbers='125-711-811|125-668-886',
    email='Support.gymcenter@gmail.com',
    google_map_iframe_url='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2915.3658765432103!2d-71.92840232346802!3d42.71618097110682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768'
)

print("✅ Database populated successfully!")
print(f"Created {Service.objects.count()} services")
print(f"Created {Trainer.objects.count()} trainers")
print(f"Created {ClassItem.objects.count()} classes")
print(f"Created {GalleryItem.objects.count()} gallery items")
print(f"Created {BlogPost.objects.count()} blog posts")
print(f"Created {PricingPlan.objects.count()} pricing plans")
print(f"Created 1 contact info")
