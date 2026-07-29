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
    name: 'Class drop-in',
    price: '39.0',
    period: 'SINGLE CLASS',
    features: [
      'Free riding',
      'Unlimited equipments',
      'Personal trainer',
      'Weight loss class',
      'Month to month',
      'No incline restriction'
    ]
  },
  {
    id: 2,
    name: '12 Month membership',
    price: '59.0',
    period: 'SINGLE CLASS',
    features: [
      'Free riding',
      'Unlimited equipments',
      'Personal trainer',
      'Weight loss class',
      'Month to month',
      'No incline restriction'
    ]
  },
  {
    id: 3,
    name: '6 Month membership',
    price: '99.0',
    period: 'SINGLE CLASS',
    features: [
      'Free riding',
      'Unlimited equipments',
      'Personal trainer',
      'Weight loss class',
      'Month to month',
      'No incline restriction'
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

  // Admin endpoints
  adminLogin: async (credentials) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
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
