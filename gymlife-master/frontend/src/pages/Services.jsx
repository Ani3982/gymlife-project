import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesData, plansData] = await Promise.all([
          api.getServices(),
          api.getPricingPlans(),
        ]);

        setServices(Array.isArray(servicesData) ? servicesData : []);
        setPricingPlans(Array.isArray(plansData) ? plansData : []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getServiceImage = (index) => {
    const defaultImages = [
      '/img/services/services-1.jpg',
      '/img/services/services-2.jpg',
      '/img/services/services-4.jpg',
      '/img/services/services-3.jpg'
    ];
    return defaultImages[index % 4];
  };

  const renderServices = () => {
    const chunks = [];
    for (let i = 0; i < services.length; i += 4) {
      chunks.push(services.slice(i, i + 4));
    }

    return chunks.map((chunk, chunkIdx) => {
      const base = chunkIdx * 8;
      return (
        <React.Fragment key={chunkIdx}>
          {/* Item 1 of chunk */}
          {chunk[0] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 1}`}>
                <div className="ss-pic">
                  <img src={getServiceImage(chunkIdx * 4)} alt={chunk[0].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 2}`}>
                <div className="ss-text">
                  <h4>{chunk[0].title}</h4>
                  <p>{chunk[0].description}</p>
                  <Link to={chunk[0].link || "#"}>Explore</Link>
                </div>
              </div>
            </>
          )}

          {/* Item 2 of chunk */}
          {chunk[1] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 3}`}>
                <div className="ss-pic">
                  <img src={getServiceImage(chunkIdx * 4 + 1)} alt={chunk[1].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 4}`}>
                <div className="ss-text">
                  <h4>{chunk[1].title}</h4>
                  <p>{chunk[1].description}</p>
                  <Link to={chunk[1].link || "#"}>Explore</Link>
                </div>
              </div>
            </>
          )}

          {/* Item 3 of chunk */}
          {chunk[2] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 8}`}>
                <div className="ss-pic">
                  <img src={getServiceImage(chunkIdx * 4 + 2)} alt={chunk[2].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 7}`}>
                <div className="ss-text second-row">
                  <h4>{chunk[2].title}</h4>
                  <p>{chunk[2].description}</p>
                  <Link to={chunk[2].link || "#"}>Explore</Link>
                </div>
              </div>
            </>
          )}

          {/* Item 4 of chunk */}
          {chunk[3] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 6}`}>
                <div className="ss-pic">
                  <img src={getServiceImage(chunkIdx * 4 + 3)} alt={chunk[3].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 5}`}>
                <div className="ss-text second-row">
                  <h4>{chunk[3].title}</h4>
                  <p>{chunk[3].description}</p>
                  <Link to={chunk[3].link || "#"}>Explore</Link>
                </div>
              </div>
            </>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Services</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <span>Services</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Services Section Begin  */}
      <section className="services-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="section-title">
                          <span>What we do?</span>
                          <h2>PUSH YOUR LIMITS FORWARD</h2>
                      </div>
                  </div>
              </div>
              <div className="row">
                  {services.length > 0 ? (
                      renderServices()
                  ) : (
                      <div className="col-12 text-center text-white">No services available.</div>
                  )}
              </div>
          </div>
      </section>
      {/*  Services Section End  */}

      {/*  Banner Section Begin  */}
      <section className="banner-section set-bg" data-setbg="/img/banner-bg.jpg">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="bs-text service-banner">
                          <h2>Exercise until the body obeys.</h2>
                          <div className="bt-tips">Where health, beauty and fitness meet.</div>
                          <a href="https://www.youtube.com/watch?v=EzKkl64rRbM" className="play-btn video-popup"><i
                                  className="fa fa-caret-right"></i></a>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Banner Section End  */}

      {/*  Pricing Section Begin  */}
      <section className="pricing-section service-pricing spad">
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
    </>
  );
};

export default Services;
