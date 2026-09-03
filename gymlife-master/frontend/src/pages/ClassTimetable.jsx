import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { label: '6.00am - 8.00am', start: 360, end: 480 },
  { label: '10.00am - 12.00pm', start: 600, end: 720 },
  { label: '5.00pm - 7.00pm', start: 1020, end: 1140 },
  { label: '7.00pm - 9.00pm', start: 1140, end: 1260 },
];

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = String(timeStr).toLowerCase().replace('.', ':').trim();
  const isPm = clean.includes('pm');
  const isAm = clean.includes('am');
  const numeric = clean.replace('am', '').replace('pm', '').trim();
  const parts = numeric.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const mins = parseInt(parts[1], 10) || 0;

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;
  return hours * 60 + mins;
};

const ClassTimetable = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimetableData();

    if (window.jQuery) {
      const $ = window.jQuery;
      $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        if (bg) {
          $(this).css('background-image', 'url(' + bg + ')');
        }
      });
    }
  }, []);

  const loadTimetableData = async () => {
    setLoading(true);
    try {
      const data = await api.getTimetable();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching public timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSlotForCell = (day, slot) => {
    return schedules.find((s) => {
      if (s.day_of_week !== day) return false;
      const sStart = parseTimeToMinutes(s.start_time);
      // Match slot window
      return Math.abs(sStart - slot.start) <= 90;
    });
  };

  const getCellFilterCategory = (category) => {
    const cat = String(category || '').toUpperCase();
    if (cat.includes('CARDIO') || cat.includes('YOGA')) return 'fitness';
    if (cat.includes('BOXING') || cat.includes('CROSSFIT')) return 'motivation';
    return 'workout';
  };

  const isCellVisible = (category) => {
    if (activeFilter === 'all') return true;
    const catType = getCellFilterCategory(category);
    return activeFilter === catType;
  };

  return (
    <>
      {/* Breadcrumb Section Begin */}
      <section 
        className="breadcrumb-section set-bg" 
        data-setbg="/img/breadcrumb-bg.jpg" 
        style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center">
              <div className="breadcrumb-text">
                <h2>{t('class_timetable', 'Class Timetable')}</h2>
                <div className="bt-option">
                  <Link to="/">{t('home', 'Home')}</Link>
                  <span>{t('class_timetable', 'Class Timetable')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Breadcrumb Section End */}

      {/* Class Timetable Section Begin */}
      <section className="class-timetable-section spad">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title">
                <span>{t('find_time', 'Find Your Time')}</span>
                <h2>{t('timetable_title', 'FITNESS TIMETABLE')}</h2>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="table-controls">
                <ul>
                  <li className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>
                    {t('all_classes', 'All Classes')}
                  </li>
                  <li className={activeFilter === 'fitness' ? 'active' : ''} onClick={() => setActiveFilter('fitness')}>
                    Fitness & Yoga
                  </li>
                  <li className={activeFilter === 'motivation' ? 'active' : ''} onClick={() => setActiveFilter('motivation')}>
                    Boxing & CrossFit
                  </li>
                  <li className={activeFilter === 'workout' ? 'active' : ''} onClick={() => setActiveFilter('workout')}>
                    Body Building & Strength
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className={`class-timetable ${activeFilter !== 'all' ? 'filtering' : ''}`} style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th></th>
                      {DAYS.map((day) => (
                        <th key={day}>{t(day.toLowerCase(), day)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot, sIdx) => (
                      <tr key={slot.label}>
                        <td className="class-time">{slot.label}</td>
                        {DAYS.map((day, dIdx) => {
                          const item = getSlotForCell(day, slot);
                          const isDark = (sIdx + dIdx) % 2 === 0;

                          if (!item) {
                            return <td key={day} className={`blank-td ${isDark ? 'dark-bg' : ''}`}></td>;
                          }

                          const visible = isCellVisible(item.category);

                          return (
                            <td
                              key={day}
                              className={`${isDark ? 'dark-bg' : ''} hover-bg ts-meta ${visible ? 'show' : ''}`}
                            >
                              <h5>{item.class_name}</h5>
                              <span>{item.trainer_name}</span>
                              <div style={{ fontSize: '11px', color: '#f36100', marginTop: '4px' }}>
                                {item.room}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Class Timetable Section End */}
    </>
  );
};

export default ClassTimetable;