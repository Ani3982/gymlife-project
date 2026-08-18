import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Data States
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [services, setServices] = useState([]);
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [contactInfo, setContactInfo] = useState({ address: '', phone_numbers: '', email: '', google_map_iframe_url: '' });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'service' | 'class' | 'trainer' | 'plan' | 'blog' | 'gallery'
  const [modalAction, setModalAction] = useState('add'); // 'add' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const storedUsername = localStorage.getItem('adminUsername');
    if (!token) {
      navigate('/admin/login');
    } else {
      setUsername(storedUsername || 'Admin');
      loadAllData();
    }
  }, [navigate]);

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    };
  };

  const loadAllData = () => {
    setLoading(true);
    // Fetch all entities with fallbacks
    Promise.all([
      fetch(`${API_BASE_URL}/api/admin/appointments/`, { headers: getHeaders() }).then(res => res.ok ? res.json() : []).catch(() => []),
      fetch(`${API_BASE_URL}/api/admin/messages/`, { headers: getHeaders() }).then(res => res.ok ? res.json() : []).catch(() => []),
      api.getServices(),
      api.getClasses(),
      api.getTrainers(),
      api.getPricingPlans(),
      fetch(`${API_BASE_URL}/api/blogs/`).then(res => res.ok ? res.json() : []).catch(() => []),
      api.getGallery(),
      api.getContactInfo().catch(() => ({}))
    ]).then(([appts, msgs, servs, clss, trns, plns, blgs, gall, info]) => {
      setAppointments(Array.isArray(appts) ? appts : []);
      setMessages(Array.isArray(msgs) ? msgs : []);
      setServices(Array.isArray(servs) ? servs : []);
      setClasses(Array.isArray(clss) ? clss : []);
      setTrainers(Array.isArray(trns) ? trns : []);
      setPlans(Array.isArray(plns) ? plns : []);
      setBlogs(Array.isArray(blgs) ? blgs : []);
      setGallery(Array.isArray(gall) ? gall : []);
      if (info && info.address) {
        if (Array.isArray(info.phone_numbers)) {
          info.phone_numbers = info.phone_numbers.join(', ');
        }
        setContactInfo(info);
      }
    }).catch(err => {
      console.error("Error loading admin data:", err);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('gymlife_token');
    localStorage.removeItem('gymlife_user');
    navigate('/');
  };

  // General Delete handler
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    let url = '';
    if (type === 'appointment') url = `${API_BASE_URL}/api/admin/appointments/${id}/`;
    else if (type === 'message') url = `${API_BASE_URL}/api/admin/messages/${id}/`;
    else if (type === 'service') url = `${API_BASE_URL}/api/admin/services/${id}/`;
    else if (type === 'class') url = `${API_BASE_URL}/api/admin/classes/${id}/`;
    else if (type === 'trainer') url = `${API_BASE_URL}/api/admin/trainers/${id}/`;
    else if (type === 'plan') url = `${API_BASE_URL}/api/admin/plans/${id}/`;
    else if (type === 'blog') url = `${API_BASE_URL}/api/admin/blogs/${id}/`;
    else if (type === 'gallery') url = `${API_BASE_URL}/api/admin/gallery/${id}/`;

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete item.');
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  // Open Add/Edit Modal
  const openModal = (type, action, item = null) => {
    setModalType(type);
    setModalAction(action);
    setSelectedItem(item);

    if (action === 'edit' && item) {
      // Prepopulate
      if (type === 'service') {
        setFormData({ title: item.title, description: item.description, icon: item.icon, link: item.link, order: item.order || 0 });
      } else if (type === 'trainer') {
        setFormData({ name: item.name, role: item.role, image_url: item.image_url, facebook_url: item.facebook_url || '', twitter_url: item.twitter_url || '', instagram_url: item.instagram_url || '', youtube_url: item.youtube_url || '', order: item.order || 0 });
      } else if (type === 'class') {
        setFormData({ name: item.name, description: item.description, category: item.category, duration: item.duration, image_url: item.image_url, trainer_id: item.trainer ? item.trainer.id : '', order: item.order || 0 });
      } else if (type === 'plan') {
        setFormData({ name: item.name, price: item.price, period: item.period, features: item.features ? item.features.join(',') : '', order: item.order || 0 });
      } else if (type === 'blog') {
        setFormData({ title: item.title, content: item.content, author: item.author, category: item.category, image_url: item.image_url });
      } else if (type === 'gallery') {
        setFormData({ title: item.title || '', image_url: item.image_url || '' });
      }
    } else {
      // Prepopulate empty
      if (type === 'service') setFormData({ title: '', description: '', icon: 'flaticon-002-dumbell', link: '#', order: 0 });
      else if (type === 'trainer') setFormData({ name: '', role: '', image_url: '', facebook_url: '', twitter_url: '', instagram_url: '', youtube_url: '', order: 0 });
      else if (type === 'class') setFormData({ name: '', description: '', category: 'workout', duration: '60 mins', image_url: '', trainer_id: '', order: 0 });
      else if (type === 'plan') setFormData({ name: '', price: '', period: 'month', features: '', order: 0 });
      else if (type === 'blog') setFormData({ title: '', content: '', author: username, category: 'Gym', image_url: '' });
      else if (type === 'gallery') setFormData({ title: '', image_url: '' });
    }
    setShowModal(true);
  };

  // Submit Modal Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let url = '';
    let method = 'POST';

    if (modalAction === 'edit' && selectedItem) {
      method = 'PUT';
      if (modalType === 'service') url = `${API_BASE_URL}/api/admin/services/${selectedItem.id}/`;
      else if (modalType === 'trainer') url = `${API_BASE_URL}/api/admin/trainers/${selectedItem.id}/`;
      else if (modalType === 'class') url = `${API_BASE_URL}/api/admin/classes/${selectedItem.id}/`;
      else if (modalType === 'plan') url = `${API_BASE_URL}/api/admin/plans/${selectedItem.id}/`;
      else if (modalType === 'blog') url = `${API_BASE_URL}/api/admin/blogs/${selectedItem.id}/`;
      else if (modalType === 'gallery') url = `${API_BASE_URL}/api/admin/gallery/${selectedItem.id}/`;
    } else {
      method = 'POST';
      if (modalType === 'service') url = `${API_BASE_URL}/api/admin/services/`;
      else if (modalType === 'trainer') url = `${API_BASE_URL}/api/admin/trainers/`;
      else if (modalType === 'class') url = `${API_BASE_URL}/api/admin/classes/`;
      else if (modalType === 'plan') url = `${API_BASE_URL}/api/admin/plans/`;
      else if (modalType === 'blog') url = `${API_BASE_URL}/api/admin/blogs/`;
      else if (modalType === 'gallery') url = `${API_BASE_URL}/api/admin/gallery/`;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to save item.');
      }
    } catch (err) {
      alert('Error submitting form.');
    }
  };

  // Sidebar link styles
  const getSidebarItemStyle = (tab) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '14px 20px',
    color: activeTab === tab ? '#ffffff' : '#a3a3a3',
    background: activeTab === tab ? 'rgba(243, 97, 0, 0.15)' : 'transparent',
    borderLeft: activeTab === tab ? '4px solid #f36100' : '4px solid transparent',
    fontSize: '15px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '5px'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      display: 'flex',
      fontFamily: '"Oswald", sans-serif'
    }}>
      {/* Sidebar Section */}
      <div style={{
        width: '260px',
        background: '#151515',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '30px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <h3 style={{ textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>
            Gym<span style={{ color: '#f36100' }}>life</span> Control
          </h3>
          <span style={{ fontSize: '12px', color: '#a3a3a3' }}>Welcome, {username}</span>
        </div>

        <div style={{ flex: 1, padding: '20px 0' }}>
          <div style={getSidebarItemStyle('dashboard')} onClick={() => setActiveTab('dashboard')}>
            <i className="fa fa-dashboard" style={{ marginRight: '10px' }}></i> Dashboard
          </div>
          <div style={getSidebarItemStyle('appointments')} onClick={() => setActiveTab('appointments')}>
            <i className="fa fa-calendar" style={{ marginRight: '10px' }}></i> Appointments
          </div>
          <div style={getSidebarItemStyle('messages')} onClick={() => setActiveTab('messages')}>
            <i className="fa fa-envelope" style={{ marginRight: '10px' }}></i> Messages
          </div>
          <div style={getSidebarItemStyle('services')} onClick={() => setActiveTab('services')}>
            <i className="fa fa-cogs" style={{ marginRight: '10px' }}></i> Services
          </div>
          <div style={getSidebarItemStyle('classes')} onClick={() => setActiveTab('classes')}>
            <i className="fa fa-users" style={{ marginRight: '10px' }}></i> Classes
          </div>
          <div style={getSidebarItemStyle('trainers')} onClick={() => setActiveTab('trainers')}>
            <i className="fa fa-user-md" style={{ marginRight: '10px' }}></i> Trainers
          </div>
          <div style={getSidebarItemStyle('plans')} onClick={() => setActiveTab('plans')}>
            <i className="fa fa-usd" style={{ marginRight: '10px' }}></i> Pricing Plans
          </div>
          <div style={getSidebarItemStyle('blogs')} onClick={() => setActiveTab('blogs')}>
            <i className="fa fa-pencil" style={{ marginRight: '10px' }}></i> Blogs
          </div>
          <div style={getSidebarItemStyle('gallery')} onClick={() => setActiveTab('gallery')}>
            <i className="fa fa-picture-o" style={{ marginRight: '10px' }}></i> Gallery
          </div>
          <div style={getSidebarItemStyle('contactInfo')} onClick={() => setActiveTab('contactInfo')}>
            <i className="fa fa-info-circle" style={{ marginRight: '10px' }}></i> Contact Settings
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => navigate('/')} style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
          >
            <i className="fa fa-home"></i> View Website
          </button>
          <button onClick={handleLogout} style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid #f36100',
            color: '#f36100',
            padding: '10px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f36100'; e.currentTarget.style.color = '#ffffff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f36100'; }}
          >
            <i className="fa fa-sign-out"></i> Log Out to Home
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>{activeTab} Management</h2>
          <button onClick={loadAllData} style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            <i className="fa fa-refresh"></i> Refresh Data
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <h3>Loading dashboard data...</h3>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '20px',
                  marginBottom: '40px'
                }}>
                  <div style={{ background: '#151515', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #f36100' }}>
                    <span style={{ color: '#a3a3a3', textTransform: 'uppercase', fontSize: '13px' }}>Total Appointments</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{appointments.length}</h2>
                  </div>
                  <div style={{ background: '#151515', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #00c853' }}>
                    <span style={{ color: '#a3a3a3', textTransform: 'uppercase', fontSize: '13px' }}>Unread Messages</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{messages.length}</h2>
                  </div>
                  <div style={{ background: '#151515', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #00b0ff' }}>
                    <span style={{ color: '#a3a3a3', textTransform: 'uppercase', fontSize: '13px' }}>Our Services</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{services.length}</h2>
                  </div>
                  <div style={{ background: '#151515', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #aa00ff' }}>
                    <span style={{ color: '#a3a3a3', textTransform: 'uppercase', fontSize: '13px' }}>Active Classes</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{classes.length}</h2>
                  </div>
                  <div style={{ background: '#151515', padding: '25px', borderRadius: '8px', borderLeft: '4px solid #ff1744' }}>
                    <span style={{ color: '#a3a3a3', textTransform: 'uppercase', fontSize: '13px' }}>Gallery Items</span>
                    <h2 style={{ fontSize: '36px', margin: '10px 0 0 0', fontWeight: 'bold' }}>{gallery.length}</h2>
                  </div>
                </div>

                <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                  <h4 style={{ textTransform: 'uppercase', marginBottom: '20px', fontWeight: 'bold' }}>Recent Appointments</h4>
                  {appointments.slice(0, 5).length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                            <th style={{ padding: '12px' }}>Client</th>
                            <th style={{ padding: '12px' }}>Service</th>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Phone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.slice(0, 5).map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '12px' }}>{a.name}</td>
                              <td style={{ padding: '12px' }}>{a.service}</td>
                              <td style={{ padding: '12px' }}>{a.appointment_date}</td>
                              <td style={{ padding: '12px' }}>{a.phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>No recent appointments found.</p>
                  )}
                </div>
              </div>
            )}

            {/* 2. APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                {appointments.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                          <th style={{ padding: '12px' }}>Name</th>
                          <th style={{ padding: '12px' }}>Email</th>
                          <th style={{ padding: '12px' }}>Phone</th>
                          <th style={{ padding: '12px' }}>Service</th>
                          <th style={{ padding: '12px' }}>Preferred Date</th>
                          <th style={{ padding: '12px' }}>Notes</th>
                          <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '12px' }}>{a.name}</td>
                            <td style={{ padding: '12px' }}>{a.email}</td>
                            <td style={{ padding: '12px' }}>{a.phone}</td>
                            <td style={{ padding: '12px' }}>{a.service}</td>
                            <td style={{ padding: '12px' }}>{a.appointment_date}</td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#ccc' }}>{a.notes || '-'}</td>
                            <td style={{ padding: '12px' }}>
                              <button onClick={() => handleDelete('appointment', a.id)} style={{
                                background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                              }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No appointments found.</p>
                )}
              </div>
            )}

            {/* 3. MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                {messages.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                          <th style={{ padding: '12px' }}>Name</th>
                          <th style={{ padding: '12px' }}>Email</th>
                          <th style={{ padding: '12px' }}>Website</th>
                          <th style={{ padding: '12px' }}>Message</th>
                          <th style={{ padding: '12px' }}>Date</th>
                          <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messages.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '12px' }}>{m.name}</td>
                            <td style={{ padding: '12px' }}>{m.email}</td>
                            <td style={{ padding: '12px' }}>{m.website || '-'}</td>
                            <td style={{ padding: '12px', fontSize: '13px', color: '#ccc' }}>{m.message}</td>
                            <td style={{ padding: '12px' }}>{m.submitted_at}</td>
                            <td style={{ padding: '12px' }}>
                              <button onClick={() => handleDelete('message', m.id)} style={{
                                background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                              }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No contact messages found.</p>
                )}
              </div>
            )}

            {/* 4. SERVICES TAB */}
            {activeTab === 'services' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('service', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Service</button>
                </div>
                {services.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                        <th style={{ padding: '12px' }}>Title</th>
                        <th style={{ padding: '12px' }}>Icon Class</th>
                        <th style={{ padding: '12px' }}>Description</th>
                        <th style={{ padding: '12px' }}>Order</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.title}</td>
                          <td style={{ padding: '12px' }}><code>{s.icon}</code></td>
                          <td style={{ padding: '12px', fontSize: '13px', color: '#ccc' }}>{s.description}</td>
                          <td style={{ padding: '12px' }}>{s.order || 0}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => openModal('service', 'edit', s)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('service', s.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No services found.</p>
                )}
              </div>
            )}

            {/* 5. CLASSES TAB */}
            {activeTab === 'classes' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('class', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Class</button>
                </div>
                {classes.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                        <th style={{ padding: '12px' }}>Class Name</th>
                        <th style={{ padding: '12px' }}>Category</th>
                        <th style={{ padding: '12px' }}>Trainer</th>
                        <th style={{ padding: '12px' }}>Duration</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                          <td style={{ padding: '12px', textTransform: 'capitalize' }}>{c.category}</td>
                          <td style={{ padding: '12px' }}>{c.trainer ? c.trainer.name : 'Unassigned'}</td>
                          <td style={{ padding: '12px' }}>{c.duration}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => openModal('class', 'edit', c)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('class', c.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No classes found.</p>
                )}
              </div>
            )}

            {/* 6. TRAINERS TAB */}
            {activeTab === 'trainers' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('trainer', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Trainer</button>
                </div>
                {trainers.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                        <th style={{ padding: '12px' }}>Photo</th>
                        <th style={{ padding: '12px' }}>Name</th>
                        <th style={{ padding: '12px' }}>Role</th>
                        <th style={{ padding: '12px' }}>Order</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainers.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px' }}>
                            <img src={t.image_url} alt={t.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          </td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{t.name}</td>
                          <td style={{ padding: '12px' }}>{t.role}</td>
                          <td style={{ padding: '12px' }}>{t.order || 0}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => openModal('trainer', 'edit', t)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('trainer', t.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No trainers found.</p>
                )}
              </div>
            )}

            {/* 7. PRICING PLANS TAB */}
            {activeTab === 'plans' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('plan', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Plan</button>
                </div>
                {plans.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                        <th style={{ padding: '12px' }}>Plan Name</th>
                        <th style={{ padding: '12px' }}>Price</th>
                        <th style={{ padding: '12px' }}>Period</th>
                        <th style={{ padding: '12px' }}>Features</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                          <td style={{ padding: '12px' }}>${p.price}</td>
                          <td style={{ padding: '12px' }}>{p.period}</td>
                          <td style={{ padding: '12px', fontSize: '13px', color: '#ccc' }}>{p.features ? p.features.join(', ') : ''}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => openModal('plan', 'edit', p)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('plan', p.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No pricing plans found.</p>
                )}
              </div>
            )}

            {/* 8. BLOGS TAB */}
            {activeTab === 'blogs' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('blog', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Post</button>
                </div>
                {blogs.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a3a3a3' }}>
                        <th style={{ padding: '12px' }}>Title</th>
                        <th style={{ padding: '12px' }}>Author</th>
                        <th style={{ padding: '12px' }}>Category</th>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(b => (
                        <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{b.title}</td>
                          <td style={{ padding: '12px' }}>{b.author}</td>
                          <td style={{ padding: '12px' }}>{b.category}</td>
                          <td style={{ padding: '12px' }}>{b.created_at}</td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => openModal('blog', 'edit', b)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('blog', b.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
                            }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No blog posts found.</p>
                )}
              </div>
            )}

            {/* 9. GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => openModal('gallery', 'add')} style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Add Gallery Item</button>
                </div>
                {gallery.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                  }}>
                    {gallery.map(item => (
                      <div key={item.id} style={{ background: '#222', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={item.image_url} alt={item.title || 'Gallery'} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                        <div style={{ padding: '15px' }}>
                          <h5 style={{ margin: '0 0 10px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title || 'Untitled'}</h5>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button onClick={() => openModal('gallery', 'edit', item)} style={{
                              background: '#00b0ff', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                            }}>Edit</button>
                            <button onClick={() => handleDelete('gallery', item.id)} style={{
                              background: '#dc3545', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                            }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No gallery items found.</p>
                )}
              </div>
            )}

            {/* 10. CONTACT SETTINGS TAB */}
            {activeTab === 'contactInfo' && (
              <div style={{ background: '#151515', padding: '30px', borderRadius: '8px', maxWidth: '600px' }}>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch(`${API_BASE_URL}/api/admin/contact-info/`, {
                      method: 'PUT',
                      headers: getHeaders(),
                      body: JSON.stringify(contactInfo)
                    });
                    if (res.ok) {
                      alert('Contact settings updated successfully.');
                      loadAllData();
                    } else {
                      alert('Failed to update contact settings.');
                    }
                  } catch (err) {
                    alert('Error updating contact settings.');
                  }
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '14px' }}>Address</label>
                    <input type="text" value={contactInfo.address || ''} onChange={e => setContactInfo({ ...contactInfo, address: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '14px' }}>Phone Numbers (comma-separated)</label>
                    <input type="text" value={contactInfo.phone_numbers || ''} onChange={e => setContactInfo({ ...contactInfo, phone_numbers: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '14px' }}>Email</label>
                    <input type="email" value={contactInfo.email || ''} onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '14px' }}>Google Map Embed Iframe URL</label>
                    <textarea rows="4" value={contactInfo.google_map_iframe_url || ''} onChange={e => setContactInfo({ ...contactInfo, google_map_iframe_url: e.target.value })} style={textareaStyle}></textarea>
                  </div>
                  <button type="submit" style={{
                    background: '#f36100', color: '#fff', border: 'none', padding: '12px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                  }}>Save Settings</button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* CRUD Overlay Form Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#151515',
            width: '100%',
            maxWidth: '550px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '30px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, textTransform: 'uppercase', fontWeight: 'bold' }}>
                {modalAction === 'edit' ? 'Edit' : 'Add New'} {modalType}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'transparent', border: 'none', color: '#a3a3a3', fontSize: '20px', cursor: 'pointer'
              }}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* SERVICE FORM FIELDS */}
              {modalType === 'service' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Title</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Description</label>
                    <textarea rows="4" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required style={textareaStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Icon Class</label>
                    <input type="text" value={formData.icon || ''} onChange={e => setFormData({ ...formData, icon: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Order (optional)</label>
                    <input type="number" value={formData.order || 0} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} style={inputStyle} />
                  </div>
                </>
              )}

              {/* TRAINER FORM FIELDS */}
              {modalType === 'trainer' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Full Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Role / Specialization</label>
                    <input type="text" value={formData.role || ''} onChange={e => setFormData({ ...formData, role: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Image URL</label>
                    <input type="text" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Facebook URL (optional)</label>
                    <input type="text" value={formData.facebook_url || ''} onChange={e => setFormData({ ...formData, facebook_url: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Twitter URL (optional)</label>
                    <input type="text" value={formData.twitter_url || ''} onChange={e => setFormData({ ...formData, twitter_url: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Instagram URL (optional)</label>
                    <input type="text" value={formData.instagram_url || ''} onChange={e => setFormData({ ...formData, instagram_url: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Youtube URL (optional)</label>
                    <input type="text" value={formData.youtube_url || ''} onChange={e => setFormData({ ...formData, youtube_url: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Order (optional)</label>
                    <input type="number" value={formData.order || 0} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} style={inputStyle} />
                  </div>
                </>
              )}

              {/* CLASS FORM FIELDS */}
              {modalType === 'class' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Class Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Description</label>
                    <textarea rows="3" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required style={textareaStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Category</label>
                    <select value={formData.category || 'workout'} onChange={e => setFormData({ ...formData, category: e.target.value })} style={selectStyle}>
                      <option value="workout">Workout</option>
                      <option value="fitness">Fitness tips</option>
                      <option value="motivation">Motivation</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Duration (e.g. 60 mins)</label>
                    <input type="text" value={formData.duration || ''} onChange={e => setFormData({ ...formData, duration: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Image URL</label>
                    <input type="text" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Assigned Trainer</label>
                    <select value={formData.trainer_id || ''} onChange={e => setFormData({ ...formData, trainer_id: e.target.value })} style={selectStyle}>
                      <option value="">-- Select Trainer --</option>
                      {trainers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Order (optional)</label>
                    <input type="number" value={formData.order || 0} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} style={inputStyle} />
                  </div>
                </>
              )}

              {/* PLAN FORM FIELDS */}
              {modalType === 'plan' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Plan Name</label>
                    <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Price ($)</label>
                    <input type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Billing Period (e.g. month, year)</label>
                    <input type="text" value={formData.period || 'month'} onChange={e => setFormData({ ...formData, period: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Features (comma-separated list)</label>
                    <input type="text" placeholder="e.g. Personal trainer, Free WiFi, No contract" value={formData.features || ''} onChange={e => setFormData({ ...formData, features: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Order (optional)</label>
                    <input type="number" value={formData.order || 0} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })} style={inputStyle} />
                  </div>
                </>
              )}

              {/* BLOG POST FORM FIELDS */}
              {modalType === 'blog' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Title</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Content</label>
                    <textarea rows="6" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} required style={textareaStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Author</label>
                    <input type="text" value={formData.author || ''} onChange={e => setFormData({ ...formData, author: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Category</label>
                    <input type="text" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} required style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Image URL</label>
                    <input type="text" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} required style={inputStyle} />
                  </div>
                </>
              )}

              {/* GALLERY ITEM FORM FIELDS */}
              {modalType === 'gallery' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Title (optional)</label>
                    <input type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#c4c4c4', fontSize: '13px' }}>Image URL</label>
                    <input type="text" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} required style={inputStyle} />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  background: '#f36100', color: '#fff', border: 'none', padding: '10px 25px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Vanilla form styling properties
const inputStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px 12px',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none'
};

const textareaStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px 12px',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  resize: 'vertical',
  fontFamily: 'inherit'
};

const selectStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '10px 12px',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none'
};

export default AdminDashboard;
