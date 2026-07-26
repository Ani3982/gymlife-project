import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';

const ClassDetails = () => {
  const location = useLocation();
  const [classesList, setClassesList] = useState([]);
  const [classItem, setClassItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const classId = queryParams.get('id');

  const fetchClassDetails = (id) => {
    setLoading(true);
    api.getClassDetail(id)
      .then(data => {
        if (!data) throw new Error('Not found');
        setClassItem(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    api.getClasses()
      .then(data => {
        setClassesList(data);
        if (!classId && data.length > 0) {
          fetchClassDetails(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (classId) {
      fetchClassDetails(classId);
    }
  }, [classId]);

  if (loading) {
    return (
      <div className="container spad text-center text-white" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading class details...</h3>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="container spad text-center text-white" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Class details not found.</h3>
        <Link to="/" className="primary-btn mt-3">Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Classes detail</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <Link to="/class-timetable">Classes</Link>
                              <span>{classItem.name}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Class Details Section Begin  */}
      <section className="class-details-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-8">
                      <div className="class-details-text">
                          <div className="cd-pic">
                              <img src={classItem.image_url} alt={classItem.name} />
                          </div>
                          <div className="cd-text">
                              <div className="cd-single-item">
                                  <h3>{classItem.name}</h3>
                                  <p>{classItem.description || "No description available for this class."}</p>
                              </div>
                              <div className="cd-single-item">
                                  <h3>Class Info</h3>
                                  <p><strong>Duration:</strong> {classItem.duration || '60 mins'}</p>
                                  <p><strong>Category:</strong> {classItem.category ? classItem.category.toUpperCase() : 'General'}</p>
                              </div>
                          </div>
                          {classItem.trainer && (
                              <div className="cd-trainer">
                                  <div className="row">
                                      <div className="col-md-6">
                                          <div className="cd-trainer-pic">
                                              <img src={classItem.trainer.image_url} alt={classItem.trainer.name} />
                                          </div>
                                      </div>
                                      <div className="col-md-6">
                                          <div className="cd-trainer-text">
                                              <div className="trainer-title">
                                                  <h4>{classItem.trainer.name}</h4>
                                                  <span>{classItem.trainer.role}</span>
                                              </div>
                                              <div className="trainer-social">
                                                  {classItem.trainer.facebook_url && <a href={classItem.trainer.facebook_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>}
                                                  {classItem.trainer.twitter_url && <a href={classItem.trainer.twitter_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>}
                                                  {classItem.trainer.youtube_url && <a href={classItem.trainer.youtube_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>}
                                                  {classItem.trainer.instagram_url && <a href={classItem.trainer.instagram_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>}
                                              </div>
                                              <p>Meet our expert trainer who will guide you step-by-step through this class program to maximize your fitness results.</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
                <div className="col-lg-4 col-md-8">
                    <div className="sidebar-option">
                        <div className="so-categories">
                            <h5 className="title">Our Classes</h5>
                            <ul>
                                {classesList.map((c) => (
                                    <li key={c.id}>
                                        <Link 
                                            to={`/class-details?id=${c.id}`} 
                                            style={{ 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center',
                                                color: classItem.id === c.id ? '#f36100' : ''
                                            }}
                                        >
                                            {c.name}
                                            <span><i className="fa fa-angle-right"></i></span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="so-latest">
                            <h5 className="title">Latest posts</h5>
                            <div className="latest-large set-bg" data-setbg="/img/letest-blog/latest-1.jpg">
                                <div className="ll-text">
                                    <h5><a href="#">This Japanese Way of Making Iced Coffee Is a Game...</a></h5>
                                    <ul>
                                        <li>Aug 20, 2019</li>
                                        <li>20 Comment</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="latest-item">
                                <div className="li-pic">
                                    <img src="/img/letest-blog/latest-2.jpg" alt="" />
                                </div>
                                <div className="li-text">
                                    <h6><a href="#">Grilled Potato and Green Bean Salad</a></h6>
                                    <span className="li-time">Aug 15, 2019</span>
                                </div>
                            </div>
                            <div className="latest-item">
                                <div className="li-pic">
                                    <img src="/img/letest-blog/latest-3.jpg" alt="" />
                                </div>
                                <div className="li-text">
                                    <h6><a href="#">The $8 French Rosé I Buy in Bulk Every Summer</a></h6>
                                    <span className="li-time">Aug 15, 2019</span>
                                </div>
                            </div>
                            <div className="latest-item">
                                <div className="li-pic">
                                    <img src="/img/letest-blog/latest-4.jpg" alt="" />
                                </div>
                                <div className="li-text">
                                    <h6><a href="#">Ina Garten's Skillet-Roasted Lemon Chicken</a></h6>
                                    <span className="li-time">Aug 15, 2019</span>
                                </div>
                            </div>
                            <div className="latest-item">
                                <div className="li-pic">
                                    <img src="/img/letest-blog/latest-5.jpg" alt="" />
                                </div>
                                <div className="li-text">
                                    <h6><a href="#">The Best Weeknight Baked Potatoes, 3 Creative Ways</a></h6>
                                    <span className="li-time">Aug 15, 2019</span>
                                </div>
                            </div>
                        </div>
                        <div className="so-banner set-bg" data-setbg="/img/sidebar-banner.jpg">
                            <h5>Banner 300x300</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    {/*  Class Details Section End  */}

    {/*  Class Timetable Section Begin  */}
    <section className="class-timetable-section class-details-timetable spad">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="class-details-timetable_title">
                        <h5>Classes timetable</h5>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-12">
                    <div className="class-timetable details-timetable">
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
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>WEIGHT LOOSE</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                    <td className="dark-bg blank-td"></td>
                                    <td className="hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="class-time">10.00am - 12.00am</td>
                                    <td className="blank-td"></td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>WEIGHT LOOSE</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className="blank-td"></td>
                                </tr>
                                <tr>
                                    <td className="class-time">5.00pm - 7.00pm</td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Body Building</h5>
                                        <span>Robert Cage</span>
                                    </td>
                                    <td className="blank-td"></td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Fitness</h5>
                                        <span>Kimberly Stone</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="class-time">7.00pm - 9.00pm</td>
                                    <td className="hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Cardio</h5>
                                        <span>RLefew D. Loee</span>
                                    </td>
                                    <td className="dark-bg blank-td"></td>
                                    <td className="hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="workout">
                                        <h5>Yoga</h5>
                                        <span>Keaf Shen</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="motivation">
                                        <h5>Karate</h5>
                                        <span>Donald Grey</span>
                                    </td>
                                    <td className="dark-bg hover-dp ts-meta" data-tsmeta="fitness">
                                        <h5>Boxing</h5>
                                        <span>Rachel Adam</span>
                                    </td>
                                    <td className="hover-dp ts-meta" data-tsmeta="workout">
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

export default ClassDetails;
