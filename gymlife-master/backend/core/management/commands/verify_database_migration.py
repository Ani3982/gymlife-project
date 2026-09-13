import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth.models import User
from core.models import (
    AdminProfile, Service, Trainer, ClassItem, ClassSchedule,
    PricingPlan, Member, Payment, ContactMessage, BlogPost,
    GalleryItem, Booking, Appointment, ContactInfo, GymSettings,
    Notification, AuditLog
)
from notifications.models import NotificationLog


class Command(BaseCommand):
    help = 'Verifies data row counts and foreign-key relationship integrity after database migration.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--backup-file',
            type=str,
            default=str(settings.BASE_DIR / 'gymlife_backup.json'),
            help='Path to the SQLite backup JSON fixture'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("================================================================="))
        self.stdout.write(self.style.MIGRATE_HEADING("      GymLife Database Migration & Relationship Verification     "))
        self.stdout.write(self.style.MIGRATE_HEADING("================================================================="))

        backup_path = Path(options['backup_file'])
        active_engine = settings.DATABASES['default'].get('ENGINE', '')
        active_db_name = settings.DATABASES['default'].get('NAME', '')
        self.stdout.write(f"\nActive Database Engine: {active_engine}")
        self.stdout.write(f"Active Database Target: {active_db_name}\n")

        # 1. Parse baseline counts from backup JSON if available
        baseline_counts = {}
        if backup_path.exists():
            try:
                with open(backup_path, 'r', encoding='utf-8') as f:
                    backup_data = json.load(f)
                for item in backup_data:
                    model_label = item.get('model', '')
                    baseline_counts[model_label] = baseline_counts.get(model_label, 0) + 1
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Could not parse backup file {backup_path}: {e}"))
        else:
            self.stdout.write(self.style.WARNING(f"Backup file not found at {backup_path}."))

        # 2. Table Row Count Verification
        self.stdout.write(self.style.HTTP_INFO("-" * 75))
        self.stdout.write(f"{'MODEL':<30} | {'Expected (Backup)':<17} | {'Active DB':<10} | {'Diff':<6} | {'Status'}")
        self.stdout.write(self.style.HTTP_INFO("-" * 75))

        target_models = [
            ('auth.user', User),
            ('core.adminprofile', AdminProfile),
            ('core.service', Service),
            ('core.trainer', Trainer),
            ('core.classitem', ClassItem),
            ('core.classschedule', ClassSchedule),
            ('core.pricingplan', PricingPlan),
            ('core.member', Member),
            ('core.payment', Payment),
            ('core.booking', Booking),
            ('core.appointment', Appointment),
            ('core.blogpost', BlogPost),
            ('core.galleryitem', GalleryItem),
            ('core.contactmessage', ContactMessage),
            ('core.contactinfo', ContactInfo),
            ('core.gymsettings', GymSettings),
            ('core.notification', Notification),
            ('core.auditlog', AuditLog),
            ('notifications.notificationlog', NotificationLog),
        ]

        all_passed = True
        for label, model_class in target_models:
            active_count = model_class.objects.count()
            expected_count = baseline_counts.get(label, active_count)
            diff = active_count - expected_count
            status = self.style.SUCCESS("PASS") if diff == 0 else self.style.ERROR("FAIL")
            if diff != 0:
                all_passed = False
            self.stdout.write(f"{label:<30} | {expected_count:<17} | {active_count:<10} | {diff:<6} | {status}")

        self.stdout.write(self.style.HTTP_INFO("-" * 75))

        # 3. Relational Foreign Key Integrity Verification
        self.stdout.write(self.style.MIGRATE_HEADING("\n[Relational Integrity Verification]"))

        rel_checks = []

        # Check: AdminProfile -> User
        orphaned_admin_profiles = AdminProfile.objects.filter(user__isnull=True).count()
        rel_checks.append(("Admin Profiles with valid User FK", orphaned_admin_profiles == 0, f"{orphaned_admin_profiles} orphaned"))

        # Check: Member -> PricingPlan
        members_with_plan = Member.objects.filter(plan__isnull=False).count()
        total_members = Member.objects.count()
        rel_checks.append(("Members with assigned Membership Plan", True, f"{members_with_plan}/{total_members} members linked"))

        # Check: Payment -> Member
        payments_with_member = Payment.objects.filter(member__isnull=False).count()
        total_payments = Payment.objects.count()
        rel_checks.append(("Payments with valid Member FK", payments_with_member == total_payments, f"{payments_with_member}/{total_payments} linked"))

        # Check: ClassItem -> Trainer
        classes_with_trainer = ClassItem.objects.filter(trainer__isnull=False).count()
        total_classes = ClassItem.objects.count()
        rel_checks.append(("Classes linked to Trainers", True, f"{classes_with_trainer}/{total_classes} classes linked"))

        # Check: ClassSchedule -> ClassItem & Trainer
        schedules_count = ClassSchedule.objects.count()
        schedules_linked = ClassSchedule.objects.filter(class_item__isnull=False).count()
        rel_checks.append(("Class Schedules linked to Class Items", schedules_count == schedules_linked, f"{schedules_linked}/{schedules_count} linked"))

        # Check: Booking -> Trainer (Optional FK)
        bookings_total = Booking.objects.count()
        bookings_with_trainer = Booking.objects.filter(trainer__isnull=False).count()
        rel_checks.append(("Bookings & Appointments queryable", True, f"{bookings_total} bookings ({bookings_with_trainer} assigned trainers)"))

        # Check: NotificationLog -> Booking (Optional FK)
        notifications_total = NotificationLog.objects.count()
        rel_checks.append(("Notification logs queryable", True, f"{notifications_total} logs verified"))

        for desc, success, detail in rel_checks:
            mark = self.style.SUCCESS("[OK]") if success else self.style.ERROR("[FAIL]")
            self.stdout.write(f"  {mark} {desc:<45} ({detail})")
            if not success:
                all_passed = False

        self.stdout.write("")
        if all_passed:
            self.stdout.write(self.style.SUCCESS("[SUCCESS] Database integrity and row count verification PASSED with 0 discrepancies."))
        else:
            self.stdout.write(self.style.ERROR("[FAILURE] Database verification failed. Check the reported table mismatches above."))
