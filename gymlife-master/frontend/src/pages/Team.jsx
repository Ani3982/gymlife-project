import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Team = () => {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    api.getTrainers()
      .then(data => setTrainers(data))
      .catch(() => {});
  }, []);

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Our Team</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <span>Our team</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Team Section Begin  */}
      <section className="team-section team-page spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-12">
                      <div className="team-title">
                          <div className="section-title">
                              <span>Our Team</span>
                              <h2>TRAIN WITH EXPERTS</h2>
                          </div>
                          <a href="#appointment-section" className="primary-btn btn-normal appoinment-btn">appointment</a>
                      </div>
                  </div>
              </div>
              <div className="row">
                  {trainers.length > 0 ? (
                      trainers.map((trainer) => (
                          <div className="col-lg-4 col-sm-6" key={trainer.id}>
                              <div className="ts-item set-bg" data-setbg={trainer.image_url} style={{ backgroundImage: `url(${trainer.image_url})` }}>
                                  <div className="ts_text">
                                      <h4>{trainer.name}</h4>
                                      <span>{trainer.role}</span>
                                      <div className="tt_social">
                                          {trainer.facebook_url && <a href={trainer.facebook_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>}
                                          {trainer.twitter_url && <a href={trainer.twitter_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>}
                                          {trainer.youtube_url && <a href={trainer.youtube_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>}
                                          {trainer.instagram_url && <a href={trainer.instagram_url} target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="col-12 text-center text-white">No trainers available.</div>
                  )}
              </div>
          </div>
      </section>
      {/*  Team Section End  */}
    </>
  );
};

export default Team;
