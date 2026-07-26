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

export const api = {
  // Public endpoints
  getClasses: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/classes/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching classes:', err);
      return [];
    }
  },

  getClassDetail: async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/classes/${id}/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching class detail:', err);
      return null;
    }
  },

  getServices: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching services:', err);
      return [];
    }
  },

  getTrainers: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trainers/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching trainers:', err);
      return [];
    }
  },

  getGallery: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/gallery/`);
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      return [];
    }
  },

  getBlogs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/`);
      return await handleResponse(res);
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
      return await handleResponse(res);
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      return [];
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
      throw err;
    }
  },
};

export default api;
