import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const getIframeSrc = (urlOrIframe) => {
  if (!urlOrIframe) return '';
  if (urlOrIframe.includes('<iframe')) {
    const match = urlOrIframe.match(/src=["']([^"']+)["']/);
    return match ? match[1] : '';
  }
  return urlOrIframe;
};

const Contact = () => {
  const [contactInfo, setContactInfo] = useState({
    address: '333 Middle Winchendon Rd, Rindge, NH 03461',
    phone_numbers: ['125-711-811', '125-668-886'],
    email: 'Support.gymcenter@gmail.com',
    google_map_iframe_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12087.06990446927!2d-76.29433155!3d40.7686022!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c5f6e539f1ff4f%3A0xe54d241775a28a2a!2sRindge%2C%20NH%2003461%2C%20USA!5e0!3m2!1sen!2s!4v1622560341852!5m2!1sen!2s'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    api.getContactInfo()
      .then(data => {
        if (data && data.id) {
          setContactInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const data = await api.createContactMessage(formData);
      if (data && data.status === 'success') {
        setStatus('success');
        setStatusMsg('Your message has been sent successfully!');
        setFormData({ name: '', email: '', website: '', message: '' });
      } else {
        setStatus('error');
        setStatusMsg('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMsg('Network error. Please try again.');
    }
  };

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Contact Us</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <span>Contact us</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Contact Section Begin  */}
      <section className="contact-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-6">
                      <div className="section-title contact-title">
                          <span>Contact Us</span>
                          <h2>GET IN TOUCH</h2>
                      </div>
                      <div className="contact-widget">
                          <div className="cw-text">
                              <i className="fa fa-map-marker"></i>
                              <p>{contactInfo.address}</p>
                          </div>
                          <div className="cw-text">
                              <i className="fa fa-mobile"></i>
                              <ul>
                                  {contactInfo.phone_numbers && contactInfo.phone_numbers.map((phone, idx) => (
                                      <li key={idx}>{phone}</li>
                                  ))}
                              </ul>
                          </div>
                          <div className="cw-text email">
                              <i className="fa fa-envelope"></i>
                              <p>{contactInfo.email}</p>
                          </div>
                      </div>
                  </div>
                  <div className="col-lg-6">
                      <div className="leave-comment">
                          {status === 'success' && (
                              <div className="alert alert-success text-center" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
                                  {statusMsg}
                              </div>
                          )}
                          {status === 'error' && (
                              <div className="alert alert-danger text-center" style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
                                  {statusMsg}
                              </div>
                          )}
                          <form onSubmit={handleSubmit}>
                              <input 
                                  type="text" 
                                  name="name" 
                                  value={formData.name} 
                                  onChange={handleChange} 
                                  placeholder="Name" 
                                  required 
                              />
                              <input 
                                  type="email" 
                                  name="email" 
                                  value={formData.email} 
                                  onChange={handleChange} 
                                  placeholder="Email" 
                                  required 
                              />
                              <input 
                                  type="text" 
                                  name="website" 
                                  value={formData.website} 
                                  onChange={handleChange} 
                                  placeholder="Website" 
                              />
                              <textarea 
                                  name="message" 
                                  value={formData.message} 
                                  onChange={handleChange} 
                                  placeholder="Message" 
                                  required
                              ></textarea>
                              <button type="submit" disabled={status === 'submitting'}>
                                  {status === 'submitting' ? 'Submitting...' : 'Submit'}
                              </button>
                          </form>
                      </div>
                  </div>
              </div>
              <div className="map">
                  <iframe
                      src={getIframeSrc(contactInfo.google_map_iframe_url)}
                      height="550" style={{ border: 0 }} allowFullScreen title="location-map"></iframe>
              </div>
          </div>
      </section>
      {/*  Contact Section End  */}
    </>
  );
};

export default Contact;
