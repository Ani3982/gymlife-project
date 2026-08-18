import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector = ({ variant = 'desktop' }) => {
  const { language, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Variant: Mobile Drawer Segmented Buttons
  if (variant === 'mobile-drawer') {
    return (
      <div className="drawer-language-picker">
        <div className="drawer-lang-header">
          <i className="fa fa-globe"></i>
          <span>Select Language / भाषा</span>
        </div>
        <div className="drawer-lang-buttons">
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`drawer-lang-btn ${language === l.code ? 'active' : ''}`}
              onClick={() => changeLanguage(l.code)}
            >
              <span className="lang-flag">{l.flag}</span>
              <span className="lang-name">{l.nativeName}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Variant: Desktop Header Dropdown
  return (
    <div className="header-language-dropdown" ref={dropdownRef}>
      <button 
        type="button" 
        className="lang-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Language"
        aria-expanded={isOpen}
      >
        <i className="fa fa-globe lang-globe-icon"></i>
        <span className="lang-active-flag">{currentLang.flag}</span>
        <span className="lang-active-text">{currentLang.nativeName}</span>
        <i className={`fa ${isOpen ? 'fa-angle-up' : 'fa-angle-down'} lang-arrow`}></i>
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu">
          <div className="lang-dropdown-title">Choose Language / भाषा</div>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`lang-option-btn ${language === l.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(l.code);
                setIsOpen(false);
              }}
            >
              <div className="lang-option-left">
                <span className="lang-flag">{l.flag}</span>
                <span className="lang-name-native">{l.nativeName}</span>
                <span className="lang-name-en">({l.name})</span>
              </div>
              {language === l.code && <i className="fa fa-check lang-check-icon"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;