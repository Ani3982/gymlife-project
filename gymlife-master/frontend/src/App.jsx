import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import AuthModal from './components/AuthModal';

import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import AboutUs from './pages/AboutUs';
import BlogDetails from './pages/BlogDetails';
import Blog from './pages/Blog';
import BmiCalculator from './pages/BmiCalculator';
import ClassDetails from './pages/ClassDetails';
import ClassTimetable from './pages/ClassTimetable';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Index from './pages/Index';
import Main from './pages/Main';
import Services from './pages/Services';
import Team from './pages/Team';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MemberDashboard from './pages/MemberDashboard';

// Admin System Components & Pages
import AdminLogin from './pages/AdminLogin';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminMembers from './pages/admin/AdminMembers';

import AdminTrainers from './pages/admin/AdminTrainers';
import AdminClasses from './pages/admin/AdminClasses';
import AdminTimetable from './pages/admin/AdminTimetable';
import AdminMemberships from './pages/admin/AdminMemberships';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMessages from './pages/admin/AdminMessages';
import AdminBlog from './pages/admin/AdminBlog';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <SpeedInsights />
            <AuthModal />
            <Routes>
              {/* Standalone Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Production Admin Panel Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="members" element={<AdminMembers />} />

                <Route path="trainers" element={<AdminTrainers />} />
                <Route path="classes" element={<AdminClasses />} />
                <Route path="timetable" element={<AdminTimetable />} />
                <Route path="memberships" element={<AdminMemberships />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />

                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              {/* Main Public Application Layout Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/services" element={<Services />} />
                <Route path="/team" element={<Team />} />
                <Route path="/classes" element={<ClassDetails />} />
                <Route path="/class-details" element={<ClassDetails />} />
                <Route path="/class-timetable" element={<ClassTimetable />} />
                <Route path="/bmi-calculator" element={<BmiCalculator />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog-details" element={<BlogDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/main" element={<Main />} />

                {/* User Authentication & Member Portal Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signin" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/register" element={<SignUp />} />
                <Route path="/dashboard" element={<MemberDashboard />} />
                <Route path="/member-portal" element={<MemberDashboard />} />

                {/* Fallback 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;