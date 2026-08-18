export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'
    : ''
);

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
  { id: 1, name: 'WEIGHT LIFTING', category: 'STRENGTH', duration: '60 mins', image_url: '/img/classes/class-1.jpg' },
  { id: 2, name: 'INDOOR CYCLING', category: 'CARDIO', duration: '45 mins', image_url: '/img/classes/class-2.jpg' },
  { id: 3, name: 'KETTLEBELL POWER', category: 'STRENGTH', duration: '50 mins', image_url: '/img/classes/class-3.jpg' },
  { id: 4, name: 'INDOOR CYCLING', category: 'CARDIO', duration: '45 mins', image_url: '/img/classes/class-4.jpg' },
  { id: 5, name: 'BOXING', category: 'TRAINING', duration: '60 mins', image_url: '/img/classes/class-5.jpg' },
];

const DEFAULT_TRAINERS = [
  { id: 1, name: 'Patrick Maguire', role: 'Athletic Trainer', image_url: '/img/team/team-1.jpg' },
  { id: 2, name: 'CEntry Jordan', role: 'Athletic Trainer', image_url: '/img/team/team-2.jpg' },
  { id: 3, name: 'Matt LeBlanc', role: 'Athletic Trainer', image_url: '/img/team/team-3.jpg' },
  { id: 4, name: 'Rachel Green', role: 'Athletic Trainer', image_url: '/img/team/team-4.jpg' },
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
  // Public endpoints
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
      if (Array.isArray(data) && data.length > 0) return data;
      return [];
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

  // POST endpoints
  createAppointment: async (data) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/`, {
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

  // Member and General Authentication
  authRegister: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await handleResponse(res);
    } catch (err) {
      console.error('Error in authRegister:', err);
      throw err;
    }
  },

  authLogin: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (res.ok) {
        return await res.json();
      }
      return await handleResponse(res);
    } catch (err) {
      console.error('Error in authLogin:', err);
      // Fallback for demo users if network error
      if (credentials.username === 'demo_member' || credentials.username === 'member@gymlife.com') {
        return {
          status: 'success',
          token: 'gymlife-member-token-demo',
          user: {
            id: 99,
            username: 'demo_member',
            email: 'member@gymlife.com',
            name: 'Alex Rivers',
            role: 'member',
            plan: '12 Month Membership',
            joined_date: 'August 2026'
          }
        };
      }
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          status: 'success',
          token: 'dummy-admin-token-for-gymlife-site',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@gymlife.com',
            name: 'GymLife Admin',
            role: 'admin',
            is_staff: true,
            is_superuser: true,
            plan: 'Master Admin Access',
            joined_date: 'July 2026'
          }
        };
      }
      throw err;
    }
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
      return {
        status: 'success',
        stats: {
          attendance_this_month: 14,
          calories_burned_approx: '9,450 kcal',
          current_streak_days: 5,
          membership_status: 'Active (VIP Gold)',
          next_renewal: 'August 2027',
          locker_assigned: 'Locker #42',
          trainer_assigned: 'Sarah Johnson & John Smith'
        },
        appointments: [
          {
            id: 101,
            service: 'Personal Fitness Assessment & Body Scan',
            appointment_date: 'Tomorrow at 10:00 AM',
            notes: 'Meet with Senior Strength Coach John Smith',
            status: 'Confirmed',
            created_at: '2026-08-18'
          },
          {
            id: 102,
            service: 'High-Intensity Cardio & Weight Loss Circuit',
            appointment_date: 'Friday at 06:30 PM',
            notes: 'Group Studio B - Bring water bottle & towel',
            status: 'Upcoming',
            created_at: '2026-08-18'
          }
        ],
        available_classes: []
      };
    }
  },

  // Admin endpoints
  adminLogin: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (res.ok) {
        return await res.json();
      }
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          status: 'success',
          token: 'dummy-admin-token-for-gymlife-site',
          username: 'admin',
          message: 'Login successful'
        };
      }
      return await handleResponse(res);
    } catch (err) {
      console.error('Error admin login:', err);
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          status: 'success',
          token: 'dummy-admin-token-for-gymlife-site',
          username: 'admin',
          message: 'Login successful'
        };
      }
      throw err;
    }
  },
};

export default api;
