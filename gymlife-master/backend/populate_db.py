import os
import django
from datetime import datetime, date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gymlife_project.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import (
    AdminProfile, Service, Trainer, ClassItem, ClassSchedule,
    PricingPlan, Member, Payment, ContactMessage, BlogPost,
    GalleryItem, ContactInfo, GymSettings, Notification, AuditLog, Appointment
)

print("--- Seeding GymLife Production Database ---")

# 1. Admin Users & Profiles
admin_user, _ = User.objects.get_or_create(
    username='admin',
    defaults={'email': 'admin@gymlife.com', 'first_name': 'GymLife', 'last_name': 'Master Admin', 'is_staff': True, 'is_superuser': True}
)
admin_user.set_password('admin123')
admin_user.is_staff = True
admin_user.is_superuser = True
admin_user.save()

AdminProfile.objects.update_or_create(
    user=admin_user,
    defaults={
        'role': 'SUPER_ADMIN',
        'phone': '+1 (555) 019-2834',
        'avatar_url': '/img/team/team-1.jpg'
    }
)

staff_user, _ = User.objects.get_or_create(
    username='staff_john',
    defaults={'email': 'john.staff@gymlife.com', 'first_name': 'John', 'last_name': 'Coach', 'is_staff': True, 'is_superuser': False}
)
staff_user.set_password('staff123')
staff_user.is_staff = True
staff_user.save()

AdminProfile.objects.update_or_create(
    user=staff_user,
    defaults={
        'role': 'STAFF',
        'phone': '+1 (555) 019-5521',
        'avatar_url': '/img/team/team-2.jpg'
    }
)

# 2. Services
Service.objects.all().delete()
services = [
    Service.objects.create(
        title='Modern Equipment',
        description='High-performance biometric machines, Olympic lifting platforms, and free weights.',
        icon='flaticon-034-stationary-bike',
        link='/services',
        order=1
    ),
    Service.objects.create(
        title='Healthy Nutrition Plan',
        description='Custom macro breakdowns and personalized dietary consultations from certified nutritionists.',
        icon='flaticon-033-juice',
        link='/services',
        order=2
    ),
    Service.objects.create(
        title='Professional Training',
        description='1-on-1 science-driven strength & conditioning programs designed for rapid results.',
        icon='flaticon-002-dumbell',
        link='/services',
        order=3
    ),
    Service.objects.create(
        title='Unique to Your Needs',
        description='Body composition assessments, heart-rate tracking, and tailored functional coaching.',
        icon='flaticon-014-heart-beat',
        link='/services',
        order=4
    ),
]

# 3. Trainers
Trainer.objects.all().delete()
t1 = Trainer.objects.create(
    name='John Smith',
    email='john.smith@gymlife.com',
    phone='+1 (555) 234-8901',
    role='Head Strength & Powerlifting Coach',
    specialization='Powerlifting, Hypertrophy & Biomechanics',
    experience_years=8,
    qualification='CSCS, NSCA Certified Master Trainer',
    bio='Former collegiate powerlifting champion with over 8 years coaching elite athletes and everyday gym goers.',
    availability='Mon - Fri (06:00 - 16:00)',
    status='ACTIVE',
    image_url='/img/team/team-1.jpg',
    facebook_url='https://facebook.com',
    twitter_url='https://twitter.com',
    instagram_url='https://instagram.com',
    youtube_url='https://youtube.com',
    order=1
)

t2 = Trainer.objects.create(
    name='Sarah Johnson',
    email='sarah.j@gymlife.com',
    phone='+1 (555) 345-9012',
    role='Yoga, Pilates & Mobility Specialist',
    specialization='Vinyasa Flow, Core Rehabilitation & Flexibility',
    experience_years=6,
    qualification='RYT-500 Yoga Master, Pilates Mat Certified',
    bio='Dedicated to restoring postural alignment, mental focus, and functional spinal decompression through dynamic yoga.',
    availability='Mon - Sat (07:00 - 18:00)',
    status='ACTIVE',
    image_url='/img/team/team-2.jpg',
    facebook_url='https://facebook.com',
    twitter_url='https://twitter.com',
    instagram_url='https://instagram.com',
    youtube_url='https://youtube.com',
    order=2
)

t3 = Trainer.objects.create(
    name='Mike Davis',
    email='mike.davis@gymlife.com',
    phone='+1 (555) 456-0123',
    role='HIIT & Functional Cardio Specialist',
    specialization='Metabolic Conditioning, VO2 Max & Endurance',
    experience_years=5,
    qualification='NASM-CPT, Precision Nutrition Level 1',
    bio='High-energy coaching style focused on burning maximal calories and enhancing cardiovascular stamina.',
    availability='Tue - Sun (08:00 - 20:00)',
    status='ACTIVE',
    image_url='/img/team/team-3.jpg',
    facebook_url='https://facebook.com',
    twitter_url='https://twitter.com',
    instagram_url='https://instagram.com',
    youtube_url='https://youtube.com',
    order=3
)

t4 = Trainer.objects.create(
    name='Emma Wilson',
    email='emma.w@gymlife.com',
    phone='+1 (555) 567-1234',
    role='CrossFit & Combat Boxing Coach',
    specialization='Olympic Lifting, Kettlebells & Kickboxing',
    experience_years=7,
    qualification='CrossFit Level 2, USA Boxing Coach',
    bio='Combines combat martial arts technique with Olympic weightlifting for explosive power and agility.',
    availability='Mon - Fri (10:00 - 21:00)',
    status='ACTIVE',
    image_url='/img/team/team-4.jpg',
    facebook_url='https://facebook.com',
    twitter_url='https://twitter.com',
    instagram_url='https://instagram.com',
    youtube_url='https://youtube.com',
    order=4
)

trainers = [t1, t2, t3, t4]

# 4. Classes
ClassItem.objects.all().delete()
c1 = ClassItem.objects.create(
    name='Heavyweight Strength Training',
    description='Progressive overload barbell training focusing on Squat, Bench Press, and Deadlift mechanics.',
    category='STRENGTH',
    trainer=t1,
    duration='60 mins',
    capacity=20,
    difficulty='Intermediate',
    price=25.00,
    status='ACTIVE',
    image_url='/img/classes/class-1.jpg',
    order=1
)

c2 = ClassItem.objects.create(
    name='Zen Yoga & Spinal Mobility',
    description='Holistic breathwork, vinyasa sun salutations, and deep myofascial release for joint longevity.',
    category='YOGA',
    trainer=t2,
    duration='45 mins',
    capacity=25,
    difficulty='All Levels',
    price=20.00,
    status='ACTIVE',
    image_url='/img/classes/class-2.jpg',
    order=2
)

c3 = ClassItem.objects.create(
    name='High-Octane Cardio Blast',
    description='Heart rate zone 4 HIIT circuit using assault bikes, rowing ergometers, and agility ladders.',
    category='CARDIO',
    trainer=t3,
    duration='50 mins',
    capacity=30,
    difficulty='Intermediate',
    price=20.00,
    status='ACTIVE',
    image_url='/img/classes/class-3.jpg',
    order=3
)

c4 = ClassItem.objects.create(
    name='CrossFit WOD & Kettlebell Power',
    description='Dynamic functional fitness involving cleans, kettlebell snatches, and high-intensity bodyweight routines.',
    category='CROSSFIT',
    trainer=t4,
    duration='60 mins',
    capacity=18,
    difficulty='Advanced',
    price=30.00,
    status='ACTIVE',
    image_url='/img/classes/class-4.jpg',
    order=4
)

c5 = ClassItem.objects.create(
    name='Knockout Boxing & Core Conditioning',
    description='Authentic heavy bag combinations, shadow boxing drills, and abdominal isolation work.',
    category='BOXING',
    trainer=t4,
    duration='55 mins',
    capacity=22,
    difficulty='All Levels',
    price=25.00,
    status='ACTIVE',
    image_url='/img/classes/class-5.jpg',
    order=5
)

# 5. Class Schedules / Timetable
ClassSchedule.objects.all().delete()
schedules_data = [
    # Monday
    (c1, t1, 'Monday', '06:00', '08:00', 'Strength Studio A'),
    (c2, t2, 'Monday', '10:00', '12:00', 'Yoga & Wellness Hall'),
    (c3, t3, 'Monday', '17:00', '19:00', 'Main Cardio Arena'),
    (c5, t4, 'Monday', '19:00', '21:00', 'Boxing Ring Studio'),

    # Tuesday
    (c3, t3, 'Tuesday', '06:00', '08:00', 'Main Cardio Arena'),
    (c1, t1, 'Tuesday', '10:00', '12:00', 'Strength Studio A'),
    (c5, t4, 'Tuesday', '17:00', '19:00', 'Boxing Ring Studio'),
    (c2, t2, 'Tuesday', '19:00', '21:00', 'Yoga & Wellness Hall'),

    # Wednesday
    (c2, t2, 'Wednesday', '06:00', '08:00', 'Yoga & Wellness Hall'),
    (c4, t4, 'Wednesday', '10:00', '12:00', 'CrossFit Floor'),
    (c1, t1, 'Wednesday', '17:00', '19:00', 'Strength Studio A'),
    (c3, t3, 'Wednesday', '19:00', '21:00', 'Main Cardio Arena'),

    # Thursday
    (c1, t1, 'Thursday', '06:00', '08:00', 'Strength Studio A'),
    (c3, t3, 'Thursday', '10:00', '12:00', 'Main Cardio Arena'),
    (c2, t2, 'Thursday', '17:00', '19:00', 'Yoga & Wellness Hall'),
    (c4, t4, 'Thursday', '19:00', '21:00', 'CrossFit Floor'),

    # Friday
    (c5, t4, 'Friday', '06:00', '08:00', 'Boxing Ring Studio'),
    (c1, t1, 'Friday', '10:00', '12:00', 'Strength Studio A'),
    (c3, t3, 'Friday', '17:00', '19:00', 'Main Cardio Arena'),
    (c2, t2, 'Friday', '19:00', '21:00', 'Yoga & Wellness Hall'),

    # Saturday
    (c4, t4, 'Saturday', '08:00', '10:00', 'CrossFit Floor'),
    (c1, t1, 'Saturday', '10:00', '12:00', 'Strength Studio A'),
    (c5, t4, 'Saturday', '14:00', '16:00', 'Boxing Ring Studio'),
    (c2, t2, 'Saturday', '16:00', '18:00', 'Yoga & Wellness Hall'),

    # Sunday
    (c2, t2, 'Sunday', '08:00', '10:00', 'Yoga & Wellness Hall'),
    (c3, t3, 'Sunday', '10:00', '12:00', 'Main Cardio Arena'),
    (c1, t1, 'Sunday', '14:00', '16:00', 'Strength Studio A'),
]

for class_item, trainer, day, start_time, end_time, room in schedules_data:
    ClassSchedule.objects.create(
        class_item=class_item,
        trainer=trainer,
        day_of_week=day,
        start_time=start_time,
        end_time=end_time,
        room=room,
        capacity=25,
        status='ACTIVE'
    )

# 6. Pricing Plans
PricingPlan.objects.all().delete()
p1 = PricingPlan.objects.create(
    name='Class Drop-in Pass',
    price=499.00,
    period='SINGLE PASS',
    description='Ideal for visitors and flexible drop-in fitness sessions.',
    features='Full gym floor access, Locker & steam room, 1 group class included, Personal trainer intro, Free hydration station, Free Wi-Fi access',
    status='ACTIVE',
    order=1
)

p2 = PricingPlan.objects.create(
    name='12 Month VIP Membership',
    price=14999.00,
    period='12 MONTHS UNLIMITED',
    description='All-inclusive ultimate fitness pass with dedicated coaching & VIP amenities.',
    features='24/7 Unlimited club access, InBody composition scan, Dedicated personal trainer, Unlimited group & spin classes, 2 Monthly guest passes, Sauna & recovery lounge',
    status='ACTIVE',
    order=2
)

p3 = PricingPlan.objects.create(
    name='6 Month Active Membership',
    price=8999.00,
    period='6 MONTHS ACCESS',
    description='Comprehensive training pass for dedicated fitness enthusiasts.',
    features='Unlimited club access, Certified fitness assessment, Nutrition strategy plan, Group HIIT & yoga classes, Locker & shower amenities, Free guest pass every month',
    status='ACTIVE',
    order=3
)

plans = [p1, p2, p3]

# 7. Members
Member.objects.all().delete()
today = date.today()

demo_user = User.objects.filter(username='demo_member').first()
m1 = Member.objects.create(
    user=demo_user,
    full_name='Alex Rivers',
    email='member@gymlife.com',
    phone='+1 (555) 789-0123',
    date_of_birth=date(1994, 5, 14),
    gender='Male',
    address='742 Evergreen Terrace, Springfield',
    emergency_contact='Jane Rivers (+1 555-789-9999)',
    profile_photo_url='/img/team/team-1.jpg',
    plan=p2,
    start_date=today - timedelta(days=60),
    expiry_date=today + timedelta(days=305),
    status='ACTIVE',
    payment_status='PAID',
    notes='Prefers evening strength and powerlifting sessions.'
)

m2 = Member.objects.create(
    full_name='Marcus Vance',
    email='marcus.vance@example.com',
    phone='+1 (555) 890-1234',
    date_of_birth=date(1989, 11, 23),
    gender='Male',
    address='108 Ocean Drive, Miami, FL',
    emergency_contact='Rachel Vance (+1 555-890-9999)',
    profile_photo_url='/img/team/team-2.jpg',
    plan=p2,
    start_date=today - timedelta(days=120),
    expiry_date=today + timedelta(days=245),
    status='ACTIVE',
    payment_status='PAID',
    notes='Rehab knee program with Coach Sarah.'
)

m3 = Member.objects.create(
    full_name='Sophia Chen',
    email='sophia.chen@example.com',
    phone='+1 (555) 901-2345',
    date_of_birth=date(1998, 3, 19),
    gender='Female',
    address='45 Market St, San Francisco, CA',
    emergency_contact='David Chen (+1 555-901-8888)',
    profile_photo_url='/img/team/team-3.jpg',
    plan=p3,
    start_date=today - timedelta(days=150),
    expiry_date=today + timedelta(days=30),
    status='ACTIVE',
    payment_status='PAID',
    notes='Focus on VO2 max and HIIT conditioning.'
)

m4 = Member.objects.create(
    full_name='Liam Gallagher',
    email='liam.g@example.com',
    phone='+1 (555) 012-3456',
    date_of_birth=date(1992, 8, 8),
    gender='Male',
    address='12 High St, Boston, MA',
    emergency_contact='Noel Gallagher (+1 555-012-7777)',
    profile_photo_url='/img/team/team-4.jpg',
    plan=p1,
    start_date=today - timedelta(days=10),
    expiry_date=today - timedelta(days=3),
    status='EXPIRED',
    payment_status='PENDING',
    notes='Single pass expired. Followed up for 6-month renewal.'
)

m5 = Member.objects.create(
    full_name='Elena Rostova',
    email='elena.rostova@example.com',
    phone='+1 (555) 123-4567',
    date_of_birth=date(1996, 7, 30),
    gender='Female',
    address='88 Central Ave, Seattle, WA',
    emergency_contact='Ivan Rostov (+1 555-123-6666)',
    profile_photo_url='/img/team/team-2.jpg',
    plan=p3,
    start_date=today - timedelta(days=30),
    expiry_date=today + timedelta(days=150),
    status='ACTIVE',
    payment_status='PAID',
    notes='Attends Boxing & Core conditioning every Tuesday.'
)

members = [m1, m2, m3, m4, m5]

# 8. Payments
Payment.objects.all().delete()
Payment.objects.create(
    payment_id='PAY-2026-0801',
    member=m1,
    plan=p2,
    amount=14999.00,
    payment_method='Credit Card',
    transaction_id='TXN_VIP_998124',
    status='PAID',
    notes='Annual VIP renewal via Visa'
)

Payment.objects.create(
    payment_id='PAY-2026-0802',
    member=m2,
    plan=p2,
    amount=14999.00,
    payment_method='Online Gateway',
    transaction_id='TXN_VIP_887231',
    status='PAID',
    notes='Direct Stripe online checkout'
)

Payment.objects.create(
    payment_id='PAY-2026-0803',
    member=m3,
    plan=p3,
    amount=8999.00,
    payment_method='UPI / Google Pay',
    transaction_id='TXN_UPI_665421',
    status='PAID',
    notes='6 Months Active plan subscription'
)

Payment.objects.create(
    payment_id='PAY-2026-0804',
    member=m4,
    plan=p1,
    amount=499.00,
    payment_method='Cash',
    transaction_id='TXN_CASH_10023',
    status='PAID',
    notes='Front desk drop-in pass'
)

Payment.objects.create(
    payment_id='PAY-2026-0805',
    member=m5,
    plan=p3,
    amount=8999.00,
    payment_method='Debit Card',
    transaction_id='TXN_DEBIT_554129',
    status='PAID',
    notes='6 Month registration'
)

# 9. Contact Messages
ContactMessage.objects.all().delete()
ContactMessage.objects.create(
    name='Daniel Craig',
    email='daniel.craig@example.com',
    phone='+1 (555) 678-9012',
    subject='Personal Trainer Availability for Strength Goals',
    message='Hi GymLife team, I would like to enquire about personal training packages with Coach John Smith for hypertrophy and conditioning.',
    status='NEW'
)

ContactMessage.objects.create(
    name='Samantha Hayes',
    email='samantha.hayes@example.com',
    phone='+1 (555) 789-0123',
    subject='Corporate Membership Discounts',
    message='Does GymLife provide corporate discount passes for tech companies in Rindge with 25+ employees?',
    status='READ'
)

ContactMessage.objects.create(
    name='George Miller',
    email='george.m@example.com',
    phone='+1 (555) 890-1234',
    subject='Weekend Timetable Enquiry',
    message='Are Saturday morning CrossFit sessions open for drop-in pass holders? Thanks!',
    status='REPLIED'
)

# 10. Blog Posts
BlogPost.objects.all().delete()
b1 = BlogPost.objects.create(
    title='The Scientific Blueprint for Lean Muscle & Strength Gains',
    slug='scientific-blueprint-lean-muscle',
    short_description='Understand progressive overload, protein synthesis, and muscle hypertrophy science.',
    content="""Building lean muscle mass requires a structured, science-backed approach combining progressive mechanical tension, metabolic stress, and adequate myofibrillar recovery.

### 1. Progressive Overload
The fundamental driver of muscular hypertrophy is systematically increasing the training stimulus over time. This can be accomplished through increased load, increased repetitions in reserve (RIR), or enhanced movement control.

### 2. Nutritional Optimization
Muscle protein synthesis (MPS) is maximized when consuming 1.6 - 2.2 grams of high biological value protein per kilogram of body mass per day, spaced evenly across 3 to 5 meals containing adequate leucine content.

### 3. Sleep & Endocrine Health
Growth hormone release and autonomic nervous system recovery occur predominantly during slow-wave non-REM sleep cycles. Aim for 7 to 9 hours of uninterrupted sleep every night.""",
    author='John Smith',
    category='STRENGTH',
    status='PUBLISHED',
    image_url='/img/blog/blog-1.jpg'
)

b2 = BlogPost.objects.create(
    title='Essential Nutrition Strategies for Fat Loss and Performance',
    slug='essential-nutrition-strategies-fat-loss',
    short_description='Master energy balance, macronutrient timing, and hydration for athletic body recomposition.',
    content="""Achieving sustainable body recomposition without sacrificing training intensity demands strategic nutritional periodization.

### 1. The Principle of Energy Balance
Sustainable fat oxidation requires a moderate caloric deficit of 300 to 500 calories below maintenance, preserving lean muscle while steadily mobilizing adipose tissue stores.

### 2. Micronutrients & Hydration
Cellular hydration and electrolyte balance (Sodium, Potassium, Magnesium) are critical for muscular contraction velocity and preventing central nervous fatigue during intense cardio and lifting circuits.

### 3. Nutrient Timing Around Training
Consuming easily digestible carbohydrates 60-90 minutes before high-intensity workouts ensures maximal glycogen availability and higher training volume capacity.""",
    author='Sarah Johnson',
    category='NUTRITION',
    status='PUBLISHED',
    image_url='/img/blog/blog-2.jpg'
)

b3 = BlogPost.objects.create(
    title='Mobility & Joint Prehab: Longevity for Lifters',
    slug='mobility-joint-prehab-longevity',
    short_description='Prehab protocols to maintain healthy rotator cuffs, hips, and spinal erectors.',
    content="""Consistent heavy lifting must be complemented with targeted joint mobilization and soft tissue prehabilitation to prevent overuse syndromes and ensure lifelong fitness progress.""",
    author='Emma Wilson',
    category='FITNESS',
    status='PUBLISHED',
    image_url='/img/blog/blog-3.jpg'
)

# 11. Gallery Items
GalleryItem.objects.all().delete()
for i in range(1, 10):
    GalleryItem.objects.create(
        title=f'GymLife Facility Highlight #{i}',
        image_url=f'/img/gallery/gallery-{i}.jpg'
    )

# 12. Contact Info & Gym Settings
ContactInfo.objects.all().delete()
ContactInfo.objects.create(
    address='333 Middle Winchendon Rd, Rindge, NH 03461',
    phone_numbers='125-711-811, 125-668-886',
    email='Support.gymcenter@gmail.com',
    google_map_iframe_url='https://maps.google.com/maps?q=333%20Middle%20Winchendon%20Rd%2C%20Rindge%2C%20NH%2003461&t=&z=14&ie=UTF8&iwloc=&output=embed'
)

GymSettings.objects.all().delete()
GymSettings.objects.create(
    gym_name='GymLife Elite Fitness Arena',
    tagline='Shape Your Ideal Physique With Science-Backed Coaching',
    contact_email='support.gymcenter@gmail.com',
    phone='125-711-811 / 125-668-886',
    address='333 Middle Winchendon Rd, Rindge, NH 03461',
    working_hours_weekday='Monday - Friday: 06:00 - 22:00',
    working_hours_weekend='Saturday - Sunday: 07:00 - 20:00',
    logo_url='/img/logo.png',
    google_map_url='https://maps.google.com/maps?q=333%20Middle%20Winchendon%20Rd%2C%20Rindge%2C%20NH%2003461&t=&z=14&ie=UTF8&iwloc=&output=embed',
    facebook_url='https://www.facebook.com',
    twitter_url='https://www.twitter.com',
    instagram_url='https://www.instagram.com',
    youtube_url='https://www.youtube.com',
    currency_symbol='$',
    tax_percentage=5.00
)

# 13. Notifications
Notification.objects.all().delete()
Notification.objects.create(
    title='New Member Registration: Elena Rostova',
    message='Elena Rostova joined with a 6 Month Active Membership plan.',
    type='MEMBER_REGISTRATION',
    link='/admin/members'
)
Notification.objects.create(
    title='New Contact Enquiry from Daniel Craig',
    message='Daniel Craig submitted an inquiry regarding personal training packages.',
    type='CONTACT_ENQUIRY',
    link='/admin/messages'
)
Notification.objects.create(
    title='Payment Received: $14,999.00',
    message='Annual VIP Membership payment confirmed for Alex Rivers.',
    type='PAYMENT_RECEIVED',
    link='/admin/payments'
)
Notification.objects.create(
    title='Membership Expiry Warning: Liam Gallagher',
    message='Liam Gallagher drop-in pass has expired.',
    type='MEMBERSHIP_EXPIRING',
    link='/admin/members'
)

# 14. Audit Logs
AuditLog.objects.all().delete()
AuditLog.objects.create(
    user='admin',
    action='SYSTEM_INITIALIZATION',
    entity='System',
    entity_id='1',
    ip_address='127.0.0.1',
    details='GymLife production database initialized with comprehensive models and seed records.'
)

print("Database population completed successfully!")
print(f"- {Trainer.objects.count()} Trainers")
print(f"- {ClassItem.objects.count()} Classes")
print(f"- {ClassSchedule.objects.count()} Timetable Schedules")
print(f"- {PricingPlan.objects.count()} Membership Plans")
print(f"- {Member.objects.count()} Members")
print(f"- {Payment.objects.count()} Payments")
print(f"- {ContactMessage.objects.count()} Contact Enquiries")
print(f"- {BlogPost.objects.count()} Blog Posts")
print(f"- {Notification.objects.count()} Notifications")
print(f"- {AuditLog.objects.count()} Audit Logs")
