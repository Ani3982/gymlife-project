import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MemberDashboard from './pages/MemberDashboard';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <SpeedInsights />
            <AuthModal />
            <Routes>
              {/* Standalone Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* Main Application Layout Routes */}
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