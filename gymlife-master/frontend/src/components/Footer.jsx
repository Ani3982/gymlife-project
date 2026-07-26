import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Footer = () => {
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
      {/*  Get In Touch Section Begin  */}
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
      {/*  Get In Touch Section End  */}

      {/*  Footer Section Begin  */}
      <section className="footer-section">
          <div className="container">
              <div className="row">
                  <div className="col-lg-4">
                      <div className="fs-about">
                          <div className="fa-logo">
                              <Link to="/"><img src="/img/logo.png" alt="" /></Link>
                          </div>
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                              labore dolore magna aliqua endisse ultrices gravida lorem.</p>
                          <div className="fa-social">
                              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>
                              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>
                              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>
                              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>
                              <a href={`mailto:${contactInfo.email}`}><i className="fa  fa-envelope-o"></i></a>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6">
                      <div className="fs-widget">
                          <h4>Useful links</h4>
                          <ul>
                              <li><Link to="/about-us">About</Link></li>
                              <li><Link to="/blog">Blog</Link></li>
                              <li><Link to="/class-details">Classes</Link></li>
                              <li><Link to="/contact">Contact</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-lg-2 col-md-3 col-sm-6">
                      <div className="fs-widget">
                          <h4>Support</h4>
                          <ul>
                              <li><Link to="/admin/login">Admin Panel</Link></li>
                              <li><Link to="/admin/login">My account</Link></li>
                              <li><Link to="/contact">Subscribe</Link></li>
                              <li><Link to="/contact">Contact</Link></li>
                          </ul>
                      </div>
                  </div>
                  <div className="col-lg-4 col-md-6">
                      <div className="fs-widget">
                          <h4>Tips & Guides</h4>
                          <div className="fw-recent">
                              <h6><Link to="/blog">Physical fitness may help prevent depression, anxiety</Link></h6>
                              <ul>
                                  <li>3 min read</li>
                                  <li>20 Comment</li>
                              </ul>
                          </div>
                          <div className="fw-recent">
                              <h6><Link to="/blog">Fitness: The best exercise to lose belly fat and tone up...</Link></h6>
                              <ul>
                                  <li>3 min read</li>
                                  <li>20 Comment</li>
                              </ul>
                          </div>
                      </div>
                  </div>
               </div>
              <div className="row">
                  <div className="col-lg-12 text-center">
                       <div className="copyright-text">
                           <p>
                             Copyright &copy; {new Date().getFullYear()} GymLife. All Rights Reserved.
                           </p>
                       </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Footer Section End  */}
    </>
  );
};

export default Footer;
