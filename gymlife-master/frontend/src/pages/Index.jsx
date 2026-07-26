import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentSection from '../components/AppointmentSection';
import api from '../utils/api';

const Index = () => {
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

  useEffect(() => {
    let $slider = null;
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
    return () => {
      if ($slider && $slider.data('owl.carousel')) {
        $slider.owlCarousel('destroy');
      }
    };
  }, []);

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
  }, [trainers]);

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
      {/*  Hero Section Begin  */}
      <section className="hero-section">
          <div className="hs-slider owl-carousel">
              <div className="hs-item set-bg" data-setbg="/img/hero/hero-1.jpg" style={{ backgroundImage: "url('/img/hero/hero-1.jpg')" }}>
                  <div className="container">
                      <div className="row">
                          <div className="col-lg-6 offset-lg-6">
                              <div className="hi-text">
                                  <span>Shape your body</span>
                                  <h1>Be <strong>strong</strong> traning hard</h1>
                                  <a href="#" className="primary-btn">Get info</a>
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
                                  <span>Shape your body</span>
                                  <h1>Be <strong>strong</strong> traning hard</h1>
                                  <a href="#" className="primary-btn">Get info</a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Hero Section End  */}

      {/*  ChoseUs Section Begin  */}
      <section className="choseus-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>Why chose us?</span>
                          <h2>PUSH YOUR LIMITS FORWARD</h2>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-034-stationary-bike"></span>
                          <h4>Modern equipment</h4>
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                              dolore facilisis.</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-033-juice"></span>
                          <h4>Healthy nutrition plan</h4>
                          <p>Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel
                              facilisis.</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-002-dumbell"></span>
                          <h4>Proffesponal training plan</h4>
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                              dolore facilisis.</p>
                      </div>
                  </div>
                  <div className="col-lg-3 col-sm-6">
                      <div className="cs-item">
                          <span className="flaticon-014-heart-beat"></span>
                          <h4>Unique to your needs</h4>
                          <p>Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel
                              facilisis.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  ChoseUs Section End  */}

      {/*  Classes Section Begin  */}
      <section className="classes-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>Our Classes</span>
                          <h2>WHAT WE CAN OFFER</h2>
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
      {/*  Classes Section End  */}

      {/*  Banner Section Begin  */}
      <section className="banner-section set-bg" data-setbg="/img/banner-bg.jpg" style={{ backgroundImage: "url('/img/banner-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="bs-text">
                          <h2>registration now to get more deals</h2>
                          <div className="bt-tips">Where health, beauty and fitness meet.</div>
                          <a href="#appointment-section" className="primary-btn  btn-normal">Appointment</a>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Banner Section End  */}

      <AppointmentSection />

      {/*  Pricing Section Begin  */}
      <section className="pricing-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>Our Plan</span>
                          <h2>Choose your pricing plan</h2>
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
                                      <h2>$ {plan.price}</h2>
                                      <span>{plan.period}</span>
                                  </div>
                                  <ul>
                                      {plan.features && plan.features.map((feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                      ))}
                                  </ul>
                                  <a href="#" className="primary-btn pricing-btn">Enroll now</a>
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
      {/*  Pricing Section End  */}

      {/*  Gallery Section Begin  */}
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
      {/*  Gallery Section End  */}

      {/*  Team Section Begin  */}
      <section className="team-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="team-title">
                          <div className="section-title">
                              <span>Our Team</span>
                              <h2>TRAIN WITH EXPERTS</h2>
                          </div>
                          <a href="#appointment-section" className="primary-btn btn-normal appoinment-btn">appointment</a>
                      </div>
                  </div>
              </div>
              <div className="row">
                  <div className="ts-slider owl-carousel">
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
      {/*  Team Section End  */}
    </>
  );
};

export default Index;
