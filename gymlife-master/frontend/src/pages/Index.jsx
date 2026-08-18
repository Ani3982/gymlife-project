import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentSection from '../components/AppointmentSection';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Index = () => {
  const { openAuthModal, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const [classes, setClasses] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [classesData, plansData, galleryData, trainersData] = await Promise.all([
          api.getClasses(),
          api.getPricingPlans(),
          api.getGallery(),
          api.getTrainers(),
        ]);

        setClasses(Array.isArray(classesData) ? classesData.slice(0, 5) : []);
        setPricingPlans(Array.isArray(plansData) ? plansData : []);
        setGallery(Array.isArray(galleryData) ? galleryData.slice(0, 6) : []);
        setTrainers(Array.isArray(trainersData) ? trainersData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Re-init hero slider on mount and whenever language changes
  useEffect(() => {
    let $slider = null;
    let timer = setTimeout(() => {
      if (window.jQuery && window.jQuery.fn.owlCarousel) {
        const $ = window.jQuery;
        $slider = $(".hs-slider");
        if ($slider.length > 0) {
          if ($slider.data('owl.carousel')) {
            $slider.owlCarousel('destroy');
          }
          $slider.owlCarousel({
            loop: true,
            margin: 0,
            nav: true,
            items: 1,
            dots: false,
            animateOut: 'fadeOut',
            animateIn: 'fadeIn',
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            smartSpeed: 1200,
            autoHeight: false,
            autoplay: false
          });
        }
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if ($slider && $slider.data('owl.carousel')) {
        $slider.owlCarousel('destroy');
      }
    };
  }, [language]);

  useEffect(() => {
    let $slider = null;
    let timer = null;
    if (trainers.length > 0) {
      timer = setTimeout(() => {
        if (window.jQuery && window.jQuery.fn.owlCarousel) {
          const $ = window.jQuery;
          $slider = $(".ts-slider");
          if ($slider.length > 0) {
            if ($slider.data('owl.carousel')) {
              $slider.owlCarousel('destroy');
            }
            $slider.owlCarousel({
                loop: trainers.length > 3,
                margin: 0,
                items: 3,
                dots: true,
                dotsEach: 2,
                smartSpeed: 1200,
                autoHeight: false,
                autoplay: true,
                responsive: {
                    320: { items: 1 },
                    768: { items: 2 },
                    992: { items: 3 }
                }
            });
          }
        }
      }, 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if ($slider && $slider.data('owl.carousel')) {
        $slider.owlCarousel('destroy');
      }
    };
  }, [trainers, language]);

  useEffect(() => {
    let timer = null;
    if (gallery.length > 0) {
      timer = setTimeout(() => {
        if (window.jQuery && window.jQuery.fn.magnificPopup) {
          const $ = window.jQuery;
          $('.image-popup').magnificPopup({
              type: 'image'
          });
        }
      }, 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (window.jQuery) {
        const $ = window.jQuery;
        $('.image-popup').off('click');
      }
    };
  }, [gallery]);

  const getClassColClass = (index) => {
    if (index < 3) return "col-lg-4 col-md-6";
    if (index === 3) return "col-lg-6 col-md-6";
    return "col-lg-6";
  };

  const getGalleryItemClass = (index) => {
    if (index === 0 || index === 5) return "gs-item grid-wide set-bg";
    return "gs-item set-bg";
  };

  return (
    <>
      {/* Hero Section Begin */}
      <section className="hero-section">
          <div className="hs-slider owl-carousel" key={`hero-${language}`}>
              <div className="hs-item set-bg" data-setbg="/img/hero/hero-1.jpg" style={{ backgroundImage: "url('/img/hero/hero-1.jpg')" }}>
                  <div className="container">
                      <div className="row">
                          <div className="col-lg-6 offset-lg-6">
                              <div className="hi-text">
                                  <span>{t('hero_shape_body', 'Shape your body & transform your life')}</span>
                                  <h1>{t('hero_be_strong', 'Be strong training hard')}</h1>
                                  <div className="hero-btn-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button 
                                      className="primary-btn" 
                                      onClick={() => openAuthModal('register')}
                                      style={{ border: 'none', cursor: 'pointer' }}
                                    >
                                      {t('claim_free_pass', 'Claim 3-Day Free Pass')}
                                    </button>
                                    <Link to="/class-timetable" className="primary-btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                      {t('view_timetable', 'View Timetable')}
                                    </Link>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="hs-item set-bg" data-setbg="/img/hero/hero-2.jpg" style={{ backgroundImage: "url('/img/hero/hero-2.jpg')" }}>
                  <div className="container">
                      <div className="row">
                          <div className="col-lg-6 offset-lg-6">
                              <div className="hi-text">
                                  <span>{t('hero_shape_body', 'Shape your body & transform your life')}</span>
                                  <h1>{t('hero_be_strong', 'Be strong training hard')}</h1>
                                  <div className="hero-btn-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <button 
                                      className="primary-btn" 
                                      onClick={() => openAuthModal('register')}
                                      style={{ border: 'none', cursor: 'pointer' }}
                                    >
                                      {t('join_gymlife_today', 'Join GymLife Today')}
                                    </button>
                                    <Link to="/services" className="primary-btn" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                      {t('our_services', 'Our Services')}
                                    </Link>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/* Hero Section End */}

      {/* ChoseUs Section Begin */}
      <section className="choseus-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>{t('why_choose_us', 'Why choose us?')}</span>
                          <h2>{t('push_your_limits', 'PUSH YOUR LIMITS FORWARD')}</h2>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-034-stationary-bike"></span>
                          <h4>{t('modern_equipment', 'Modern equipment')}</h4>
                          <p>{t('modern_equipment_desc', 'State-of-the-art bio-mechanical workout machines, Olympic barbells, and ergonomic strength training gear.')}</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-033-juice"></span>
                          <h4>{t('healthy_nutrition', 'Healthy nutrition plan')}</h4>
                          <p>{t('healthy_nutrition_desc', 'Custom meal guidance and macro coaching crafted by certified sports nutritionists for peak performance.')}</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-002-dumbell"></span>
                          <h4>{t('pro_training', 'Professional training plan')}</h4>
                          <p>{t('pro_training_desc', 'Structured periodized workout regimens tailored by master trainers to achieve maximum muscle growth and fat loss.')}</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-014-heart-beat"></span>
                          <h4>{t('unique_needs', 'Unique to your needs')}</h4>
                          <p>{t('unique_needs_desc', 'Personalized posture corrections, body composition analysis, and continuous progress tracking.')}</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/* ChoseUs Section End */}

      {/* Classes Section Begin */}
      <section className="classes-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>{t('our_classes', 'Our Classes')}</span>
                          <h2>{t('what_we_offer', 'WHAT WE CAN OFFER')}</h2>
                      </div>
                  </div>
              </div>
              <div className="row">
                  {classes.length > 0 ? (
                      classes.map((c, idx) => (
                          <div className={getClassColClass(idx)} key={c.id}>
                              <div className="class-item">
                                  <div className="ci-pic">
                                      <img src={c.image_url} alt={c.name} />
                                  </div>
                                  <div className="ci-text">
                                      <span>{c.category ? c.category.toUpperCase() : ''}</span>
                                      <h5>{c.name}</h5>
                                      <Link to={`/class-details?id=${c.id}`}><i className="fa fa-angle-right"></i></Link>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-12 text-center text-white">No classes available.</div>
                  )}
              </div>
          </div>
      </section>
      {/* Classes Section End */}

      {/* Banner Section Begin */}
      <section className="banner-section set-bg" data-setbg="/img/banner-bg.jpg" style={{ backgroundImage: "url('/img/banner-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="bs-text">
                          <h2>{t('registration_banner_title', 'REGISTRATION NOW TO GET MORE DEALS')}</h2>
                          <div className="bt-tips">{t('registration_banner_sub', 'Where health, beauty and fitness meet.')}</div>
                          <a href="#appointment-section" className="primary-btn btn-normal">{t('appointment_title', 'Appointment')}</a>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/* Banner Section End */}

      <AppointmentSection />

      {/* Pricing Section Begin */}
      <section className="pricing-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>{t('pricing_title', 'Our Plan')}</span>
                          <h2>{t('choose_pricing', 'Choose your pricing plan')}</h2>
                      </div>
                  </div>
              </div>
              <div className="row justify-content-center">
                  {pricingPlans.length > 0 ? (
                      pricingPlans.map((plan) => (
                          <div className="col-lg-4 col-md-8" key={plan.id}>
                              <div className="ps-item">
                                  <h3>{plan.name}</h3>
                                   <div className="pi-price">
                                       <h2>₹ {isNaN(Number(plan.price)) ? plan.price : Number(plan.price).toLocaleString('en-IN')}</h2>
                                       <span>{plan.period}</span>
                                   </div>
                                  <ul>
                                      {plan.features && plan.features.map((feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                      ))}
                                  </ul>
                                  <button 
                                      className="primary-btn pricing-btn" 
                                      onClick={() => openAuthModal('register')}
                                      style={{ border: 'none', width: '100%', cursor: 'pointer' }}
                                   >
                                      {t('enroll_now', 'Enroll now')}
                                   </button>
                                  <a href="#" className="thumb-icon"><i className="fa fa-picture-o"></i></a>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-12 text-center text-white">No pricing plans available.</div>
                  )}
              </div>
          </div>
      </section>
      {/* Pricing Section End */}

      {/* Gallery Section Begin */}
      <div className="gallery-section">
          <div className="gallery">
              <div className="grid-sizer"></div>
              {gallery.length > 0 ? (
                  gallery.map((item, idx) => (
                      <div className={getGalleryItemClass(idx)} data-setbg={item.image_url} style={{ backgroundImage: `url(${item.image_url})` }} key={item.id}>
                          <a href={item.image_url} className="thumb-icon image-popup" target="_blank" rel="noopener noreferrer"><i className="fa fa-picture-o"></i></a>
                      </div>
                  ))
              ) : (
                  <div className="col-12 text-center text-white">No gallery items available.</div>
              )}
          </div>
      </div>
      {/* Gallery Section End */}

      {/* Team Section Begin */}
      <section className="team-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="team-title">
                          <div className="section-title">
                              <span>{t('trainer_title', 'Our Team')}</span>
                              <h2>{t('trainer_sub', 'TRAIN WITH EXPERTS')}</h2>
                          </div>
                          <a href="#appointment-section" className="primary-btn btn-normal appoinment-btn">{t('appointment_title', 'Appointment')}</a>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="ts-slider owl-carousel" key={`trainers-${language}`}>
                      {trainers.length > 0 ? (
                          trainers.map((trainer) => (
                              <div className="col-lg-4" key={trainer.id}>
                                  <div className="ts-item set-bg" data-setbg={trainer.image_url} style={{ backgroundImage: `url(${trainer.image_url})` }}>
                                      <div className="ts_text">
                                          <h4>{trainer.name}</h4>
                                          <span>{trainer.role}</span>
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="col-lg-12 text-center text-white">No trainers available.</div>
                      )}
                  </div>
              </div>
          </div>
      </section>
      {/* Team Section End */}
    </>
  );
};

export default Index;