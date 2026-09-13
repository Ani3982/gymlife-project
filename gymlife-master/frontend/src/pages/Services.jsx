import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import AppointmentSection from '../components/AppointmentSection';
import ServiceExploreModal from '../components/ServiceExploreModal';
import api from '../utils/api';

const Services = () => {
  const location = useLocation();
  const { t } = useLanguage();
  const { openAuthModal } = useAuth();
  const [services, setServices] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive Explore State
  const [selectedService, setSelectedService] = useState(null);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [bookingService, setBookingService] = useState('');

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

  // Support direct URL query parameter (e.g. /services?explore=1 or /services?service=equipment)
  useEffect(() => {
    if (services.length > 0) {
      const params = new URLSearchParams(location.search);
      const exploreParam = params.get('explore') || params.get('service');
      if (exploreParam) {
        const found = services.find(
          (s, idx) => 
            String(s.id) === exploreParam || 
            String(idx + 1) === exploreParam ||
            s.title.toLowerCase().includes(exploreParam.toLowerCase())
        );
        if (found) {
          const idx = services.indexOf(found);
          setSelectedService({ ...found, image_url: getServiceImage(idx) });
          setIsExploreOpen(true);
        }
      }
    }
  }, [services, location.search]);

  const handleOpenExplore = (service, index) => {
    setSelectedService({ ...service, image_url: getServiceImage(index) });
    setIsExploreOpen(true);
  };

  const handleBookService = (serviceName) => {
    setBookingService(serviceName);
    setIsExploreOpen(false);
    setTimeout(() => {
      const apptEl = document.getElementById('appointment-section');
      if (apptEl) {
        apptEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
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
                <div 
                  className="ss-pic" 
                  onClick={() => handleOpenExplore(chunk[0], chunkIdx * 4)}
                  style={{ cursor: 'pointer' }}
                  title={`Explore ${chunk[0].title}`}
                >
                  <img src={getServiceImage(chunkIdx * 4)} alt={chunk[0].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 2}`}>
                <div className="ss-text">
                  <h4 
                    onClick={() => handleOpenExplore(chunk[0], chunkIdx * 4)} 
                    style={{ cursor: 'pointer' }}
                    title={`Explore ${chunk[0].title}`}
                  >
                    {chunk[0].title}
                  </h4>
                  <p>{chunk[0].description}</p>
                  <a 
                    href={`#explore-${chunk[0].id || 1}`}
                    className="service-explore-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenExplore(chunk[0], chunkIdx * 4);
                    }}
                    id={`explore-btn-${chunk[0].id || 1}`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Explore <i className="fa fa-angle-right"></i>
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Item 2 of chunk */}
          {chunk[1] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 4} order-md-2`}>
                <div className="ss-text">
                  <h4 
                    onClick={() => handleOpenExplore(chunk[1], chunkIdx * 4 + 1)} 
                    style={{ cursor: 'pointer' }}
                    title={`Explore ${chunk[1].title}`}
                  >
                    {chunk[1].title}
                  </h4>
                  <p>{chunk[1].description}</p>
                  <a 
                    href={`#explore-${chunk[1].id || 2}`}
                    className="service-explore-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenExplore(chunk[1], chunkIdx * 4 + 1);
                    }}
                    id={`explore-btn-${chunk[1].id || 2}`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Explore <i className="fa fa-angle-right"></i>
                  </a>
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 3} order-md-1`}>
                <div 
                  className="ss-pic"
                  onClick={() => handleOpenExplore(chunk[1], chunkIdx * 4 + 1)}
                  style={{ cursor: 'pointer' }}
                  title={`Explore ${chunk[1].title}`}
                >
                  <img src={getServiceImage(chunkIdx * 4 + 1)} alt={chunk[1].title} />
                </div>
              </div>
            </>
          )}

          {/* Item 3 of chunk */}
          {chunk[2] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 5}`}>
                <div 
                  className="ss-pic"
                  onClick={() => handleOpenExplore(chunk[2], chunkIdx * 4 + 2)}
                  style={{ cursor: 'pointer' }}
                  title={`Explore ${chunk[2].title}`}
                >
                  <img src={getServiceImage(chunkIdx * 4 + 2)} alt={chunk[2].title} />
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 6}`}>
                <div className="ss-text second-row">
                  <h4 
                    onClick={() => handleOpenExplore(chunk[2], chunkIdx * 4 + 2)} 
                    style={{ cursor: 'pointer' }}
                    title={`Explore ${chunk[2].title}`}
                  >
                    {chunk[2].title}
                  </h4>
                  <p>{chunk[2].description}</p>
                  <a 
                    href={`#explore-${chunk[2].id || 3}`}
                    className="service-explore-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenExplore(chunk[2], chunkIdx * 4 + 2);
                    }}
                    id={`explore-btn-${chunk[2].id || 3}`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Explore <i className="fa fa-angle-right"></i>
                  </a>
                </div>
              </div>
            </>
          )}

          {/* Item 4 of chunk */}
          {chunk[3] && (
            <>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 8} order-md-4`}>
                <div className="ss-text second-row">
                  <h4 
                    onClick={() => handleOpenExplore(chunk[3], chunkIdx * 4 + 3)} 
                    style={{ cursor: 'pointer' }}
                    title={`Explore ${chunk[3].title}`}
                  >
                    {chunk[3].title}
                  </h4>
                  <p>{chunk[3].description}</p>
                  <a 
                    href={`#explore-${chunk[3].id || 4}`}
                    className="service-explore-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenExplore(chunk[3], chunkIdx * 4 + 3);
                    }}
                    id={`explore-btn-${chunk[3].id || 4}`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    Explore <i className="fa fa-angle-right"></i>
                  </a>
                </div>
              </div>
              <div className={`col-lg-3 col-md-6 p-0 order-lg-${base + 7} order-md-3`}>
                <div 
                  className="ss-pic"
                  onClick={() => handleOpenExplore(chunk[3], chunkIdx * 4 + 3)}
                  style={{ cursor: 'pointer' }}
                  title={`Explore ${chunk[3].title}`}
                >
                  <img src={getServiceImage(chunkIdx * 4 + 3)} alt={chunk[3].title} />
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
      {/* Breadcrumb Section Begin */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="breadcrumb-text">
                <h2>{t('services', 'Services')}</h2>
                <div className="bt-option">
                  <Link to="/">{t('home', 'Home')}</Link>
                  <span>{t('services', 'Services')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Breadcrumb Section End */}

      {/* Services Section Begin */}
      <section className="services-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>{t('what_we_offer', 'What We Can Offer')}</span>
                <h2>{t('our_services', 'PUSH YOUR LIMITS FORWARD')}</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid">
          <div className="row">
            {services.length > 0 ? (
              renderServices()
            ) : (
              <div className="col-12 text-center text-white py-5">
                {loading ? 'Loading services...' : 'No services found.'}
              </div>
            )}
          </div>
        </div>
      </section>
      {/* Services Section End */}

      {/* Banner Section Begin */}
      <section className="banner-section set-bg" data-setbg="/img/banner-bg.jpg" style={{ backgroundImage: "url('/img/banner-bg.jpg')" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="bs-text service-banner">
                <h2>{t('exercise_until_body_obeys', 'Exercise until the body obeys.')}</h2>
                <div className="bt-tips">{t('registration_banner_sub', 'Where health, beauty and fitness meet.')}</div>
                <a href="#appointment-section" className="primary-btn btn-normal">{t('appointment_title', 'Appointment')}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Banner Section End */}

      {/* Appointment Section */}
      <AppointmentSection defaultService={bookingService} />

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
                    <h3>{t(plan.name, plan.name)}</h3>
                    <div className="pi-price">
                      <h2>₹ {isNaN(Number(plan.price)) ? plan.price : Number(plan.price).toLocaleString('en-IN')}</h2>
                      <span>{t(plan.period, plan.period)}</span>
                    </div>
                    <ul>
                      {plan.features && plan.features.map((feature, idx) => (
                        <li key={idx}>{t(feature, feature)}</li>
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

      {/* Interactive Service Detail & Exploration Modal */}
      <ServiceExploreModal 
        service={selectedService}
        isOpen={isExploreOpen}
        onClose={() => setIsExploreOpen(false)}
        onBookService={handleBookService}
      />
    </>
  );
};

export default Services;