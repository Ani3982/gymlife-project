import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AppointmentSection = () => {
    const [servicesList, setServicesList] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: 'Weightlifting',
        appointment_date: '',
        notes: ''
    });
    
    const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getServices()
            .then(data => {
                setServicesList(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, service: data[0].title }));
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
            const data = await api.createAppointment(formData);
            setStatus('success');
            setMessage('Your appointment has been booked successfully!');
            setFormData({
                name: '',
                email: '',
                phone: '',
                service: 'Weightlifting',
                appointment_date: '',
                notes: ''
            });
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <section className="appointment-section spad" id="appointment-section">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-title text-center">
                            <span>Get Started</span>
                            <h2>BOOK YOUR APPOINTMENT</h2>
                        </div>
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="appointment-form-wrapper" style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '40px',
                            borderRadius: '10px',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {status === 'success' && (
                                <div className="alert alert-success text-center" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none' }}>
                                    {message}
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="alert alert-danger text-center" style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none' }}>
                                    {message}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit} className="appointment-form">
                                <div className="row">
                                    <div className="col-md-6 mb-4">
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your Name" 
                                            required 
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Your Email" 
                                            required 
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <input 
                                            type="tel" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Phone Number" 
                                            required 
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <select 
                                            name="service"
                                            value={formData.service}
                                            onChange={handleChange}
                                            style={inputStyle}
                                        >
                                            {servicesList.length > 0 ? (
                                                servicesList.map(s => (
                                                    <option key={s.id} value={s.title}>{s.title}</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="Weightlifting">Weightlifting</option>
                                                    <option value="Cardio">Cardio</option>
                                                    <option value="Yoga">Yoga</option>
                                                    <option value="Personal Training">Personal Training</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div className="col-md-12 mb-4">
                                        <input 
                                            type="datetime-local" 
                                            name="appointment_date"
                                            value={formData.appointment_date}
                                            onChange={handleChange}
                                            required 
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div className="col-md-12 mb-4">
                                        <textarea 
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Additional Notes"
                                            style={{...inputStyle, height: '120px', resize: 'none'}}
                                        ></textarea>
                                    </div>
                                    <div className="col-md-12 text-center">
                                        <button 
                                            type="submit" 
                                            className="primary-btn"
                                            disabled={status === 'submitting'}
                                            style={{
                                                background: '#f36100',
                                                border: 'none',
                                                padding: '14px 40px',
                                                color: '#fff',
                                                textTransform: 'uppercase',
                                                fontWeight: '700',
                                                letterSpacing: '2px',
                                                cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {status === 'submitting' ? 'Submitting...' : 'Book Now'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const inputStyle = {
    width: '100%',
    height: '50px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '0 20px',
    color: '#c4c4c4',
    borderRadius: '5px',
    outline: 'none',
    transition: 'all 0.3s'
};

export default AppointmentSection;
