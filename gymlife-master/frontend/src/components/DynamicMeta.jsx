import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES = {
  '/': 'GymLife ⚡ Elite Fitness & Gym Arena',
  '/about-us': 'About Us 🏆 GymLife Story & Mission',
  '/services': 'Fitness Services ⚡ GymLife Arena',
  '/team': 'Certified Coaches 🏋️ GymLife Team',
  '/classes': 'Training Classes 🔥 GymLife Programs',
  '/class-details': 'Class Details 🔥 GymLife Workout',
  '/class-timetable': 'Class Schedule 📅 GymLife Timetable',
  '/bmi-calculator': 'BMI Calculator ⚖️ Health Tools',
  '/gallery': 'Photo Gallery 📸 GymLife Arena',
  '/blog': 'Fitness Blog 📰 Tips & Nutrition',
  '/blog-details': 'Fitness Insights 📰 GymLife Articles',
  '/contact': 'Contact Support 📞 GymLife Helpline',
  '/login': 'Member Sign In 🔐 GymLife Portal',
  '/signin': 'Member Sign In 🔐 GymLife Portal',
  '/signup': 'Join GymLife ⚡ Member Registration',
  '/register': 'Join GymLife ⚡ Member Registration',
  '/dashboard': 'Athlete Portal 👤 GymLife Member',
  '/member-portal': 'Athlete Portal 👤 GymLife Member',
  '/admin/login': 'Admin Portal 🛡️ GymLife Security',
  '/admin/dashboard': 'Admin Dashboard 📊 GymLife Management',
  '/admin/appointments': 'Bookings & Appointments 📅 GymLife Admin',
  '/admin/members': 'Member Directory 👥 GymLife Admin',
  '/admin/trainers': 'Trainer Management 🏋️ GymLife Admin',
  '/admin/classes': 'Classes Management 🥊 GymLife Admin',
  '/admin/timetable': 'Schedule & Timetable ⏱️ GymLife Admin',
  '/admin/memberships': 'Pricing & Plans 💳 GymLife Admin',
  '/admin/payments': 'Payments & Billing 💰 GymLife Admin',
  '/admin/messages': 'Contact Enquiries 📩 GymLife Admin',
  '/admin/blog': 'Blog Articles ✍️ GymLife Admin',
  '/admin/reports': 'Analytics & KPIs 📈 GymLife Admin',
  '/admin/notifications': 'Notifications & Alerts 🔔 GymLife Admin',
  '/admin/audit-logs': 'Security Audit Trail 🛡️ GymLife Admin',
  '/admin/settings': 'System Settings ⚙️ GymLife Admin',
  '/admin/profile': 'Administrator Profile 👤 GymLife Admin',
};

export const DynamicMeta = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const title = ROUTE_TITLES[path] || (path.startsWith('/admin') ? 'Admin Panel 🛡️ GymLife' : 'GymLife ⚡ Elite Fitness Center');
    document.title = title;
  }, [location]);

  return null;
};

export default DynamicMeta;
