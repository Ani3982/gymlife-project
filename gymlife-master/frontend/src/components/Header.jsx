import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onSearchClick }) => {
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);

  useEffect(() => {
    if (window.jQuery && window.jQuery.fn.slicknav) {
      const $ = window.jQuery;
      // Prevent duplicates
      $("#mobile-menu-wrap").empty();
      const $menu = $(".mobile-menu");
      if ($menu.length > 0) {
        $menu.slicknav({
          prependTo: '#mobile-menu-wrap',
          allowParentLinks: true
        });
      }
    }
    return () => {
      if (window.jQuery) {
        const $ = window.jQuery;
        $("#mobile-menu-wrap").empty();
      }
    };
  }, []);

  return (
    <>
      {/*  Offcanvas Menu Section Begin  */}
      <div 
        className={`offcanvas-menu-overlay ${isCanvasOpen ? 'active' : ''}`}
        onClick={() => setIsCanvasOpen(false)}
      ></div>
      <div className={`offcanvas-menu-wrapper ${isCanvasOpen ? 'show-offcanvas-menu-wrapper' : ''}`}>
          <div className="canvas-close" onClick={() => setIsCanvasOpen(false)}>
              <i className="fa fa-close"></i>
          </div>
          <div className="canvas-search search-switch" onClick={onSearchClick}>
              <i className="fa fa-search"></i>
          </div>
          <nav className="canvas-menu mobile-menu">
              <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about-us">About Us</Link></li>
                  <li><Link to="/class-details">Classes</Link></li>
                  <li><Link to="/services">Services</Link></li>
                  <li><Link to="/team">Our Team</Link></li>
                  <li><a href="#">Pages</a>
                      <ul className="dropdown">
                          <li><Link to="/about-us">About us</Link></li>
                          <li><Link to="/class-timetable">Classes timetable</Link></li>
                          <li><Link to="/bmi-calculator">Bmi calculate</Link></li>
                          <li><Link to="/team">Our team</Link></li>
                          <li><Link to="/gallery">Gallery</Link></li>
                          <li><Link to="/blog">Our blog</Link></li>
                          <li><Link to="/404">404</Link></li>
                      </ul>
                  </li>
                  <li><Link to="/contact">Contact</Link></li>
              </ul>
          </nav>
          <div id="mobile-menu-wrap"></div>
          <div className="canvas-social">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>
          </div>
      </div>
      {/*  Offcanvas Menu Section End  */}

      {/*  Header Section Begin  */}
      <header className="header-section">
          <div className="container-fluid">
              <div className="row">
                  <div className="col-lg-3">
                      <div className="logo">
                          <Link to="/">
                              <img src="/img/logo.png" alt="" />
                          </Link>
                      </div>
                  </div>
                  <div className="col-lg-6">
                      <nav className="nav-menu">
                          <ul>
                              <li><Link to="/">Home</Link></li>
                              <li><Link to="/about-us">About Us</Link></li>
                              <li><Link to="/class-details">Classes</Link></li>
                              <li><Link to="/services">Services</Link></li>
                              <li><Link to="/team">Our Team</Link></li>
                              <li><a href="#">Pages</a>
                                  <ul className="dropdown">
                                      <li><Link to="/about-us">About us</Link></li>
                                      <li><Link to="/class-timetable">Classes timetable</Link></li>
                                      <li><Link to="/bmi-calculator">Bmi calculate</Link></li>
                                      <li><Link to="/team">Our team</Link></li>
                                      <li><Link to="/gallery">Gallery</Link></li>
                                      <li><Link to="/blog">Our blog</Link></li>
                                      <li><Link to="/404">404</Link></li>
                                  </ul>
                              </li>
                              <li><Link to="/contact">Contact</Link></li>
                          </ul>
                      </nav>
                  </div>
                  <div className="col-lg-3">
                      <div className="top-option">
                          <div className="to-search search-switch" onClick={onSearchClick}>
                              <i className="fa fa-search"></i>
                          </div>
                          <div className="to-social">
                              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>
                              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>
                              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>
                              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="canvas-open" onClick={() => setIsCanvasOpen(true)}>
                  <i className="fa fa-bars"></i>
              </div>
          </div>
      </header>
      {/*  Header End  */}
    </>
  );
};

export default Header;
