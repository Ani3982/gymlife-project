import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const AboutUs = () => {
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
      
    

    {/*  Breadcrumb Section Begin  */}
    <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg">
        <div className="container">
            <div className="row">
                <div className="col-lg-12 text-center">
                    <div className="breadcrumb-text">
                        <h2>About us</h2>
                        <div className="bt-option">
                            <Link to="/">Home</Link>
                            <span>About</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Breadcrumb Section End  */}

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

    {/*  About US Section Begin  */}
    <section className="aboutus-section">
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-6 p-0">
                    <div className="about-video set-bg" data-setbg="/img/about-us.jpg">
                        <a href="https://www.youtube.com/watch?v=EzKkl64rRbM" className="play-btn video-popup"><i
                                className="fa fa-caret-right"></i></a>
                    </div>
                </div>
                <div className="col-lg-6 p-0">
                    <div className="about-text">
                        <div className="section-title">
                            <span>About Us</span>
                            <h2>What we have done</h2>
                        </div>
                        <div className="at-desc">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                                ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo
                                viverra maecenas accumsan lacus vel facilisis. aliquip ex ea commodo consequat sit amet,
                                consectetur adipiscing elit, sed do eiusmod tempor.</p>
                        </div>
                         <div className="about-bar">
                            <div className="ab-item">
                                <p>Body building</p>
                                <div id="bar1" className="barfiller" dangerouslySetInnerHTML={{
                                    __html: '<span class="fill" data-percentage="80"></span><div class="tipWrap"><span class="tip"></span></div>'
                                }}></div>
                            </div>
                            <div className="ab-item">
                                <p>Training</p>
                                <div id="bar2" className="barfiller" dangerouslySetInnerHTML={{
                                    __html: '<span class="fill" data-percentage="85"></span><div class="tipWrap"><span class="tip"></span></div>'
                                }}></div>
                            </div>
                            <div className="ab-item">
                                <p>Fitness</p>
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
    {/*  About US Section End  */}

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
                        <a href="#" className="primary-btn btn-normal appoinment-btn">appointment</a>
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

    {/*  Banner Section Begin  */}
    <section className="banner-section set-bg" data-setbg="/img/banner-bg.jpg">
        <div className="container">
            <div className="row">
                <div className="col-lg-12 text-center">
                    <div className="bs-text">
                        <h2>registration now to get more deals</h2>
                        <div className="bt-tips">Where health, beauty and fitness meet.</div>
                        <a href="#" className="primary-btn  btn-normal">Appointment</a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Banner Section End  */}

    {/*  Testimonial Section Begin  */}
    <section className="testimonial-section spad">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="section-title">
                        <span>Testimonial</span>
                        <h2>Our cilent say</h2>
                    </div>
                </div>
            </div>
            <div className="ts_slider owl-carousel">
                <div className="ts_item">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="ti_pic">
                                <img src="/img/testimonial/testimonial-1.jpg" alt="" />
                            </div>
                            <div className="ti_text">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt<br /> ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                                    gravida. Risus commodo<br /> viverra maecenas accumsan lacus vel facilisis.</p>
                                <h5>Marshmello Gomez</h5>
                                <div className="tt-rating">
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ts_item">
                    <div className="row">
                        <div className="col-lg-12 text-center">
                            <div className="ti_pic">
                                <img src="/img/testimonial/testimonial-2.jpg" alt="" />
                            </div>
                            <div className="ti_text">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                                    incididunt<br /> ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
                                    gravida. Risus commodo<br /> viverra maecenas accumsan lacus vel facilisis.</p>
                                <h5>Marshmello Gomez</h5>
                                <div className="tt-rating">
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Testimonial Section End  */}

    </>
  );
};

export default AboutUs;
