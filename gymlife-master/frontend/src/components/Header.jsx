import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Header = ({ onSearchClick }) => {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [mobilePagesExpanded, setMobilePagesExpanded] = useState(false);

  const userMenuRef = useRef(null);
  const pagesDropdownRef = useRef(null);

  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isCanvasOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCanvasOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsCanvasOpen(false);
    setIsUserMenuOpen(false);
    setIsPagesDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target)) {
        setIsPagesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsCanvasOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Offcanvas Dark Backdrop Overlay */}
      <div 
        className={`gymlife-drawer-overlay ${isCanvasOpen ? 'active' : ''}`}
        onClick={() => setIsCanvasOpen(false)}
        aria-hidden="true"
      />

      {/* Modern Slide-In Mobile Navigation Drawer */}
      <aside 
        className={`gymlife-mobile-drawer ${isCanvasOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <Link to="/" onClick={() => setIsCanvasOpen(false)} className="drawer-brand">
            <img src="/img/logo.png" alt="GymLife" />
          </Link>
          <button 
            className="drawer-close-btn" 
            onClick={() => setIsCanvasOpen(false)}
            aria-label="Close navigation"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>

        {/* Drawer Content Area (Scrollable) */}
        <div className="drawer-body">
          {/* Quick Search Action */}
          <div className="drawer-search-box" onClick={() => { setIsCanvasOpen(false); onSearchClick(); }}>
            <i className="fa fa-search"></i>
            <span>{t('search_placeholder', 'Search classes, blogs, trainers...')}</span>
          </div>

          {/* Language Switcher in Mobile Drawer */}
          <LanguageSelector variant="mobile-drawer" />

          {/* User Auth Card */}
          <div className="drawer-auth-card">
            {isAuthenticated ? (
              <div className="drawer-user-info">
                <div className="drawer-avatar-badge">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="drawer-user-details">
                  <span className="drawer-user-name">{user?.name || user?.username}</span>
                  <span className="drawer-user-role">
                    {isAdmin ? `🛡️ ${t('admin', 'Administrator')}` : `⭐ ${t('vip_member', 'VIP Gold Member')}`}
                  </span>
                </div>
                <div className="drawer-user-actions">
                  <Link 
                    to="/dashboard" 
                    className="drawer-btn-dash" 
                    onClick={() => setIsCanvasOpen(false)}
                  >
                    <i className="fa fa-tachometer"></i> {t('dashboard', 'Dashboard')}
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin/dashboard" 
                      className="drawer-btn-admin" 
                      onClick={() => setIsCanvasOpen(false)}
                    >
                      <i className="fa fa-shield"></i> {t('admin_panel', 'Admin Panel')}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="drawer-btn-logout">
                    <i className="fa fa-sign-out"></i> {t('sign_out', 'Sign Out')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="drawer-guest-buttons">
                <button 
                  className="drawer-btn-signin" 
                  onClick={() => { setIsCanvasOpen(false); openAuthModal('login'); }}
                >
                  <i className="fa fa-user-circle-o"></i> {t('sign_in', 'Sign In')}
                </button>
                <button 
                  className="drawer-btn-join" 
                  onClick={() => { setIsCanvasOpen(false); openAuthModal('register'); }}
                >
                  <span>{t('join_now', 'Join GymLife')}</span>
                  <i className="fa fa-bolt"></i>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Navigation Links */}
          <nav className="drawer-nav">
            <ul className="drawer-menu-list">
              <li>
                <Link to="/" className={`drawer-nav-item ${isActive('/') ? 'active' : ''}`}>
                  <i className="fa fa-home"></i>
                  <span>{t('home', 'Home')}</span>
                </Link>
              </li>
              <li>
                <Link to="/about-us" className={`drawer-nav-item ${isActive('/about-us') ? 'active' : ''}`}>
                  <i className="fa fa-info-circle"></i>
                  <span>{t('about_us', 'About Us')}</span>
                </Link>
              </li>
              <li>
                <Link to="/class-details" className={`drawer-nav-item ${isActive('/class-details') ? 'active' : ''}`}>
                  <i className="fa fa-heartbeat"></i>
                  <span>{t('classes', 'Classes')}</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className={`drawer-nav-item ${isActive('/services') ? 'active' : ''}`}>
                  <i className="fa fa-cogs"></i>
                  <span>{t('services', 'Services')}</span>
                </Link>
              </li>
              <li>
                <Link to="/team" className={`drawer-nav-item ${isActive('/team') ? 'active' : ''}`}>
                  <i className="fa fa-users"></i>
                  <span>{t('our_team', 'Our Team')}</span>
                </Link>
              </li>

              {/* Accordion Pages Submenu */}
              <li className="drawer-submenu-wrapper">
                <button 
                  type="button"
                  className={`drawer-submenu-toggle ${mobilePagesExpanded ? 'expanded' : ''}`}
                  onClick={() => setMobilePagesExpanded(!mobilePagesExpanded)}
                >
                  <div className="submenu-toggle-left">
                    <i className="fa fa-folder-open-o"></i>
                    <span>{t('pages', 'Pages')}</span>
                  </div>
                  <i className={`fa ${mobilePagesExpanded ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
                </button>

                {mobilePagesExpanded && (
                  <ul className="drawer-submenu-items">
                    <li><Link to="/about-us">{t('about_us', 'About Us')}</Link></li>
                    <li><Link to="/class-timetable">{t('class_timetable', 'Class Timetable')}</Link></li>
                    <li><Link to="/bmi-calculator">{t('bmi_calculator', 'BMI Calculator')}</Link></li>
                    <li><Link to="/team">{t('our_team', 'Trainers & Team')}</Link></li>
                    <li><Link to="/gallery">{t('gallery', 'Photo Gallery')}</Link></li>
                    <li><Link to="/blog">{t('blog', 'Fitness Blog')}</Link></li>
                    <li><Link to="/contact">{t('contact_us', 'Contact Support')}</Link></li>
                    {isAdmin && <li><Link to="/admin/dashboard" className="admin-link">{t('admin_panel', 'Admin Dashboard')}</Link></li>}
                  </ul>
                )}
              </li>

              <li>
                <Link to="/contact" className={`drawer-nav-item ${isActive('/contact') ? 'active' : ''}`}>
                  <i className="fa fa-envelope-o"></i>
                  <span>{t('contact', 'Contact')}</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Drawer Social Footnote */}
          <div className="drawer-footer-social">
            <span>{t('stay_connected', 'Follow Our Fitness Journey')}</span>
            <div className="social-icons-row">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fa fa-facebook"></i></a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fa fa-twitter"></i></a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fa fa-youtube-play"></i></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Top Header */}
      <header className={`header-section ${isSticky ? 'sticky-glass-header' : ''}`}>
        <div className="header-inner-container">
          {/* Logo */}
          <div className="header-logo-col">
            <Link to="/" className="site-logo">
              <img src="/img/logo.png" alt="GymLife Elite Fitness" />
            </Link>
          </div>

          {/* Desktop Navigation Links (Hidden on Mobile/Tablet) */}
          <nav className="header-desktop-nav">
            <ul className="desktop-menu-list">
              <li className={isActive('/') ? 'active' : ''}><Link to="/">{t('home', 'Home')}</Link></li>
              <li className={isActive('/about-us') ? 'active' : ''}><Link to="/about-us">{t('about_us', 'About Us')}</Link></li>
              <li className={isActive('/class-details') ? 'active' : ''}><Link to="/class-details">{t('classes', 'Classes')}</Link></li>
              <li className={isActive('/services') ? 'active' : ''}><Link to="/services">{t('services', 'Services')}</Link></li>
              <li className={isActive('/team') ? 'active' : ''}><Link to="/team">{t('our_team', 'Our Team')}</Link></li>
              
              {/* Pages Dropdown with Hover & Click */}
              <li 
                className={`pages-dropdown-li ${isPagesDropdownOpen ? 'open' : ''}`}
                ref={pagesDropdownRef}
                onMouseEnter={() => setIsPagesDropdownOpen(true)}
                onMouseLeave={() => setIsPagesDropdownOpen(false)}
              >
                <button 
                  type="button" 
                  className="dropdown-trigger-btn"
                  onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)}
                >
                  {t('pages', 'Pages')} <i className="fa fa-angle-down"></i>
                </button>
                <ul className="desktop-sub-dropdown">
                  <li><Link to="/about-us">{t('about_us', 'About us')}</Link></li>
                  <li><Link to="/class-timetable">{t('class_timetable', 'Classes timetable')}</Link></li>
                  <li><Link to="/bmi-calculator">{t('bmi_calculator', 'BMI calculate')}</Link></li>
                  <li><Link to="/team">{t('our_team', 'Our team')}</Link></li>
                  <li><Link to="/gallery">{t('gallery', 'Gallery')}</Link></li>
                  <li><Link to="/blog">{t('blog', 'Our blog')}</Link></li>
                  <li><Link to="/contact">{t('contact_us', 'Contact us')}</Link></li>
                  {isAdmin && <li><Link to="/admin/dashboard" className="admin-highlight-link">{t('admin_panel', 'Admin Dashboard')}</Link></li>}
                </ul>
              </li>
              
              <li className={isActive('/contact') ? 'active' : ''}><Link to="/contact">{t('contact', 'Contact')}</Link></li>
            </ul>
          </nav>

          {/* Right Actions: Search + Language Selector + User/Auth + Mobile Hamburger */}
          <div className="header-right-actions">
            {/* Search Button */}
            <button 
              type="button"
              className="header-search-btn" 
              onClick={onSearchClick} 
              title={t('search_title', 'Search GymLife')}
              aria-label="Search"
            >
              <i className="fa fa-search"></i>
            </button>

            {/* Language Selector Dropdown (Desktop) */}
            <LanguageSelector variant="desktop" />

            {/* Desktop / Tablet User Auth */}
            {isAuthenticated ? (
              <div className="header-user-profile" ref={userMenuRef}>
                <button 
                  className="user-profile-trigger" 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User Profile Menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="user-avatar-badge">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-name-wrapper">
                    <span className="user-display-name">{user?.name || user?.username}</span>
                    <span className="user-role-label">{isAdmin ? `🛡️ ${t('admin', 'Admin')}` : `⭐ ${t('member', 'Member')}`}</span>
                  </div>
                  <i className={`fa ${isUserMenuOpen ? 'fa-angle-up' : 'fa-angle-down'}`}></i>
                </button>

                {isUserMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="dropdown-header">
                      <strong>{user?.name || user?.username}</strong>
                      <small>{user?.email}</small>
                      <span className="tier-tag">{user?.plan || t('vip_member', 'VIP Gold Member')}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to="/dashboard" 
                      className="dropdown-item" 
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fa fa-tachometer"></i> {t('dashboard', 'Member Dashboard')}
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin/dashboard" 
                        className="dropdown-item admin-item" 
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <i className="fa fa-shield"></i> {t('admin_panel', 'Admin Control Panel')}
                      </Link>
                    )}
                    <Link 
                      to="/class-timetable" 
                      className="dropdown-item" 
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <i className="fa fa-calendar"></i> {t('class_timetable', 'Class Timetable')}
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <i className="fa fa-sign-out"></i> {t('sign_out', 'Sign Out')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="header-guest-auth">
                <button 
                  className="btn-header-signin" 
                  onClick={() => openAuthModal('login')}
                >
                  <i className="fa fa-user-circle-o"></i> {t('sign_in', 'Sign In')}
                </button>
                <button 
                  className="btn-header-join" 
                  onClick={() => openAuthModal('register')}
                >
                  <span>{t('join_now', 'Join Now')}</span>
                  <i className="fa fa-arrow-right"></i>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button 
              type="button"
              className={`mobile-hamburger-btn ${isCanvasOpen ? 'active' : ''}`}
              onClick={() => setIsCanvasOpen(!isCanvasOpen)}
              aria-label="Toggle mobile menu"
            >
              <i className={isCanvasOpen ? "fa fa-times" : "fa fa-bars"}></i>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;