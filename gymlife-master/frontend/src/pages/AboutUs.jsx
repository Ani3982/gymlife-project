import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const AboutUs = () => {
  const { t } = useLanguage();
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    api.getTrainers()
      .then(data => setTrainers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let $ts_slider = null;
    const $ = window.jQuery;

    if ($) {
      // Background Set
      $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        if (bg) {
          $(this).css('background-image', 'url(' + bg + ')');
        }
      });

      // Testimonial Slider
      if ($.fn.owlCarousel) {
        $ts_slider = $(".ts_slider");
        if ($ts_slider.length > 0) {
          if ($ts_slider.data('owl.carousel')) {
            $ts_slider.owlCarousel('destroy');
          }
          $ts_slider.owlCarousel({
            loop: true,
            margin: 0,
            items: 1,
            dots: false,
            nav: true,
            navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
            smartSpeed: 1200,
            autoHeight: false,
            autoplay: true
          });
        }
      }

      // Barfillers
      if ($.fn.barfiller) {
        $('#bar1').barfiller({ barColor: '#ffffff', duration: 2000 });
        $('#bar2').barfiller({ barColor: '#ffffff', duration: 2000 });
        $('#bar3').barfiller({ barColor: '#ffffff', duration: 2000 });
      }
    }

    return () => {
      if ($) {
        if ($ts_slider && $ts_slider.data('owl.carousel')) {
          $ts_slider.owlCarousel('destroy');
        }
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

  return (
    <>
    {/* Breadcrumb Section Begin */}
    <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
        <div className="container">
            <div className="row">
                <div className="col-lg-12 text-center">
                    <div className="breadcrumb-text">
                        <h2>{t('about_us', 'About Us')}</h2>
                        <div className="bt-option">
                            <Link to="/">{t('home', 'Home')}</Link>
                            <span>{t('about_us', 'About Us')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/* Breadcrumb Section End */}

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

    {/* About US Section Begin */}
    <section className="aboutus-section">
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-6 p-0">
                    <div className="about-video set-bg" data-setbg="/img/about-us.jpg" style={{ backgroundImage: "url('/img/about-us.jpg')" }}>
                        <a href="https://www.youtube.com/watch?v=EzKkl64rRbM" className="play-btn video-popup"><i
                                className="fa fa-caret-right"></i></a>
                    </div>
                </div>
                <div className="col-lg-6 p-0">
                    <div className="about-text">
                        <div className="section-title">
                            <span>{t('about_us', 'About Us')}</span>
                            <h2>What we have done</h2>
                        </div>
                        <div className="at-desc">
                            <p>GymLife is dedicated to excellence in functional movement, athletic strength, and cardiovascular health. We empower every individual with expert coaching and world-class equipment.</p>
                        </div>
                         <div className="about-bar">
                            <div className="ab-item">
                                <p>Bodybuilding & Strength</p>
                                <div id="bar1" className="barfiller" dangerouslySetInnerHTML={{
                                    __html: '<span class="fill" data-percentage="80"></span><div class="tipWrap"><span class="tip"></span></div>'
                                }}></div>
                            </div>
                            <div className="ab-item">
                                <p>Cardio & HIIT Training</p>
                                <div id="bar2" className="barfiller" dangerouslySetInnerHTML={{
                                    __html: '<span class="fill" data-percentage="85"></span><div class="tipWrap"><span class="tip"></span></div>'
                                }}></div>
                            </div>
                            <div className="ab-item">
                                <p>Yoga & Flexibility</p>
                                <div id="bar3" className="barfiller" dangerouslySetInnerHTML={{
                                    __html: '<span class="fill" data-percentage="75"></span><div class="tipWrap"><span class="tip"></span></div>'
                                }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/* About US Section End */}

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
                        <Link to="/#appointment-section" className="primary-btn btn-normal appoinment-btn">{t('appointment_title', 'Appointment')}</Link>
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
    {/* Team Section End */}
    </>
  );
};

export default AboutUs;