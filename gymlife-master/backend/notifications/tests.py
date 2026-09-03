import json
from unittest.mock import patch, MagicMock
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta

from core.models import Booking, Trainer
from notifications.models import NotificationLog
from notifications.services import EmailService, SMSService, WhatsAppService, NotificationService


class NotificationSystemTests(TestCase):
    """
    Comprehensive Test Suite for GymLife Notification System.
    Validates EmailService, SMSService, WhatsAppService, NotificationService,
    Duplicate Protection, Error Isolation, Resend endpoints, and Admin permissions.
    External providers are mocked to prevent live network API consumption.
    """

    def setUp(self):
        self.client = Client()

        # Create Admin User
        self.admin_user = User.objects.create_user(
            username='admin_tester',
            password='testpassword123',
            email='admin@gymlife.com',
            is_staff=True
        )

        # Create Regular (Non-Staff) User
        self.regular_user = User.objects.create_user(
            username='regular_member',
            password='userpassword123',
            email='member@gymlife.com',
            is_staff=False
        )

        # Create Trainer
        self.trainer = Trainer.objects.create(
            name='Marcus Vance',
            email='marcus@gymlife.com',
            phone='9876543210',
            role='Elite Strength Coach',
            status='ACTIVE'
        )

        # Create Sample Booking
        self.scheduled_dt = timezone.now() + timedelta(days=2)
        self.booking = Booking.objects.create(
            name='John Athlete',
            email='john.athlete@example.com',
            phone='9876543210',
            service='Modern Equipment',
            trainer=self.trainer,
            scheduled_time=self.scheduled_dt,
            location='GymLife Arena (333 Middle Winchendon Rd)',
            notes='Focus on deadlifts',
            status='CONFIRMED'
        )

    # --------------------------------------------------------------------------
    # 1. Email Service Tests
    # --------------------------------------------------------------------------
    @patch('django.core.mail.EmailMultiAlternatives.send')
    def test_email_service_success(self, mock_send):
        mock_send.return_value = 1
        res = EmailService.send_booking_confirmation(self.booking)
        self.assertTrue(res['success'])
        self.assertIsNone(res['error'])
        mock_send.assert_called_once()

    def test_email_service_invalid_email(self):
        invalid_booking = Booking.objects.create(
            name='Bad Email User',
            email='not-an-email',
            phone='9876543210',
            service='Yoga',
            scheduled_time=self.scheduled_dt
        )
        res = EmailService.send_booking_confirmation(invalid_booking)
        self.assertFalse(res['success'])
        self.assertIn('Invalid recipient email', res['error'])

    @patch('django.core.mail.EmailMultiAlternatives.send')
    def test_email_service_provider_failure(self, mock_send):
        mock_send.side_effect = Exception("SMTP Connection Refused (Port 587)")
        res = EmailService.send_booking_confirmation(self.booking)
        self.assertFalse(res['success'])
        self.assertIn("SMTP Connection Refused", res['error'])

    # --------------------------------------------------------------------------
    # 2. SMS Service Tests
    # --------------------------------------------------------------------------
    @patch('requests.post')
    def test_sms_service_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'return': True, 'request_id': 'fast2sms-9876543210'}
        mock_post.return_value = mock_response

        with patch('notifications.services.sms_service.config', return_value='test-fast2sms-key'):
            res = SMSService.send_booking_confirmation(self.booking)
            self.assertTrue(res['success'])
            self.assertEqual(res['provider_status'], 'DELIVERED')


    def test_sms_service_invalid_phone(self):
        invalid_booking = Booking.objects.create(
            name='Bad Phone User',
            email='valid@example.com',
            phone='123',  # Too short
            service='Yoga',
            scheduled_time=self.scheduled_dt
        )
        res = SMSService.send_booking_confirmation(invalid_booking)
        self.assertFalse(res['success'])
        self.assertEqual(res['provider_status'], 'INVALID_NUMBER')

    def test_sms_phone_normalization_indian_numbers(self):
        is_valid, local_10, intl = SMSService.normalize_phone('+91 98765-43210')
        self.assertTrue(is_valid)
        self.assertEqual(local_10, '9876543210')
        self.assertEqual(intl, '919876543210')

        is_valid, local_10, intl = SMSService.normalize_phone('09876543210')
        self.assertTrue(is_valid)
        self.assertEqual(local_10, '9876543210')

    # --------------------------------------------------------------------------
    # 3. WhatsApp Service Tests
    # --------------------------------------------------------------------------
    def test_whatsapp_link_generation(self):
        link = WhatsAppService.generate_booking_link(self.booking, event_type='CONFIRMATION')
        self.assertTrue(link.startswith('https://api.whatsapp.com/send?phone='))
        self.assertIn(self.booking.ref_id, link)
        self.assertIn('919876543210', link)

    # --------------------------------------------------------------------------
    # 4. Notification Service Coordination & Duplicate Protection
    # --------------------------------------------------------------------------
    @patch('notifications.services.EmailService.send_booking_confirmation')
    @patch('notifications.services.SMSService.send_booking_confirmation')
    def test_notification_service_confirmation_flow(self, mock_sms, mock_email):
        mock_email.return_value = {'success': True, 'message_id': 'msg-123', 'error': None}
        mock_sms.return_value = {'success': True, 'provider_status': 'DELIVERED', 'error': None, 'response_data': {}}

        results = NotificationService.send_booking_confirmation(self.booking)

        self.assertEqual(results['email']['status'], 'SENT')
        self.assertEqual(results['sms']['status'], 'SENT')
        self.assertIsNotNone(results['whatsapp_url'])

        # Verify NotificationLog records were created
        email_log = NotificationLog.objects.get(appointment=self.booking, channel='EMAIL')
        self.assertEqual(email_log.status, 'SENT')
        self.assertEqual(email_log.notification_type, 'BOOKING_CONFIRMATION')

        sms_log = NotificationLog.objects.get(appointment=self.booking, channel='SMS')
        self.assertEqual(sms_log.status, 'SENT')

        # Test DUPLICATE PROTECTION: Calling again without force_resend must return ALREADY_SENT
        dup_results = NotificationService.send_booking_confirmation(self.booking, force_resend=False)
        self.assertEqual(dup_results['email']['status'], 'ALREADY_SENT')
        self.assertEqual(dup_results['sms']['status'], 'ALREADY_SENT')

    # --------------------------------------------------------------------------
    # 5. Cancellation & Rescheduling Workflows
    # --------------------------------------------------------------------------
    @patch('notifications.services.EmailService.send_booking_cancellation')
    @patch('notifications.services.SMSService.send_booking_cancellation')
    def test_cancellation_notification_flow(self, mock_sms, mock_email):
        mock_email.return_value = {'success': True, 'message_id': 'cancel-1', 'error': None}
        mock_sms.return_value = {'success': True, 'provider_status': 'DELIVERED', 'error': None, 'response_data': {}}

        results = NotificationService.send_booking_cancellation(self.booking, reason='Coach illness')
        self.assertEqual(results['email']['status'], 'SENT')
        self.assertEqual(results['sms']['status'], 'SENT')

        cancel_log = NotificationLog.objects.get(appointment=self.booking, notification_type='BOOKING_CANCELLATION', channel='EMAIL')
        self.assertEqual(cancel_log.status, 'SENT')

    @patch('notifications.services.EmailService.send_booking_rescheduled')
    @patch('notifications.services.SMSService.send_booking_rescheduled')
    def test_reschedule_notification_flow(self, mock_sms, mock_email):
        mock_email.return_value = {'success': True, 'message_id': 'resched-1', 'error': None}
        mock_sms.return_value = {'success': True, 'provider_status': 'DELIVERED', 'error': None, 'response_data': {}}

        old_time = timezone.now()
        results = NotificationService.send_booking_rescheduled(self.booking, old_time=old_time)
        self.assertEqual(results['email']['status'], 'SENT')
        self.assertEqual(results['sms']['status'], 'SENT')

    # --------------------------------------------------------------------------
    # 6. Provider Failure Isolation (Booking Record Preserved on Error)
    # --------------------------------------------------------------------------
    @patch('notifications.services.EmailService.send_booking_confirmation')
    @patch('notifications.services.SMSService.send_booking_confirmation')
    def test_provider_failure_does_not_rollback_booking(self, mock_sms, mock_email):
        mock_email.return_value = {'success': False, 'error': 'Brevo SMTP authentication failure'}
        mock_sms.return_value = {'success': True, 'provider_status': 'DELIVERED', 'error': None, 'response_data': {}}

        # Create a new booking
        new_booking = Booking.objects.create(
            name='Fail Test User',
            email='fail.user@example.com',
            phone='9876543210',
            service='Cardio',
            scheduled_time=self.scheduled_dt
        )

        results = NotificationService.send_booking_confirmation(new_booking)

        # Email failed but SMS succeeded
        self.assertEqual(results['email']['status'], 'FAILED')
        self.assertEqual(results['sms']['status'], 'SENT')

        # Verify the booking still safely exists in database
        self.assertTrue(Booking.objects.filter(id=new_booking.id).exists())

        # Verify failed log record
        email_log = NotificationLog.objects.get(appointment=new_booking, channel='EMAIL')
        self.assertEqual(email_log.status, 'FAILED')
        self.assertIn('Brevo SMTP', email_log.error_message)

    # --------------------------------------------------------------------------
    # 7. Resend Functionality & Retry Count
    # --------------------------------------------------------------------------
    @patch('notifications.services.EmailService.send_booking_confirmation')
    def test_resend_notification(self, mock_email):
        mock_email.return_value = {'success': True, 'message_id': 'retry-msg', 'error': None}

        # Create a failed log
        log = NotificationLog.objects.create(
            appointment=self.booking,
            customer_name=self.booking.name,
            customer_email=self.booking.email,
            customer_phone=self.booking.phone,
            notification_type='BOOKING_CONFIRMATION',
            channel='EMAIL',
            recipient=self.booking.email,
            status='FAILED',
            error_message='Initial SMTP timeout',
            retry_count=0
        )

        res = NotificationService.resend_notification(log.id, admin_username='tester')
        self.assertTrue(res['success'])

        log.refresh_from_db()
        self.assertEqual(log.status, 'SENT')
        self.assertEqual(log.retry_count, 1)

    # --------------------------------------------------------------------------
    # 8. API Endpoints & Admin Permission Security
    # --------------------------------------------------------------------------
    def test_unauthorized_notification_endpoints(self):
        # Anonymous request
        response = self.client.get('/api/admin/notifications/')
        self.assertEqual(response.status_code, 401)

        # Diagnostic test endpoint without auth
        response = self.client.post(
            '/api/admin/notifications/diagnostic/',
            data=json.dumps({'test_type': 'EMAIL', 'target': 'test@example.com'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
