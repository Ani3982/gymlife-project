import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SEARCHABLE_PAGES = [
  { title: 'Home', path: '/', category: 'Page', desc: 'Welcome page of GymLife fitness center.' },
  { title: 'About Us', path: '/about-us', category: 'Page', desc: 'Learn about our gym, story, and values.' },
  { title: 'Classes & Offerings', path: '/class-details', category: 'Classes', desc: 'Weightlifting, indoor cycling, Kettlebell, boxing, and training.' },
  { title: 'Classes Timetable', path: '/class-timetable', category: 'Classes', desc: 'Weekly schedule and hours for fitness classes.' },
  { title: 'Services', path: '/services', category: 'Services', desc: 'Our personal training plans, healthy nutrition, and modern equipment.' },
  { title: 'Our Team & Trainers', path: '/team', category: 'Team', desc: 'Train with our expert coaches and personal fitness trainers.' },
  { title: 'BMI Calculator', path: '/bmi-calculator', category: 'Tools', desc: 'Calculate your Body Mass Index (BMI) easily.' },
  { title: 'Gallery', path: '/gallery', category: 'Media', desc: 'Images of our gym facilities, equipment, and members.' },
  { title: 'Our Blog & News', path: '/blog', category: 'Blog', desc: 'Tips, guides, fitness trends, and nutrition advice.' },
  { title: 'Contact Us', path: '/contact', category: 'Contact', desc: 'Staff phone numbers, email support, address, and contact forms.' }
];

const SearchModel = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const lower = query.toLowerCase();
      const filtered = SEARCHABLE_PAGES.filter(
        page =>
          page.title.toLowerCase().includes(lower) ||
          page.category.toLowerCase().includes(lower) ||
          page.desc.toLowerCase().includes(lower)
      );
      setResults(filtered);
    }
  }, [query]);

  // Reset query on close/open
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  // Close search overlay on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) {
      navigate(results[0].path);
      onClose();
    }
  };

  return (
    <div className="search-model" style={{ display: 'block', background: 'rgba(10, 10, 10, 0.95)' }}>
        <div className="h-100 d-flex flex-column align-items-center justify-content-center" style={{ paddingTop: '80px', paddingBottom: '40px' }}>
            <div className="search-close-switch" onClick={onClose} style={{ cursor: 'pointer' }}>+</div>
            <form className="search-model-form" onSubmit={handleFormSubmit} style={{ width: '100%', maxWidth: '600px', padding: '0 20px' }}>
                <input 
                  type="text" 
                  id="search-input" 
                  placeholder="Search here....." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderBottom: '2px solid #333',
                    color: '#fff',
                    fontSize: '30px',
                    padding: '10px 0',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
            </form>

            {/* Live Search Results */}
            {query.trim().length > 0 && (
              <div 
                className="search-results" 
                style={{ 
                  width: '100%', 
                  maxWidth: '600px', 
                  maxHeight: '50vh',
                  overflowY: 'auto',
                  marginTop: '30px', 
                  padding: '0 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {results.length > 0 ? (
                  results.map((page, idx) => (
                    <Link
                      key={idx}
                      to={page.path}
                      onClick={onClose}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '15px 20px',
                        backgroundColor: '#1c1c1c',
                        borderLeft: '4px solid #f36100',
                        transition: 'all 0.3s',
                        textDecoration: 'none'
                      }}
                      className="search-result-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>{page.title}</span>
                        <span style={{ color: '#f36100', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{page.category}</span>
                      </div>
                      <span style={{ color: '#c4c4c4', fontSize: '13px', marginTop: '6px', textAlign: 'left' }}>{page.desc}</span>
                    </Link>
                  ))
                ) : (
                  <div style={{ color: '#c4c4c4', fontSize: '16px', marginTop: '20px' }}>
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
        </div>
        <style>{`
          .search-result-item:hover {
            background-color: #262626 !important;
            transform: translateX(5px);
          }
        `}</style>
    </div>
  );
};

export default SearchModel;
