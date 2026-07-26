import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';

const BlogDetails = () => {
  const location = useLocation();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const blogId = queryParams.get('id');

  useEffect(() => {
    setLoading(true);
    const fetchPromise = blogId ? api.getBlogDetail(blogId) : api.getBlogs();

    fetchPromise
      .then(data => {
        if (!data) throw new Error('Failed to fetch');
        if (Array.isArray(data)) {
          setBlog(data[0] || null);
        } else {
          setBlog(data);
        }
        setLoading(false);
      })
      .catch(() => {
        api.getBlogs()
          .then(data => {
            setBlog((Array.isArray(data) ? data[0] : data) || null);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, [blogId]);

  if (loading) {
    return (
      <div className="container spad text-center text-white" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Loading blog details...</h3>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container spad text-center text-white" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Blog post not found.</h3>
        <Link to="/blog" className="primary-btn mt-3" style={{ display: 'inline-block' }}>Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      {/*  Blog Details Hero Section Begin  */}
      <section className="blog-details-hero set-bg" data-setbg={blog.image_url} style={{ backgroundImage: `url(${blog.image_url})` }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-8 p-0 m-auto">
                      <div className="bh-text">
                          <h3>{blog.title}</h3>
                          <ul>
                              <li>by {blog.author}</li>
                              <li>{blog.created_at}</li>
                              <li>Category: {blog.category}</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Blog Details Hero Section End  */}

      {/*  Blog Details Section Begin  */}
      <section className="blog-details-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-8 p-0 m-auto">
                      <div className="blog-details-text">
                          <div className="blog-details-title">
                              <p style={{ whiteSpace: 'pre-wrap' }}>{blog.content}</p>
                          </div>
                          <div className="blog-details-quote">
                              <div className="quote-icon">
                                  <img src="/img/blog/details/quote-left.png" alt="" />
                              </div>
                              <h5>"The journey to fitness and clean eating starts with a single step, making everyday choices count."</h5>
                              <span>MEIKE PETERS</span>
                          </div>
                          <div className="blog-details-tag-share">
                              <div className="tags">
                                  <a href="#">{blog.category}</a>
                                  <a href="#">Body building</a>
                                  <a href="#">Yoga</a>
                                  <a href="#">Weightloss</a>
                              </div>
                              <div className="share">
                                  <span>Share</span>
                                  <a href="#"><i className="fa fa-facebook"></i> 82</a>
                                  <a href="#"><i className="fa fa-twitter"></i> 24</a>
                                  <a href="#"><i className="fa fa-envelope"></i> 08</a>
                              </div>
                          </div>
                          <div className="blog-details-author">
                              <div className="ba-pic">
                                  <img src="/img/blog/details/blog-profile.jpg" alt="" />
                              </div>
                              <div className="ba-text">
                                  <h5>Lena Mollein.</h5>
                                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
                                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                                      exercitation.</p>
                                  <div className="bp-social">
                                      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-facebook"></i></a>
                                      <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-twitter"></i></a>
                                      <a href="#"><i className="fa fa-google-plus"></i></a>
                                      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-instagram"></i></a>
                                      <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"><i className="fa fa-youtube-play"></i></a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Blog Details Section End  */}
    </>
  );
};

export default BlogDetails;
