import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
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

function App() {
  return (
    <BrowserRouter>
      <SpeedInsights />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route element={<Layout />}>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blog-details" element={<BlogDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/bmi-calculator" element={<BmiCalculator />} />
          <Route path="/class-details" element={<ClassDetails />} />
          <Route path="/class-timetable" element={<ClassTimetable />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/" element={<Index />} />
          <Route path="/main" element={<Main />} />
          <Route path="/services" element={<Services />} />
          <Route path="/team" element={<Team />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
