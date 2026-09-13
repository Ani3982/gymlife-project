export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : ''
);

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('gymlife_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `HTTP Error ${response.status}`);
  }
  return response.json();
};

const DEFAULT_PRICING_PLANS = [
  {
    id: 1,
    name: 'Class Drop-in Pass',
    price: '499.00',
    period: 'SINGLE PASS',
    features: [
      'Full gym floor access',
      'Locker & steam room',
      '1 group class included',
      'Personal trainer intro',
      'Free hydration station',
      'Free Wi-Fi access'
    ]
  },
  {
    id: 2,
    name: '12 Month VIP Membership',
    price: '14999.00',
    period: '12 MONTHS UNLIMITED',
    features: [
      '24/7 Unlimited club access',
      'InBody composition scan',
      'Dedicated personal trainer',
      'Unlimited group & spin classes',
      '2 Monthly guest passes',
      'Sauna & recovery lounge'
    ]
  },
  {
    id: 3,
    name: '6 Month Active Membership',
    price: '8999.00',
    period: '6 MONTHS ACCESS',
    features: [
      'Unlimited club access',
      'Certified fitness assessment',
      'Nutrition strategy plan',
      'Group HIIT & yoga classes',
      'Locker & shower amenities',
      'Free guest pass every month'
    ]
  }
];

const DEFAULT_GALLERY = [
  { id: 1, title: 'Gallery 1', image_url: '/img/gallery/gallery-1.jpg' },
  { id: 2, title: 'Gallery 2', image_url: '/img/gallery/gallery-2.jpg' },
  { id: 3, title: 'Gallery 3', image_url: '/img/gallery/gallery-3.jpg' },
  { id: 4, title: 'Gallery 4', image_url: '/img/gallery/gallery-4.jpg' },
  { id: 5, title: 'Gallery 5', image_url: '/img/gallery/gallery-5.jpg' },
  { id: 6, title: 'Gallery 6', image_url: '/img/gallery/gallery-6.jpg' },
  { id: 7, title: 'Gallery 7', image_url: '/img/gallery/gallery-7.jpg' },
  { id: 8, title: 'Gallery 8', image_url: '/img/gallery/gallery-8.jpg' },
  { id: 9, title: 'Gallery 9', image_url: '/img/gallery/gallery-9.jpg' },
];

const DEFAULT_CLASSES = [
  { id: 1, name: 'Weightlifting', category: 'STRENGTH', duration: '60 mins', image_url: '/img/classes/class-1.jpg', trainer_name: 'John Smith' },
  { id: 2, name: 'Indoor cycling', category: 'CARDIO', duration: '45 mins', image_url: '/img/classes/class-2.jpg', trainer_name: 'Mike Davis' },
  { id: 3, name: 'Kettlebell power', category: 'STRENGTH', duration: '50 mins', image_url: '/img/classes/class-3.jpg', trainer_name: 'Emma Wilson' },
  { id: 4, name: 'Boxing', category: 'TRAINING', duration: '60 mins', image_url: '/img/classes/class-4.jpg', trainer_name: 'Sarah Johnson' },
  { id: 5, name: 'Body building', category: 'BODY BUILDING', duration: '60 mins', image_url: '/img/classes/class-5.jpg', trainer_name: 'Emma Wilson' },
];

const DEFAULT_TRAINERS = [
  { id: 1, name: 'John Smith', role: 'Head Strength Coach', image_url: '/img/team/team-1.jpg', experience_years: 8 },
  { id: 2, name: 'Sarah Johnson', role: 'Yoga & Mobility Coach', image_url: '/img/team/team-2.jpg', experience_years: 6 },
  { id: 3, name: 'Mike Davis', role: 'Cardio & HIIT Coach', image_url: '/img/team/team-3.jpg', experience_years: 5 },
  { id: 4, name: 'Emma Wilson', role: 'CrossFit & Boxing Coach', image_url: '/img/team/team-4.jpg', experience_years: 7 },
];

const DEFAULT_SERVICES = [
  { id: 1, title: 'Modern equipment', description: 'State-of-the-art fitness equipment to enhance your workout experience.', icon: 'flaticon-034-stationary-bike' },
  { id: 2, title: 'Healthy nutrition plan', description: 'Personalized nutrition plans tailored to your fitness goals.', icon: 'flaticon-033-juice' },
  { id: 3, title: 'Professional training plan', description: 'Expert trainers to guide you through your fitness journey.', icon: 'flaticon-002-dumbell' },
  { id: 4, title: 'Unique to your needs', description: 'Customized fitness programs based on your individual requirements.', icon: 'flaticon-014-heart-beat' },
];

const parsePlanFeatures = (plan) => {
  let features = plan.features;
  if (typeof features === 'string') {
    if (features.includes('|')) {
      features = features.split('|').map(f => f.trim()).filter(Boolean);
    } else {
      features = features.split(',').map(f => f.trim()).filter(Boolean);
    }
  }
  return { ...plan, features: Array.isArray(features) ? features : [] };
};

export const api = {
  // -------------------------------------------------------------
  // Public Endpoints
  // -------------------------------------------------------------
  getClasses: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/classes/`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_CLASSES;
    } catch (err) {
      console.error('Error fetching classes:', err);
      return DEFAULT_CLASSES;
    }
  },

  getClassDetail: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/classes/${id}/`);
      const data = await handleResponse(res);
      if (data) return data;
      return DEFAULT_CLASSES.find(c => c.id === Number(id)) || DEFAULT_CLASSES[0];
    } catch (err) {
      console.error('Error fetching class detail:', err);
      return DEFAULT_CLASSES.find(c => c.id === Number(id)) || DEFAULT_CLASSES[0];
    }
  },

  getTimetable: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/timetable/`);
      const data = await handleResponse(res);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching timetable:', err);
      return [];
    }
  },

  getServices: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_SERVICES;
    } catch (err) {
      console.error('Error fetching services:', err);
      return DEFAULT_SERVICES;
    }
  },

  getTrainers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trainers/`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_TRAINERS;
    } catch (err) {
      console.error('Error fetching trainers:', err);
      return DEFAULT_TRAINERS;
    }
  },

  getGallery: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) return data;
      return DEFAULT_GALLERY;
    } catch (err) {
      console.error('Error fetching gallery:', err);
      return DEFAULT_GALLERY;
    }
  },

  getBlogs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/`);
      const data = await handleResponse(res);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error('Error fetching blogs:', err);
      return [];
    }
  },

  getBlogDetail: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${id}/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching blog detail:', err);
      return null;
    }
  },

  getPricingPlans: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pricing-plans/`);
      const data = await handleResponse(res);
      if (Array.isArray(data) && data.length > 0) {
        return data.map(parsePlanFeatures);
      }
      return DEFAULT_PRICING_PLANS;
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      return DEFAULT_PRICING_PLANS;
    }
  },

  getContactInfo: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact-info/`);
      if (res.status === 404) return null;
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching contact info:', err);
      return null;
    }
  },

  createBooking: async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error creating booking:', err);
      throw err;
    }
  },

  getBookingDetail: async (refId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${refId}/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching booking detail:', err);
      throw err;
    }
  },

  resendBookingEmail: async (refId, email = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(refId)}/resend-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error resending booking confirmation:', err);
      throw err;
    }
  },

  resendBookingSMS: async (refId, phone = '') => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${encodeURIComponent(refId)}/resend-sms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error resending booking SMS confirmation:', err);
      throw err;
    }
  },

  createAppointment: async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  },


  createContactMessage: async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error creating contact message:', err);
      throw err;
    }
  },

  // -------------------------------------------------------------
  // Member Authentication
  // -------------------------------------------------------------
  authRegister: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await handleResponse(res);
  },

  authLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(res);
  },

  authFirebase: async (idToken, profileData = {}) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/firebase/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken, ...profileData }),
    });
    return await handleResponse(res);
  },

  getAuthMe: async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error in getAuthMe:', err);
      return null;
    }
  },

  getMemberDashboard: async (email = '', name = '') => {
    try {
      const query = new URLSearchParams();
      if (email) query.append('email', email);
      if (name) query.append('name', name);
      const res = await fetch(`${API_BASE_URL}/api/member/dashboard/?${query.toString()}`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error in getMemberDashboard:', err);
      return null;
    }
  },

  // -------------------------------------------------------------
  // Admin Authentication & Core APIs
  // -------------------------------------------------------------
  adminLogin: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return await handleResponse(res);
  },

  adminGetDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Bookings & Appointments Management
  adminGetBookings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminGetBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateBooking: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateBooking: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/bookings/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Notification Management APIs
  adminGetNotificationLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/notification-logs/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminGetNotificationLog: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notification-logs/${id}/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminResendNotification: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notification-logs/${id}/resend/`, {
      method: 'POST',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminGetNotificationStats: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notification-logs/stats/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminRunNotificationDiagnostic: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notification-logs/diagnostic/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },


  // Members Management
  adminGetMembers: async (params = {}) => {


    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/members/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminGetMember: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/members/${id}/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateMember: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/members/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateMember: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/members/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteMember: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/members/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Trainers Management
  adminGetTrainers: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/trainers/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateTrainer: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/trainers/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateTrainer: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/trainers/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteTrainer: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/trainers/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Classes Management
  adminGetClasses: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/classes/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateClass: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/classes/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateClass: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/classes/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteClass: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/classes/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Timetable Management
  adminGetTimetable: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/timetable/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateTimetable: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/timetable/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateTimetable: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/timetable/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteTimetable: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/timetable/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Memberships & Plans Management
  adminGetPlans: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/plans/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreatePlan: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/plans/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdatePlan: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/plans/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeletePlan: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/plans/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Payments Management
  adminGetPayments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/payments/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreatePayment: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/payments/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdatePayment: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/payments/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  // Messages Inbox
  adminGetMessages: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/messages/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminUpdateMessage: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteMessage: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Blog Management
  adminGetBlogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/blogs/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminCreateBlog: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/blogs/`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUpdateBlog: async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/blogs/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminDeleteBlog: async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/blogs/${id}/`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Analytics Reports
  adminGetReports: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/reports/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Audit Logs
  adminGetAuditLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/admin/audit-logs/?${query}`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Notifications
  adminGetNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notifications/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminMarkNotificationRead: async (id = 'all') => {
    const res = await fetch(`${API_BASE_URL}/api/admin/notifications/${id}/`, {
      method: 'PUT',
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  // Settings & Profile
  adminGetSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminUpdateSettings: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/settings/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminGetProfile: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/profile/`, {
      headers: getAdminHeaders()
    });
    return await handleResponse(res);
  },

  adminUpdateProfile: async (data) => {
    const res = await fetch(`${API_BASE_URL}/api/admin/profile/`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return await handleResponse(res);
  },

  adminUploadAvatar: async (formDataOrFile) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('gymlife_token');
    let body;
    let headers = {
      'Authorization': token ? `Bearer ${token}` : ''
    };

    if (formDataOrFile instanceof FormData) {
      body = formDataOrFile;
    } else if (formDataOrFile instanceof File || formDataOrFile instanceof Blob) {
      body = new FormData();
      body.append('avatar', formDataOrFile);
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(formDataOrFile);
    }

    const res = await fetch(`${API_BASE_URL}/api/admin/upload-avatar/`, {
      method: 'POST',
      headers: headers,
      body: body
    });
    return await handleResponse(res);
  },

  adminGatewayTest: async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/gateway-test/`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(data)
      });
      const result = await res.json().catch(() => ({ status: 'error', message: `Server error (HTTP ${res.status})` }));
      return result;
    } catch (err) {
      return { status: 'error', message: err.message || 'Network request failed' };
    }
  }
};

export default api;
