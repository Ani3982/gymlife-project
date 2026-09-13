from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
from datetime import datetime

# --------------------------------------------------------------------------
# Admin Profile & Roles
# --------------------------------------------------------------------------
class AdminProfile(models.Model):
    ROLE_CHOICES = [
        ('SUPER_ADMIN', 'Super Administrator'),
        ('ADMIN', 'Administrator'),
        ('STAFF', 'Staff Member'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ADMIN')
    phone = models.CharField(max_length=25, blank=True, null=True)
    avatar_url = models.CharField(max_length=500, blank=True, null=True, default='/img/team/team-1.jpg')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"


# --------------------------------------------------------------------------
# Services & Facilities
# --------------------------------------------------------------------------
class Service(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, default='flaticon-002-dumbell', help_text="e.g., flaticon-034-stationary-bike")
    link = models.CharField(max_length=255, default="#", blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.title


# --------------------------------------------------------------------------
# Trainers
# --------------------------------------------------------------------------
class Trainer(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=25, blank=True, null=True)
    role = models.CharField(max_length=255, help_text="e.g. Strength Coach, Yoga Master")
    specialization = models.CharField(max_length=255, blank=True, null=True, default="Fitness & Strength")
    experience_years = models.IntegerField(default=3)
    qualification = models.CharField(max_length=255, blank=True, null=True, default="Certified Personal Trainer (CPT)")
    bio = models.TextField(blank=True, null=True)
    availability = models.CharField(max_length=255, blank=True, null=True, default="Mon - Sat (07:00 - 19:00)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    image = models.ImageField(upload_to='trainers/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/team/team-1.jpg")
    facebook_url = models.URLField(max_length=500, blank=True, null=True, default="https://facebook.com")
    twitter_url = models.URLField(max_length=500, blank=True, null=True, default="https://twitter.com")
    instagram_url = models.URLField(max_length=500, blank=True, null=True, default="https://instagram.com")
    youtube_url = models.URLField(max_length=500, blank=True, null=True, default="https://youtube.com")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.role})"

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/team/team-1.jpg'


# --------------------------------------------------------------------------
# Classes
# --------------------------------------------------------------------------
class ClassItem(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    DIFFICULTY_CHOICES = [
        ('All Levels', 'All Levels'),
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, help_text="e.g., STRENGTH, CARDIO, YOGA, BOXING, CROSSFIT")
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True, related_name='classes')
    duration = models.CharField(max_length=100, default="60 mins", help_text="e.g., 60 mins")
    capacity = models.IntegerField(default=25)
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES, default='All Levels')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Drop-in price if applicable")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    image = models.ImageField(upload_to='classes/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/classes/class-1.jpg")
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.name

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/classes/class-1.jpg'


# --------------------------------------------------------------------------
# Timetable & Class Schedules
# --------------------------------------------------------------------------
class ClassSchedule(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('CANCELLED', 'Cancelled'),
    ]

    class_item = models.ForeignKey(ClassItem, on_delete=models.CASCADE, related_name='schedules')
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.CharField(max_length=20, help_text="e.g. 06:00 or 6.00am")
    end_time = models.CharField(max_length=20, help_text="e.g. 08:00 or 8.00am")
    room = models.CharField(max_length=100, default="Main Gym Studio", help_text="e.g. Studio A, Boxing Arena, Yoga Hall")
    capacity = models.IntegerField(default=25)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.day_of_week}: {self.class_item.name} ({self.start_time} - {self.end_time})"


# --------------------------------------------------------------------------
# Pricing & Membership Plans
# --------------------------------------------------------------------------
class PricingPlan(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
    ]

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=100, help_text="e.g., SINGLE PASS, 12 MONTHS UNLIMITED, 6 MONTHS ACCESS")
    description = models.TextField(blank=True, null=True)
    features = models.TextField(help_text="Comma-separated or pipe-separated features")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    max_members = models.IntegerField(default=500, blank=True, null=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} (${self.price})"

    def get_features_list(self):
        if '|' in self.features:
            return [f.strip() for f in self.features.split('|') if f.strip()]
        return [f.strip() for f in self.features.split(',') if f.strip()]


# --------------------------------------------------------------------------
# Members Management
# --------------------------------------------------------------------------
class Member(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('EXPIRED', 'Expired'),
        ('SUSPENDED', 'Suspended'),
    ]

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
        ('Prefer not to say', 'Prefer not to say'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('OVERDUE', 'Overdue'),
    ]

    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='member_profile')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=25)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=25, choices=GENDER_CHOICES, default='Prefer not to say')
    address = models.CharField(max_length=500, blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True, help_text="Name & Phone")
    profile_photo = models.ImageField(upload_to='members/', blank=True, null=True)
    profile_photo_url = models.CharField(max_length=500, blank=True, null=True, default='/img/team/team-1.jpg')
    plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    start_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PAID')
    notes = models.TextField(blank=True, null=True)
    join_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-join_date']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    def get_photo_url(self):
        if self.profile_photo:
            return self.profile_photo.url
        return self.profile_photo_url or '/img/team/team-1.jpg'


# --------------------------------------------------------------------------
# Payments & Transactions
# --------------------------------------------------------------------------
class Payment(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    METHOD_CHOICES = [
        ('Credit Card', 'Credit Card'),
        ('Debit Card', 'Debit Card'),
        ('UPI / Google Pay', 'UPI / Google Pay'),
        ('Cash', 'Cash'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Online Gateway', 'Online Gateway'),
    ]

    payment_id = models.CharField(max_length=100, unique=True)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='payments')
    plan = models.ForeignKey(PricingPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=METHOD_CHOICES, default='Credit Card')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PAID')
    notes = models.TextField(blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.payment_id} - {self.member.full_name} (${self.amount})"


# --------------------------------------------------------------------------
# Contact Messages & Enquiries
# --------------------------------------------------------------------------
class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New'),
        ('READ', 'Read'),
        ('REPLIED', 'Replied'),
        ('ARCHIVED', 'Archived'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=25, blank=True, null=True)
    subject = models.CharField(max_length=255, blank=True, null=True, default="General Inquiry")
    website = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"[{self.status}] {self.name} - {self.subject or 'Message'}"


# --------------------------------------------------------------------------
# Blog Posts
# --------------------------------------------------------------------------
class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('PUBLISHED', 'Published'),
        ('DRAFT', 'Draft'),
        ('ARCHIVED', 'Archived'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, blank=True, null=True)
    short_description = models.TextField(blank=True, null=True)
    content = models.TextField()
    author = models.CharField(max_length=255, default="GymLife Admin")
    category = models.CharField(max_length=100, default="Fitness")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PUBLISHED')
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL, e.g. /img/blog/blog-1.jpg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "gymlife-post"
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.status}] {self.title}"

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/blog/blog-1.jpg'


# --------------------------------------------------------------------------
# Gallery Items
# --------------------------------------------------------------------------
class GalleryItem(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL, e.g., /img/gallery/gallery-1.jpg")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title or f"Gallery Item #{self.id}"

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/gallery/gallery-1.jpg'


# --------------------------------------------------------------------------
# Bookings (Appointments & Training Sessions)
# --------------------------------------------------------------------------
class Booking(models.Model):
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed & Scheduled'),
        ('PENDING', 'Pending Confirmation'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    ref_id = models.CharField(max_length=50, unique=True, db_index=True, blank=True, help_text="Format: GYM-YYYY-NNNN")
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=25)
    service = models.CharField(max_length=150, help_text="e.g. Modern Equipment, Personal Training Assessment")
    trainer = models.ForeignKey('Trainer', on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    scheduled_time = models.DateTimeField()
    location = models.CharField(max_length=255, default="GymLife Arena (333 Middle Winchendon Rd)")
    notes = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='CONFIRMED')
    email_delivered = models.BooleanField(default=False)
    sms_delivered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.ref_id or f'Booking #{self.id}'} - {self.name} ({self.service})"

    def save(self, *args, **kwargs):
        if not self.ref_id:
            current_year = timezone.now().year if hasattr(timezone, 'now') else datetime.now().year
            prefix = f"GYM-{current_year}-"
            # Retrieve highest sequence number for the current year
            last_booking = Booking.objects.filter(ref_id__startswith=prefix).order_by('-id').first()
            if last_booking and last_booking.ref_id:
                try:
                    last_num = int(last_booking.ref_id.split('-')[-1])
                    seq_num = last_num + 1
                except (ValueError, IndexError):
                    seq_num = Booking.objects.filter(ref_id__startswith=prefix).count() + 1
            else:
                seq_num = 1
            self.ref_id = f"{prefix}{seq_num:04d}"
        super().save(*args, **kwargs)


# --------------------------------------------------------------------------
# Appointments (Legacy / Public Quick Booking)
# --------------------------------------------------------------------------
class Appointment(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    service = models.CharField(max_length=100)
    appointment_date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.service} on {self.appointment_date}"



# --------------------------------------------------------------------------
# Contact Info & Gym Settings
# --------------------------------------------------------------------------
class ContactInfo(models.Model):
    address = models.CharField(max_length=500)
    phone_numbers = models.CharField(max_length=255, help_text="Comma-separated numbers, e.g., 125-711-811, 125-668-886")
    email = models.EmailField()
    google_map_iframe_url = models.TextField(blank=True, null=True, help_text="Embed link for the map")

    def __str__(self):
        return f"Contact Info - {self.email}"

    def get_phone_list(self):
        return [p.strip() for p in self.phone_numbers.split(',') if p.strip()]


class GymSettings(models.Model):
    gym_name = models.CharField(max_length=255, default="GymLife Fitness Center")
    tagline = models.CharField(max_length=255, default="Shape Your Ideal Body With Elite Coaching", blank=True, null=True)
    contact_email = models.EmailField(default="support.gymcenter@gmail.com")
    phone = models.CharField(max_length=100, default="125-711-811 / 125-668-886")
    address = models.CharField(max_length=500, default="333 Middle Winchendon Rd, Rindge, NH 03461")
    working_hours_weekday = models.CharField(max_length=100, default="Monday - Friday: 06:00 - 22:00")
    working_hours_weekend = models.CharField(max_length=100, default="Saturday - Sunday: 07:00 - 20:00")
    logo_url = models.CharField(max_length=500, default="/img/logo.png", blank=True, null=True)
    google_map_url = models.TextField(blank=True, null=True, default="https://maps.google.com/maps?q=333%20Middle%20Winchendon%20Rd%2C%20Rindge%2C%20NH%2003461&t=&z=14&ie=UTF8&iwloc=&output=embed")
    facebook_url = models.URLField(max_length=500, default="https://www.facebook.com", blank=True, null=True)
    twitter_url = models.URLField(max_length=500, default="https://www.twitter.com", blank=True, null=True)
    instagram_url = models.URLField(max_length=500, default="https://www.instagram.com", blank=True, null=True)
    youtube_url = models.URLField(max_length=500, default="https://www.youtube.com", blank=True, null=True)
    currency_symbol = models.CharField(max_length=10, default="₹")
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)

    # SMTP Email Gateway Settings
    smtp_provider = models.CharField(max_length=50, default="GMAIL", blank=True)
    smtp_host = models.CharField(max_length=255, default="smtp.gmail.com", blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=255, blank=True, default="")
    smtp_password = models.CharField(max_length=255, blank=True, default="")
    smtp_from_email = models.CharField(max_length=255, blank=True, default="GymLife Fitness Arena <support.gymcenter@gmail.com>")
    smtp_use_tls = models.BooleanField(default=True)
    smtp_use_ssl = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.gym_name


# --------------------------------------------------------------------------
# Notifications
# --------------------------------------------------------------------------
class Notification(models.Model):
    TYPE_CHOICES = [
        ('MEMBER_REGISTRATION', 'Member Registration'),
        ('CONTACT_ENQUIRY', 'Contact Enquiry'),
        ('PAYMENT_PENDING', 'Payment Pending'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('MEMBERSHIP_EXPIRING', 'Membership Expiring'),
        ('APPOINTMENT', 'Appointment'),
        ('SYSTEM', 'System Alert'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='SYSTEM')
    link = models.CharField(max_length=255, default="/admin/dashboard")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{'READ' if self.is_read else 'UNREAD'}] {self.title}"


# --------------------------------------------------------------------------
# Audit Logging
# --------------------------------------------------------------------------
class AuditLog(models.Model):
    user = models.CharField(max_length=150, default="System")
    action = models.CharField(max_length=100, help_text="e.g. ADMIN_CREATED_MEMBER, ADMIN_DELETED_CLASS")
    entity = models.CharField(max_length=100, help_text="e.g. Member, Trainer, Class, Timetable, Plan")
    entity_id = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.CharField(max_length=60, default="127.0.0.1")
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.user} - {self.action} ({self.entity})"
