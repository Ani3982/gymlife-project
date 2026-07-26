import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section 
      className="section-title spad" 
      style={{ 
        minHeight: '70vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#151515', 
        color: '#fff',
        padding: '80px 20px',
        textAlign: 'center'
      }}
    >
      <div className="container">
        <span 
          style={{ 
            fontSize: '120px', 
            color: '#f36100', 
            fontWeight: '900', 
            lineHeight: '1', 
            display: 'block', 
            letterSpacing: '5px',
            textShadow: '0 4px 20px rgba(243, 97, 0, 0.3)'
          }}
        >
          404
        </span>
        <h2 
          style={{ 
            color: '#fff', 
            marginTop: '20px', 
            fontSize: '36px', 
            fontWeight: '800', 
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Page Not Found
        </h2>
        <p 
          style={{ 
            maxWidth: '600px', 
            margin: '20px auto 35px', 
            color: '#c4c4c4', 
            fontSize: '16px',
            lineHeight: '1.6'
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to your workout routine!
        </p>
        <Link 
          to="/" 
          className="primary-btn" 
          style={{ 
            display: 'inline-block',
            padding: '14px 30px',
            background: '#f36100',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            border: 'none',
            borderRadius: '0',
            transition: 'background 0.3s'
          }}
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
