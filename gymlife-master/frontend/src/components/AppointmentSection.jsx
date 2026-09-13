import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const TIME_SLOTS = [
    { label: '06:00 AM - 07:30 AM', time: '06:00 AM', tag: 'Early Bird' },
    { label: '08:00 AM - 09:30 AM', time: '08:00 AM', tag: 'Morning Peak' },
    { label: '10:00 AM - 11:30 AM', time: '10:00 AM', tag: 'Mid-Morning' },
    { label: '05:00 PM - 06:30 PM', time: '05:00 PM', tag: 'Evening Rush' },
    { label: '07:00 PM - 08:30 PM', time: '07:00 PM', tag: 'Night Power' },
];

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const AppointmentSection = ({ defaultService = '' }) => {
    const { showSuccess, showError } = useToast();
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [servicesList, setServicesList] = useState([]);
    
    // Default to tomorrow's date
    const getTomorrowStr = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const getTodayStr = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [customTime, setCustomTime] = useState('18:00');
    const [useCustomTime, setUseCustomTime] = useState(false);
    
    // Calendar Popup State
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const calendarRef = useRef(null);
    const ticketRef = useRef(null);

    const [status, setStatus] = useState(null); // 'submitting' | 'success' | 'error'
    const [confirmationData, setConfirmationData] = useState(null);
    const [resendingEmail, setResendingEmail] = useState(false);
    const [resendingSMS, setResendingSMS] = useState(false);

    useEffect(() => {
        if (status === 'success' && ticketRef.current) {
            setTimeout(() => {
                const yOffset = -90;
                const y = ticketRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, 100);
        }
    }, [status]);

    const [formData, setFormData] = useState({
        name: user?.name || user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        service: defaultService || 'Personal Training Assessment',
        appointment_date: '',
        notes: ''
    });

    // Automatically sync logged-in athlete credentials when auth loads
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.name || user.username || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (defaultService) {
            setFormData(prev => ({ ...prev, service: defaultService }));
        }
    }, [defaultService]);

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        api.getServices()
            .then(data => {
                if (data && data.length > 0) {
                    setServicesList(data);
                    if (!defaultService) {
                        setFormData(prev => ({ ...prev, service: data[0].title }));
                    }
                }
            })
            .catch(() => {});
    }, [defaultService]);

    // Synchronize combined date & time string
    useEffect(() => {
        const timeDisplay = useCustomTime 
            ? formatTime24to12(customTime)
            : selectedTimeSlot;
        
        const combined = (selectedDate && (selectedTimeSlot || (useCustomTime && customTime)))
            ? `${selectedDate} at ${timeDisplay}`
            : '';
        setFormData(prev => ({ ...prev, appointment_date: combined }));
    }, [selectedDate, selectedTimeSlot, customTime, useCustomTime]);

    const formatTime24to12 = (time24) => {
        if (!time24) return '10:00 AM';
        const [h, m] = time24.split(':');
        let hours = parseInt(h, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = hours < 10 ? `0${hours}` : hours;
        return `${formattedHours}:${m} ${ampm}`;
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'Select Date';
        try {
            const date = new Date(dateStr + 'T00:00:00');
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Calendar Navigation Functions
    const prevMonth = (e) => {
        e.stopPropagation();
        setViewDate(prev => {
            if (prev.month === 0) {
                return { year: prev.year - 1, month: 11 };
            }
            return { year: prev.year, month: prev.month - 1 };
        });
    };

    const nextMonth = (e) => {
        e.stopPropagation();
        setViewDate(prev => {
            if (prev.month === 11) {
                return { year: prev.year + 1, month: 0 };
            }
            return { year: prev.year, month: prev.month + 1 };
        });
    };

    const handleSelectDay = (day) => {
        const monthStr = String(viewDate.month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const formatted = `${viewDate.year}-${monthStr}-${dayStr}`;
        setSelectedDate(formatted);
        setShowCalendar(false);
    };

    const selectQuickDate = (type) => {
        const d = new Date();
        if (type === 'tomorrow') d.setDate(d.getDate() + 1);
        if (type === 'next-week') d.setDate(d.getDate() + 7);
        
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${y}-${m}-${day}`);
        setViewDate({ year: y, month: d.getMonth() });
        setShowCalendar(false);
    };

    // Build days matrix for the active view month
    const renderCalendarDays = () => {
        const { year, month } = viewDate;
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cells = [];

        // Previous month filler days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            cells.push(
                <div key={`prev-${i}`} className="cal-day-cell disabled-other-month">
                    {totalDaysInPrevMonth - i}
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);
            const isPast = cellDate < today;
            
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateVal = `${year}-${monthStr}-${dayStr}`;
            const isSelected = selectedDate === dateVal;
            const isToday = cellDate.getTime() === today.getTime();

            cells.push(
                <div
                    key={`day-${day}`}
                    className={`cal-day-cell ${isPast ? 'disabled-past' : 'active-day'} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isPast) handleSelectDay(day);
                    }}
                >
                    <span className="day-number">{day}</span>
                    {isToday && <span className="today-dot"></span>}
                </div>
            );
        }

        return cells;
    };

    const handleResendEmail = async () => {
        if (!confirmationData?.reference_no) return;
        setResendingEmail(true);
        try {
            const res = await api.resendBookingEmail(confirmationData.reference_no, confirmationData.email);
            if (res && res.status === 'success') {
                showSuccess(`Confirmation email dispatched to ${confirmationData.email}! 📧`);
                setConfirmationData(prev => ({
                    ...prev,
                    email_sent: true,
                    email_note: 'Delivered via SMTP'
                }));
            } else {
                showError(res?.message || 'Could not resend email. Please verify email address.');
            }
        } catch (err) {
            showError('Network error while resending confirmation email.');
        } finally {
            setResendingEmail(false);
        }
    };

    const getProperSmsUri = (phone, text) => {
        const cleanPhone = (phone || '').replace(/[^\d+]/g, '');
        const encodedBody = encodeURIComponent(text || '');
        const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
        const separator = isIOS ? '&body=' : '?body=';
        return `sms:${cleanPhone}${separator}${encodedBody}`;
    };

    const handleResendSMS = async () => {
        if (!confirmationData?.reference_no) return;
        setResendingSMS(true);
        try {
            const res = await api.resendBookingSMS(confirmationData.reference_no, confirmationData.phone);
            if (res && res.status === 'success') {
                showSuccess(`SMS confirmation alert dispatched to ${confirmationData.phone}! 📱`);
                setConfirmationData(prev => ({
                    ...prev,
                    sms_sent: true,
                    sms_note: res.message || 'Delivered via Fast2SMS/Twilio',
                    sms_uri: res.sms_uri || prev.sms_uri,
                    whatsapp_url: res.whatsapp_url || prev.whatsapp_url
                }));
            } else {
                showError(res?.message || 'Carrier SMS service is busy. Tap "Send SMS Text" to send directly.');
            }
        } catch (err) {
            showError('Carrier dispatch unavailable. Tap "Send SMS Text" to send instantly from your device.');
        } finally {
            setResendingSMS(false);
        }
    };

    const handleSendDirectSMS = () => {
        if (!confirmationData?.phone) return;
        const uri = confirmationData.sms_uri || getProperSmsUri(confirmationData.phone, confirmationData.sms_text);
        window.location.href = uri;
        showSuccess(`Opening SMS text messenger for ${confirmationData.phone}... 💬`);
    };

    const handleCopyWhatsAppText = () => {
        if (!confirmationData) return;
        const msg = confirmationData.sms_text || `🏋️ GYMLIFE PASS #${confirmationData.reference_no}: Hi ${confirmationData.name}, your ${confirmationData.service} session is confirmed for ${confirmationData.appointment_date}. Location: GymLife Arena. Helpline: +1 125-711-811`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(msg);
        }
        showSuccess('Confirmation pass copied to clipboard! 📋');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanName = (formData.name || '').trim();
        const cleanEmail = (formData.email || '').trim();
        const cleanPhone = (formData.phone || '').trim();

        if (!cleanName) {
            showError('Please enter your full name.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!cleanEmail || !emailRegex.test(cleanEmail)) {
            showError('Please provide a valid email address so we can deliver your booking pass.');
            return;
        }

        if (!cleanPhone) {
            showError('Please enter your contact phone number.');
            return;
        }

        if (!selectedDate) {
            showError('Please select your preferred appointment date.');
            return;
        }
        if (!selectedTimeSlot && !useCustomTime) {
            showError('Please select your preferred time slot.');
            return;
        }
        setStatus('submitting');
        
        try {
            const payload = {
                name: cleanName,
                email: cleanEmail,
                phone: cleanPhone,
                service: formData.service || 'Personal Training Assessment',
                scheduled_time: formData.appointment_date,
                appointment_date: formData.appointment_date,
                notes: (formData.notes || '').trim()
            };

            const data = await api.createBooking(payload);
            if (data && data.status === 'success') {

                const ref = data.reference_no || `GYM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                const cleanDigits = cleanPhone.replace(/\D/g, '');
                const fullPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
                const defaultSmsText = `🏋️ GYMLIFE BOOKING CONFIRMED!\nRef: #${ref}\nAthlete: ${cleanName}\nSession: ${payload.service}\nDate: ${formData.appointment_date}\nArena: 333 Middle Winchendon Rd\nHelpline: +1 125-711-811`;
                
                const formattedSmsText = data.sms_text || defaultSmsText;
                const dynamicSmsUri = getProperSmsUri(cleanPhone, formattedSmsText);
                const dynamicWhatsAppUrl = data.whatsapp_url || `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(data.whatsapp_message || formattedSmsText)}`;

                const emailSent = Boolean(data.email_sent || data.notifications?.email?.status === 'SENT');

                setStatus('success');
                setConfirmationData({
                    reference_no: ref,
                    name: cleanName,
                    email: cleanEmail,
                    phone: cleanPhone,
                    phone_target: fullPhone,
                    service: payload.service,
                    appointment_date: formData.appointment_date,
                    notes: payload.notes,
                    email_sent: emailSent,
                    sms_sent: data.sms_sent !== false,
                    email_note: data.email_note || (emailSent ? 'Delivered via SMTP' : 'Email dispatched'),
                    sms_note: data.sms_note || 'SMS & WhatsApp ready',
                    whatsapp_url: dynamicWhatsAppUrl,
                    whatsapp_message: data.whatsapp_message || formattedSmsText,
                    sms_uri: dynamicSmsUri,
                    sms_text: formattedSmsText
                });
                
                // Prompt / Auto-trigger WhatsApp in background/new tab
                try {
                    window.open(dynamicWhatsAppUrl, '_blank', 'noopener,noreferrer');
                } catch (popupErr) {
                    console.warn('WhatsApp auto-open popup suppressed:', popupErr);
                }

                // Real System Push Notification on Mobile / Desktop
                if (typeof window !== 'undefined' && 'Notification' in window) {
                    if (Notification.permission === 'granted') {
                        try {
                            new Notification('🏋️ GymLife Booking Confirmed!', {
                                body: `Pass #${ref} for ${cleanName} on ${formData.appointment_date}. Arena: 333 Middle Winchendon Rd.`,
                                icon: '/img/logo.png',
                            });
                        } catch (err) {}
                    } else if (Notification.permission !== 'denied') {
                        Notification.requestPermission().then(perm => {
                            if (perm === 'granted') {
                                try {
                                    new Notification('🏋️ GymLife Booking Confirmed!', {
                                        body: `Pass #${ref} for ${cleanName} on ${formData.appointment_date}. Arena: 333 Middle Winchendon Rd.`,
                                        icon: '/img/logo.png',
                                    });
                                } catch (err) {}
                            }
                        });
                    }
                }

                showSuccess(`Session booked! Confirmation sent to WhatsApp (${cleanPhone}) & Email (${cleanEmail}) 🚀`);
            } else {
                setStatus('error');
                showError(data?.message || 'Failed to book appointment. Please check details and try again.');
            }
        } catch (error) {
            console.error('Booking submission error:', error);
            setStatus('error');
            showError(error?.message || 'Unable to connect to booking server. Please try again.');
        }
    };

    const handleReset = () => {
        setStatus(null);
        setConfirmationData(null);
        setSelectedDate('');
        setSelectedTimeSlot('');
        setUseCustomTime(false);
        setFormData({
            name: '',
            email: '',
            phone: '',
            service: servicesList.length > 0 ? servicesList[0].title : 'Personal Training Assessment',
            appointment_date: '',
            notes: ''
        });
    };

    const handleCopyPass = () => {
        if (!confirmationData) return;
        const passText = `🏋️ GYMLIFE TRAINING BOOKING PASS\n--------------------------------\nReference: #${confirmationData.reference_no}\nAthlete: ${confirmationData.name}\nService: ${confirmationData.service}\nDate & Time: ${confirmationData.appointment_date}\nLocation: GymLife Arena (333 Middle Winchendon Rd, Rindge NH)\nHelpline: +1 125-711-811 / support.gymcenter@gmail.com\n--------------------------------`;
        navigator.clipboard?.writeText(passText);
        showSuccess('Booking pass copied to clipboard! 📋');
    };

    const getGoogleCalendarUrl = () => {
        if (!confirmationData) return '#';
        const title = encodeURIComponent(`GymLife Training: ${confirmationData.service}`);
        const details = encodeURIComponent(`Booking Reference: #${confirmationData.reference_no}\nAthlete: ${confirmationData.name}\nService: ${confirmationData.service}\nNotes: ${confirmationData.notes || 'Gym Workout'}`);
        const location = encodeURIComponent('GymLife Fitness Arena, 333 Middle Winchendon Rd, Rindge, NH 03461');
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    };

    return (
        <section className="appointment-section spad" id="appointment-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-title text-center">
                            <span>{t('appointment_title', 'Appointment')}</span>
                            <h2>{t('appointment_sub', 'BOOK YOUR APPOINTMENT')}</h2>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="appointment-form-wrapper" style={{
                            background: 'rgba(21, 21, 24, 0.95)',
                            padding: '36px',
                            borderRadius: '16px',
                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(243, 97, 0, 0.15)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {status === 'success' && confirmationData ? (
                                /* Rich Booking Confirmation Ticket */
                                <div className="appointment-confirmation-ticket" ref={ticketRef}>
                                    <div className="ticket-header">
                                        <div className="ticket-badge-pill">
                                            <span className="badge-pulse"></span> {t('CONFIRMED & SCHEDULED', 'CONFIRMED & SCHEDULED')}
                                        </div>
                                        <span className="ticket-ref">REF #{confirmationData.reference_no}</span>
                                    </div>

                                    <div className="ticket-body">
                                        <h3 className="ticket-title">
                                            <i className="fa fa-check-circle text-success mr-2"></i> 
                                            {t('session_booked_success', 'Session Booked Successfully!')}
                                        </h3>
                                        <p className="ticket-subtitle">
                                            {t('thank_you_booking', 'Your training appointment has been recorded and dispatched in real time.')}
                                        </p>

                                        {/* Prominent WhatsApp Instant Mobile Delivery Card */}
                                        <div className="whatsapp-instant-banner">
                                            <div className="wa-banner-left">
                                                <div className="wa-banner-icon-box">
                                                    <i className="fa fa-whatsapp"></i>
                                                </div>
                                                <div className="wa-banner-info">
                                                    <strong>{t('Deliver Pass to Mobile WhatsApp', 'Deliver Pass to Mobile WhatsApp')}</strong>
                                                    <span>{t('send_to_whatsapp', 'Send to WhatsApp')} <strong>{confirmationData.phone}</strong></span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <a 
                                                    href={confirmationData.whatsapp_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="wa-banner-btn"
                                                    id="btn-open-whatsapp"
                                                    title={`Deliver workout pass to WhatsApp ${confirmationData.phone}`}
                                                >
                                                    <i className="fa fa-whatsapp"></i> {t('send_to_whatsapp', 'SEND TO WHATSAPP')}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyWhatsAppText}
                                                    style={{
                                                        background: 'rgba(255, 255, 255, 0.12)',
                                                        border: '1px solid rgba(37, 211, 102, 0.4)',
                                                        color: '#ffffff',
                                                        padding: '9px 14px',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '700',
                                                        fontSize: '12px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.2s ease',
                                                        textTransform: 'uppercase'
                                                    }}
                                                    title="Copy pre-formatted WhatsApp pass to clipboard"
                                                    id="btn-copy-wa-text"
                                                >
                                                    <i className="fa fa-copy"></i> Copy Text
                                                </button>
                                            </div>
                                        </div>

                                        {/* Real-Life Notifications Dispatched Cards */}
                                        <div className="notification-dispatches-grid">
                                            <div className="notif-dispatch-card email">
                                                <div className="notif-icon">
                                                    <i className="fa fa-envelope-o"></i>
                                                </div>
                                                <div className="notif-text">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                                        <strong>{t('email_alert_sent', 'Confirmation Email Sent')}</strong>
                                                        <button
                                                            type="button"
                                                            onClick={handleResendEmail}
                                                            disabled={resendingEmail}
                                                            style={{
                                                                background: 'rgba(243, 97, 0, 0.15)',
                                                                border: '1px solid rgba(243, 97, 0, 0.4)',
                                                                color: '#f36100',
                                                                fontSize: '11px',
                                                                fontWeight: '700',
                                                                borderRadius: '4px',
                                                                padding: '2px 8px',
                                                                cursor: resendingEmail ? 'not-allowed' : 'pointer',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: 'all 0.2s',
                                                                lineHeight: '1.2'
                                                            }}
                                                            title="Resend email confirmation to this address"
                                                            id="btn-resend-email"
                                                        >
                                                            <i className={`fa fa-repeat ${resendingEmail ? 'fa-spin' : ''}`}></i>
                                                            {resendingEmail ? 'Sending...' : 'Resend Email'}
                                                        </button>
                                                    </div>
                                                    <span>{confirmationData.email}</span>
                                                </div>
                                                <span className="notif-status-tag">{confirmationData.email_sent ? t('delivered_tag', 'Delivered ✓') : 'Dispatched ✓'}</span>
                                            </div>

                                            <div className="notif-dispatch-card sms">
                                                <div className="notif-icon">
                                                    <i className="fa fa-commenting-o"></i>
                                                </div>
                                                <div className="notif-text">
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                                        <strong>{t('sms_alert_sent', 'SMS Text Booking Alert')}</strong>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <button
                                                                type="button"
                                                                onClick={handleSendDirectSMS}
                                                                style={{
                                                                    background: 'rgba(34, 197, 94, 0.15)',
                                                                    border: '1px solid rgba(34, 197, 94, 0.4)',
                                                                    color: '#22c55e',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    borderRadius: '4px',
                                                                    padding: '2px 8px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    lineHeight: '1.2'
                                                                }}
                                                                title="Open native SMS messenger on your device"
                                                                id="btn-open-direct-sms"
                                                            >
                                                                <i className="fa fa-paper-plane-o"></i> Send SMS Text
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={handleResendSMS}
                                                                disabled={resendingSMS}
                                                                style={{
                                                                    background: 'rgba(243, 97, 0, 0.15)',
                                                                    border: '1px solid rgba(243, 97, 0, 0.4)',
                                                                    color: '#f36100',
                                                                    fontSize: '11px',
                                                                    fontWeight: '700',
                                                                    borderRadius: '4px',
                                                                    padding: '2px 8px',
                                                                    cursor: resendingSMS ? 'not-allowed' : 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    lineHeight: '1.2'
                                                                }}
                                                                title="Resend SMS carrier alert"
                                                                id="btn-resend-sms"
                                                            >
                                                                <i className={`fa fa-repeat ${resendingSMS ? 'fa-spin' : ''}`}></i>
                                                                {resendingSMS ? 'Sending...' : 'Resend SMS'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <span>{confirmationData.phone}</span>
                                                </div>
                                                <span className="notif-status-tag">{confirmationData.sms_sent ? t('delivered_tag', 'Delivered ✓') : 'Ready 📱'}</span>
                                            </div>
                                        </div>

                                        {/* Summary Details */}
                                        <div className="session-summary-box">
                                            <div className="summary-row">
                                                <span>Service / Category:</span>
                                                <strong>{confirmationData.service}</strong>
                                            </div>
                                            <div className="summary-row">
                                                <span>Scheduled Time:</span>
                                                <strong>{confirmationData.appointment_date || 'Upcoming Tomorrow at 10:00 AM'}</strong>
                                            </div>
                                            <div className="summary-row">
                                                <span>Location:</span>
                                                <strong>GymLife Arena (333 Middle Winchendon Rd)</strong>
                                            </div>
                                            {confirmationData.notes && (
                                                <div className="summary-row">
                                                    <span>Special Notes:</span>
                                                    <em>{confirmationData.notes}</em>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Direct Real-Life Client Messaging & Calendar Actions */}
                                    <div className="ticket-messaging-action-bar">
                                        <a 
                                            href={confirmationData.whatsapp_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="ticket-msg-btn btn-whatsapp"
                                            title={`Open WhatsApp chat with ${confirmationData.phone}`}
                                            id="action-send-whatsapp"
                                        >
                                            <i className="fa fa-whatsapp"></i> Send WhatsApp Pass
                                        </a>
                                        <button 
                                            type="button"
                                            onClick={handleSendDirectSMS}
                                            className="ticket-msg-btn btn-sms"
                                            title={`Open SMS app with text for ${confirmationData.phone}`}
                                            id="action-send-sms"
                                        >
                                            <i className="fa fa-commenting"></i> Send SMS Text
                                        </button>
                                        <button 
                                            type="button" 
                                            className="ticket-msg-btn btn-copy"
                                            onClick={handleCopyPass}
                                            title="Copy full booking pass to clipboard"
                                            id="action-copy-pass"
                                        >
                                            <i className="fa fa-clipboard"></i> Copy Pass
                                        </button>
                                    </div>

                                    <div className="ticket-actions">
                                        <a 
                                            href={getGoogleCalendarUrl()} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn-add-calendar"
                                        >
                                            <i className="fa fa-calendar-plus-o"></i> {t('Add to Google Calendar', 'Add to Google Calendar')}
                                        </a>
                                        <button className="btn-book-another" onClick={handleReset}>
                                            <i className="fa fa-refresh"></i> {t('book_another', 'Book Another Session')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Booking Form */
                                <form onSubmit={handleSubmit} className="appointment-form">
                                    <div className="row">
                                        <div className="col-md-6 mb-4">
                                            <label className="field-label">{t('full_name_label', 'Full Name *')}</label>
                                            <input 
                                                type="text" 
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder={t('name_placeholder', 'e.g. Jordan Lee')} 
                                                required 
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label className="field-label">{t('email_label_apt', 'Email Address (for Confirmation) *')}</label>
                                            <input 
                                                type="email" 
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder={t('email_placeholder', 'name@example.com')} 
                                                required 
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label className="field-label">{t('phone_label_apt', 'Phone Number (for SMS Alert) *')}</label>
                                            <input 
                                                type="tel" 
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder={t('phone_placeholder', '+91 98765 43210')} 
                                                required 
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-4">
                                            <label className="field-label">{t('service_label', 'Service / Training Program *')}</label>
                                            <select 
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                style={inputStyle}
                                            >
                                                {servicesList.length > 0 ? (
                                                    servicesList.map(s => (
                                                        <option key={s.id} value={s.title}>{t(s.title, s.title)}</option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="Personal Training Assessment">{t('Personal Training Assessment', 'Personal Training Assessment')}</option>
                                                        <option value="Cardio & Weight Loss Circuit">{t('Cardio & Weight Loss Circuit', 'Cardio & Weight Loss Circuit')}</option>
                                                        <option value="Power Yoga & Core Flow">{t('Power Yoga & Core Flow', 'Power Yoga & Core Flow')}</option>
                                                        <option value="Bodybuilding & Hypertrophy">{t('Bodybuilding & Hypertrophy', 'Bodybuilding & Hypertrophy')}</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        {/* ==============================================================
                                            PROFESSIONAL CLICK-TO-OPEN CALENDAR & DATE PICKER
                                            ============================================================== */}
                                        <div className="col-md-6 mb-4" ref={calendarRef} style={{ position: 'relative' }}>
                                            <label className="field-label">
                                                <i className="fa fa-calendar" style={{ color: '#f36100', marginRight: '6px' }}></i>
                                                {t('preferred_date_label', 'Preferred Date *')}
                                            </label>
                                            
                                            {/* Clickable Date Display Card */}
                                            <div 
                                                className={`gymlife-custom-date-box ${showCalendar ? 'active-open' : ''}`}
                                                onClick={() => setShowCalendar(!showCalendar)}
                                                tabIndex={0}
                                                role="button"
                                                aria-haspopup="dialog"
                                                aria-expanded={showCalendar}
                                            >
                                                <div className="date-box-left">
                                                    <i className="fa fa-calendar-o date-left-icon"></i>
                                                    <span 
                                                        className="date-selected-text"
                                                        style={{ color: selectedDate ? '#ffffff' : '#8e8e93', fontWeight: selectedDate ? '600' : '400' }}
                                                    >
                                                        {selectedDate ? formatDateDisplay(selectedDate) : t('select_date_prompt', 'Select Date')}
                                                    </span>
                                                </div>
                                                <div className="date-box-right">
                                                    <span className="cal-toggle-badge">
                                                        <i className={`fa fa-chevron-${showCalendar ? 'up' : 'down'}`}></i>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Luxury Interactive Calendar Dropdown Modal */}
                                            {showCalendar && (
                                                <div className="gymlife-calendar-dropdown-card">
                                                    {/* Calendar Header */}
                                                    <div className="cal-dropdown-header">
                                                        <button 
                                                            type="button" 
                                                            className="cal-nav-btn" 
                                                            onClick={prevMonth}
                                                            title="Previous Month"
                                                        >
                                                            <i className="fa fa-chevron-left"></i>
                                                        </button>
                                                        <div className="cal-month-year-title">
                                                            <span>{MONTHS[viewDate.month]}</span>
                                                            <span className="cal-year-text">{viewDate.year}</span>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            className="cal-nav-btn" 
                                                            onClick={nextMonth}
                                                            title="Next Month"
                                                        >
                                                            <i className="fa fa-chevron-right"></i>
                                                        </button>
                                                    </div>

                                                    {/* Day of Week Headers */}
                                                    <div className="cal-days-grid-header">
                                                        {DAYS_SHORT.map(d => (
                                                            <span key={d} className="cal-day-name">{d}</span>
                                                        ))}
                                                    </div>

                                                    {/* Days Grid */}
                                                    <div className="cal-days-grid">
                                                        {renderCalendarDays()}
                                                    </div>

                                                    {/* Quick Select Buttons Footer */}
                                                    <div className="cal-dropdown-footer">
                                                        <div className="cal-quick-buttons">
                                                            <button 
                                                                type="button" 
                                                                className={`cal-quick-btn ${selectedDate === getTodayStr() ? 'active-quick' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); selectQuickDate('today'); }}
                                                            >
                                                                {t('Today', 'Today')}
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className={`cal-quick-btn ${selectedDate === getTomorrowStr() ? 'active-quick' : ''}`}
                                                                onClick={(e) => { e.stopPropagation(); selectQuickDate('tomorrow'); }}
                                                            >
                                                                {t('Tomorrow', 'Tomorrow')}
                                                            </button>
                                                            <button 
                                                                type="button" 
                                                                className="cal-quick-btn"
                                                                onClick={(e) => { e.stopPropagation(); selectQuickDate('next-week'); }}
                                                            >
                                                                {t('Next Week', 'Next Week')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ==============================================================
                                            PREFERRED TIME SLOT SELECTION
                                            ============================================================== */}
                                        <div className="col-md-6 mb-4">
                                            <label className="field-label">
                                                <i className="fa fa-clock-o" style={{ color: '#f36100', marginRight: '6px' }}></i>
                                                {t('preferred_time_label', 'Preferred Time Slot *')}
                                            </label>
                                            <div className="gymlife-time-picker-row">
                                                {!useCustomTime ? (
                                                    <select
                                                        value={selectedTimeSlot}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'CUSTOM') {
                                                                setUseCustomTime(true);
                                                            } else {
                                                                setSelectedTimeSlot(e.target.value);
                                                            }
                                                        }}
                                                        style={{
                                                            ...inputStyle,
                                                            color: selectedTimeSlot ? '#ffffff' : '#8e8e93'
                                                        }}
                                                        required
                                                    >
                                                        <option value="" disabled style={{ color: '#8e8e93', background: '#0d0d10' }}>
                                                            {t('Select Time Slot', 'Select Time Slot')}
                                                        </option>
                                                        {TIME_SLOTS.map((slot) => (
                                                            <option key={slot.time} value={slot.time} style={{ color: '#ffffff', background: '#151518' }}>
                                                                {slot.label} ({t(slot.tag, slot.tag)})
                                                            </option>
                                                        ))}
                                                        <option value="CUSTOM" style={{ color: '#ffffff', background: '#151518' }}>-- {t('Specify Custom Time...', 'Specify Custom Time...')} --</option>
                                                    </select>
                                                ) : (
                                                    <div 
                                                        style={{ display: 'flex', gap: '8px', width: '100%' }}
                                                    >
                                                        <input 
                                                            type="time" 
                                                            value={customTime}
                                                            onChange={(e) => setCustomTime(e.target.value)}
                                                            className="gymlife-date-input"
                                                            style={{ flex: 1, ...inputStyle }}
                                                            required
                                                        />
                                                        <button 
                                                            type="button" 
                                                            className="custom-time-switch-btn"
                                                            onClick={() => setUseCustomTime(false)}
                                                            title="Switch back to standard slots"
                                                        >
                                                            <i className="fa fa-list"></i> {t('Slots', 'Slots')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Slot Preset Pills */}
                                        <div className="col-md-12 mb-4" style={{ marginTop: '-8px' }}>
                                            <div className="appointment-slot-pills-bar">
                                                <span className="slot-pills-label">{t('Quick Slots:', 'Quick Slots:')}</span>
                                                {TIME_SLOTS.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        className={`slot-preset-pill ${!useCustomTime && selectedTimeSlot === slot.time ? 'active' : ''}`}
                                                        onClick={() => {
                                                            setUseCustomTime(false);
                                                            setSelectedTimeSlot(slot.time);
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    className={`slot-preset-pill custom ${useCustomTime ? 'active' : ''}`}
                                                    onClick={() => setUseCustomTime(true)}
                                                >
                                                    <i className="fa fa-clock-o"></i> {t('Custom Time', 'Custom Time')}
                                                </button>
                                            </div>

                                            {/* Chosen Appointment Live Badge */}
                                            {selectedDate && (selectedTimeSlot || (useCustomTime && customTime)) && (
                                                <div className="chosen-slot-summary-chip">
                                                    <i className="fa fa-check-circle" style={{ color: '#22c55e', fontSize: '16px' }}></i>
                                                    <span>{t('Selected Session:', 'Selected Session:')}</span>
                                                    <strong>
                                                        {formatDateDisplay(selectedDate)} • {useCustomTime ? formatTime24to12(customTime) : selectedTimeSlot}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-12 mb-4">
                                            <label className="field-label">{t('notes_label_apt', 'Workout Goals or Notes (Optional)')}</label>
                                            <textarea 
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                placeholder={t('notes_placeholder', 'Share your goals, previous injuries, or preferred coach...')}
                                                style={{...inputStyle, height: '100px', resize: 'none', paddingTop: '12px'}}
                                            ></textarea>
                                        </div>

                                        <div className="col-md-12 text-center">
                                            <button 
                                                type="submit" 
                                                className="appointment-submit-btn"
                                                disabled={status === 'submitting'}
                                            >
                                                {status === 'submitting' ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin"></i> {t('booking_submitting', 'Confirming & Dispatching Alerts...')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-calendar-check-o"></i> {t('book_appointment_now', 'Book Session & Send Confirmation')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const inputStyle = {
    width: '100%',
    height: '48px',
    background: '#0d0d10',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '0 16px',
    color: '#ffffff',
    borderRadius: '6px',
    outline: 'none',
    fontSize: '14px',
    transition: 'all 0.2s',
    colorScheme: 'dark'
};

export default AppointmentSection;
