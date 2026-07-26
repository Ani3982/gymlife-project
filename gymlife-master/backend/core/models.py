from django.db import models

class Appointment(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    service = models.CharField(max_length=100)
    appointment_date = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.service} on {self.appointment_date}"

class Service(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.CharField(max_length=100, help_text="e.g., flaticon-034-stationary-bike")
    link = models.CharField(max_length=255, default="#", blank=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.title

class Trainer(models.Model):
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    image = models.ImageField(upload_to='trainers/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/team/team-1.jpg")
    facebook_url = models.URLField(max_length=500, blank=True, null=True)
    twitter_url = models.URLField(max_length=500, blank=True, null=True)
    instagram_url = models.URLField(max_length=500, blank=True, null=True)
    youtube_url = models.URLField(max_length=500, blank=True, null=True)
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/team/team-1.jpg'

class ClassItem(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, help_text="e.g., strength, cardio, group")
    trainer = models.ForeignKey(Trainer, on_delete=models.SET_NULL, null=True, blank=True)
    duration = models.CharField(max_length=100, help_text="e.g., 60 mins")
    image = models.ImageField(upload_to='classes/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/classes/class-1.jpg")
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/classes/class-1.jpg'

class GalleryItem(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='gallery/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/gallery/gallery-1.jpg")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Gallery Item {self.id}"

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/gallery/gallery-1.jpg'

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.CharField(max_length=255, default="Admin")
    category = models.CharField(max_length=100, default="Fitness")
    image = models.ImageField(upload_to='blog/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text="Fallback static URL if no image uploaded, e.g., /img/blog/blog-1.jpg")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url or '/img/blog/blog-1.jpg'

class PricingPlan(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    period = models.CharField(max_length=100, help_text="e.g., Month to Month, Single Class, Year Unlimited")
    features = models.TextField(help_text="Comma-separated features, e.g., Free riding, Unlimited equipments, Personal trainer")
    order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def get_features_list(self):
        return [f.strip() for f in self.features.split(',') if f.strip()]

class ContactInfo(models.Model):
    address = models.CharField(max_length=500)
    phone_numbers = models.CharField(max_length=255, help_text="Comma-separated numbers, e.g., 125-711-811, 125-668-886")
    email = models.EmailField()
    google_map_iframe_url = models.TextField(blank=True, null=True, help_text="Embed link for the map")

    def __str__(self):
        return f"Contact Info - {self.email}"

    def get_phone_list(self):
        return [p.strip() for p in self.phone_numbers.split(',') if p.strip()]

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    website = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} ({self.email})"
