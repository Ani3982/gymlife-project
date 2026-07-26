import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ClassTimetable = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Set background image
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

  const getCellClass = (type, isDark = false) => {
    const baseClasses = `${isDark ? 'dark-bg' : ''} hover-bg ts-meta`;
    if (activeFilter === 'all') {
      return baseClasses;
    }
    return `${baseClasses} ${activeFilter === type ? 'show' : ''}`;
  };

  return (
    <>
    {/*  Breadcrumb Section Begin  */}
    <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
        <div className="container">
            <div className="row">
                <div className="col-lg-12 text-center">
                    <div className="breadcrumb-text">
                        <h2>Timetable</h2>
                        <div className="bt-option">
                            <Link to="/">Home</Link>
                            <a href="#">Pages</a>
                            <span>Services</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Breadcrumb Section End  */}

    {/*  Class Timetable Section Begin  */}
    <section className="class-timetable-section spad">
        <div className="container">
            <div className="row">
                <div className="col-lg-6">
                    <div className="section-title">
                        <span>Find Your Time</span>
                        <h2>Find Your Time</h2>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="table-controls">
                        <ul>
                            <li className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All event</li>
                            <li className={activeFilter === 'fitness' ? 'active' : ''} onClick={() => setActiveFilter('fitness')}>Fitness tips</li>
                            <li className={activeFilter === 'motivation' ? 'active' : ''} onClick={() => setActiveFilter('motivation')}>Motivation</li>
                            <li className={activeFilter === 'workout' ? 'active' : ''} onClick={() => setActiveFilter('workout')}>Workout</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-12">
                    <div className={`class-timetable ${activeFilter !== 'all' ? 'filtering' : ''}`}>
                        <table>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Monday</th>
                                    <th>Tuesday</th>
                                    <th>Wednesday</th>
                                    <th>Thursday</th>
                                    <th>Friday</th>
                                    <th>Saturday</th>
                                    <th>Sunday</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="class-time">6.00am - 8.00am</td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>WEIGHT LOOSE</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className={getCellClass('fitness')}>
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className={getCellClass('fitness')}>
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                    <td className="dark-bg blank-td"></td>
                                    <td className={getCellClass('motivation')}>
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="class-time">10.00am - 12.00am</td>
                                    <td className="blank-td"></td>
                                    <td className={getCellClass('fitness', true)}>
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                    <td className={getCellClass('workout')}>
                                        <h5>WEIGHT LOOSE</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className={getCellClass('motivation', true)}>
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className={getCellClass('workout')}>
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                    <td className={getCellClass('motivation', true)}>
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className="blank-td"></td>
                                </tr>
                                <tr>
                                    <td className="class-time">5.00pm - 7.00pm</td>
                                    <td className={getCellClass('fitness', true)}>
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className={getCellClass('motivation')}>
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                    <td className="blank-td"></td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className={getCellClass('motivation')}>
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className={getCellClass('fitness', true)}>
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="class-time">7.00pm - 9.00pm</td>
                                    <td className={getCellClass('motivation')}>
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="dark-bg blank-td"></td>
                                    <td className={getCellClass('fitness')}>
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className={getCellClass('workout', true)}>
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className={getCellClass('motivation')}>
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className={getCellClass('fitness', true)}>
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className={getCellClass('workout')}>
                                        <h5>WEIGHT LOOSE</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Class Timetable Section End  */}
    </>
  );
};

export default ClassTimetable;
