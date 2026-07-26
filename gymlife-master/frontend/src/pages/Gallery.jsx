import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    api.getGallery()
      .then(data => setGallery(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let timer = null;
    if (gallery.length > 0) {
      timer = setTimeout(() => {
        const $ = window.jQuery;
        if ($) {
          if ($.fn.magnificPopup) {
            $('.image-popup').magnificPopup({
                type: 'image'
            });
          }
          if ($.fn.masonry) {
            $('.gallery').masonry({
                itemSelector: '.gs-item',
                columnWidth: '.grid-sizer',
                gutter: 10
            });
          }
        }
      }, 200);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (window.jQuery) {
        const $ = window.jQuery;
        $('.image-popup').off('click');
        try {
          if ($.fn.masonry) {
            $('.gallery').masonry('destroy');
          }
        } catch (e) {}
      }
    };
  }, [gallery]);

  const getGalleryItemClass = (index) => {
    if (index === 0 || index === 5 || index === 6) return "gs-item grid-wide set-bg";
    return "gs-item set-bg";
  };

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Gallery</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <span>Gallery</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Gallery Section Begin  */}
      <div className="gallery-section gallery-page">
          <div className="gallery">
              <div className="grid-sizer"></div>
              {gallery.length > 0 ? (
                  gallery.map((item, idx) => (
                      <div className={getGalleryItemClass(idx)} data-setbg={item.image_url} style={{ backgroundImage: `url(${item.image_url})` }} key={item.id}>
                          <a href={item.image_url} className="thumb-icon image-popup" target="_blank" rel="noopener noreferrer"><i className="fa fa-picture-o"></i></a>
                      </div>
                  ))
              ) : (
                  <div className="col-12 text-center text-white">No gallery items available.</div>
              )}
          </div>
      </div>
      {/*  Gallery Section End  */}
    </>
  );
};

export default Gallery;
