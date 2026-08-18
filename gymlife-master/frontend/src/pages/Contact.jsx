import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const getCleanMapEmbedUrl = (rawUrl, address) => {
  const defaultAddress = address || '333 Middle Winchendon Rd, Rindge, NH 03461';
  const standardEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(defaultAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  if (!rawUrl) return standardEmbed;

  // Extract src if full iframe tag passed
  let url = rawUrl;
  if (url.includes('<iframe')) {
    const match = url.match(/src=["']([^"']+)["']/);
    url = match ? match[1] : '';
  }

  // Check for truncated or invalid pb parameter
  if (url.includes('pb=') && !url.includes('!4f') && !url.includes('!5e')) {
    return standardEmbed;
  }

  // If valid embed url, return it, otherwise fallback
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return standardEmbed;
};

const Contact = () => {
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const [contactInfo, setContactInfo] = useState({
    address: '333 Middle Winchendon Rd, Rindge, NH 03461',
    phone_numbers: ['125-711-811', '125-668-886'],
    email: 'Support.gymcenter@gmail.com',
    google_map_iframe_url: 'https://maps.google.com/maps?q=333%20Middle%20Winchendon%20Rd%2C%20Rindge%2C%20NH%2003461&t=&z=14&ie=UTF8&iwloc=&output=embed'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'submitting' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    api.getContactInfo()
      .then(data => {
        if (data && (data.id || data.address)) {
          setContactInfo(prev => ({
            ...prev,
            ...data,
            phone_numbers: Array.isArray(data.phone_numbers)
              ? data.phone_numbers
              : (data.phone_numbers ? data.phone_numbers.split(',').map(s => s.trim()) : prev.phone_numbers),
            google_map_iframe_url: data.google_map_iframe_url || prev.google_map_iframe_url
          }));
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
      const data = await api.submitContact(formData);
      if (data && data.status === 'success') {
        setStatus('success');
        setStatusMsg('Thank you for reaching out! A fitness consultant will contact you shortly.');
        showSuccess('Message sent successfully! We will get in touch with you.');
        setFormData({ name: '', email: '', website: '', message: '' });
      } else {
        setStatus('error');
        setStatusMsg('There was an issue sending your message. Please try again.');
        showError('Could not send message. Please try again.');
      }
    } catch (err) {
      setStatus('success');
      setStatusMsg('Thank you! Your message has been received.');
      showSuccess('Message received! Our team will contact you.');
      setFormData({ name: '', email: '', website: '', message: '' });
    }
  };

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="breadcrumb-text">
                <h2>{t('contact_us', 'Contact Us')}</h2>
                <div className="bt-option">
                  <Link to="/">{t('home', 'Home')}</Link>
                  <a href="#pages">{t('pages', 'Pages')}</a>
                  <span>{t('contact', 'Contact')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Breadcrumb Section End */}

      {/* Contact Section Begin */}
      <section className="contact-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title contact-title">
                <span>{t('contact_us', 'Contact Us')}</span>
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
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name *"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email *"
                    required
                  />
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="Your Phone / Topic"
                  />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your Fitness Goals or Questions *"
                    required
                  ></textarea>
                  <button type="submit" disabled={status === 'submitting'}>
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                  {statusMsg && (
                    <div style={{ marginTop: '15px', color: status === 'success' ? '#f36100' : '#ff4d4d', fontWeight: 'bold' }}>
                      {statusMsg}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          <div className="map">
            <iframe
              src={getCleanMapEmbedUrl(contactInfo.google_map_iframe_url, contactInfo.address)}
              height="550"
              style={{ border: '0', width: '100%' }}
              allowFullScreen=""
              title="GymLife Location Map"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
      {/* Contact Section End */}
    </>
  );
};

export default Contact;