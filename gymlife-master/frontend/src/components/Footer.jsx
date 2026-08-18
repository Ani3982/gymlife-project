import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Footer = () => {
  const { t } = useLanguage();
  const [contactInfo, setContactInfo] = useState({
    address: '333 Middle Winchendon Rd, Rindge, NH 03461',
    phone_numbers: ['125-711-811', '125-668-886'],
    email: 'Support.gymcenter@gmail.com'
  });

  useEffect(() => {
    api.getContactInfo()
      .then(data => {
        if (data && data.id) {
          setContactInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Get In Touch Section Begin */}
      <div className="gettouch-section">
          <div className="container">
              <div className="row">
                  <div className="col-md-4">
                      <div className="gt-text">
                          <i className="fa fa-map-marker"></i>
                          <p>{contactInfo.address}</p>
                      </div>
                  </div>
                  <div className="col-md-4">
                      <div className="gt-text">
                          <i className="fa fa-mobile"></i>
                          <ul>
                              {contactInfo.phone_numbers && contactInfo.phone_numbers.map((phone, idx) => (
                                  <li key={idx}>{phone}</li>
                              ))}
                          </ul>
                      </div>
                  </div>
                  <div className="col-md-4">
                      <div className="gt-text email">
                          <i className="fa fa-envelope"></i>
                          <p>{contactInfo.email}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      {/* Get In Touch Section End */}

      {/* Footer Section Begin */}
      <section className="footer-section">
          <div className="container">
              <div className="row">
                  <div className="col-lg-4">
                      <div className="fs-about">
                          <div className="fa-logo">
                              <Link to="/"><img src="/img/logo.png" alt="GymLife" /></Link>
                          </div>
                          <p>{t('footer_about', 'GymLife is an elite fitness studio dedicated to transforming bodies and minds through science-backed training and nutrition.')}</p>
                          <div className="fa-social">
                              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fa fa-facebook"></i></a>
                              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><i className="fa fa-twitter"></i></a>
                              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><i className="fa fa-youtube-play"></i></a>
                              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fa fa-instagram"></i></a>
                              <a href={`mailto:${contactInfo.email}`} aria-label="Email"><i className="fa fa-envelope-o"></i></a>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6">
                      <div className="fs-widget">
                          <h4>{t('useful_links', 'Useful Links')}</h4>
                          <ul>
                              <li><Link to="/about-us">{t('about_us', 'About')}</Link></li>
                              <li><Link to="/blog">{t('blog', 'Blog')}</Link></li>
                              <li><Link to="/class-details">{t('classes', 'Classes')}</Link></li>
                              <li><Link to="/contact">{t('contact', 'Contact')}</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6">
                      <div className="fs-widget">
                          <h4>{t('support_links', 'Support')}</h4>
                          <ul>
                              <li><Link to="/admin/login">{t('admin_panel', 'Admin Panel')}</Link></li>
                              <li><Link to="/dashboard">{t('member_dashboard', 'My Account')}</Link></li>
                              <li><Link to="/class-timetable">{t('class_timetable', 'Timetable')}</Link></li>
                              <li><Link to="/contact">{t('contact_us', 'Contact')}</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-lg-4 col-md-6">
                      <div className="fs-widget">
                          <h4>{t('stay_connected', 'Opening Hours')}</h4>
                          <p style={{ color: '#a4a5b0', fontSize: '14px', marginBottom: '8px' }}>
                            <i className="fa fa-clock-o" style={{ color: '#f36100', marginRight: '8px' }}></i>
                            {t('mon_fri_hours', 'Monday - Friday: 06:00 - 22:00')}
                          </p>
                          <p style={{ color: '#a4a5b0', fontSize: '14px' }}>
                            <i className="fa fa-clock-o" style={{ color: '#f36100', marginRight: '8px' }}></i>
                            {t('sat_sun_hours', 'Saturday - Sunday: 07:00 - 20:00')}
                          </p>
                      </div>
                  </div>
               </div>
              <div className="row">
                  <div className="col-lg-12 text-center">
                       <div className="copyright-text">
                           <p>
                             Copyright &copy; {new Date().getFullYear()} GymLife. {t('all_rights', 'All Rights Reserved.')}
                           </p>
                       </div>
                  </div>
              </div>
          </div>
      </section>
      {/* Footer Section End */}
    </>
  );
};

export default Footer;