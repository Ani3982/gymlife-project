import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/memberships')) return 'Memberships & Plans';
    if (path.includes('/admin/members')) return 'Members Management';
    if (path.includes('/admin/trainers')) return 'Trainers Management';
    if (path.includes('/admin/classes')) return 'Classes & Disciplines';
    if (path.includes('/admin/timetable')) return 'Class Timetable & Schedule';
    if (path.includes('/admin/payments')) return 'Payments & Billing';
    if (path.includes('/admin/messages')) return 'Contact Messages & Enquiries';
    if (path.includes('/admin/blog')) return 'Blog Posts Manager';
    if (path.includes('/admin/reports')) return 'Analytics & Reports';
    if (path.includes('/admin/audit-logs')) return 'System Audit Logs';
    if (path.includes('/admin/settings')) return 'Gym Settings & Branding';
    if (path.includes('/admin/profile')) return 'My Admin Profile';
    return 'Dashboard Overview';
  };

  return (
    <div className="gymlife-admin-wrapper">
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="admin-main-container">
        <AdminNavbar 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle()}
        />

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
