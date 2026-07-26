import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.getBlogs()
      .then(data => setBlogs(data))
      .catch(() => {});
  }, []);

  // Calculate categories count
  const categoriesCount = blogs.reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + 1;
    return acc;
  }, {});

  const latestBlogs = [...blogs].slice(0, 4);

  return (
    <>
      {/*  Breadcrumb Section Begin  */}
      <section className="breadcrumb-section set-bg" data-setbg="/img/breadcrumb-bg.jpg" style={{ backgroundImage: "url('/img/breadcrumb-bg.jpg')" }}>
          <div className="container">
              <div className="row">
                  <div className="col-lg-12 text-center">
                      <div className="breadcrumb-text">
                          <h2>Our Blog</h2>
                          <div className="bt-option">
                              <Link to="/">Home</Link>
                              <span>Blog</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Breadcrumb Section End  */}

      {/*  Blog Section Begin  */}
      <section className="blog-section spad">
          <div className="container">
              <div className="row">
                  <div className="col-lg-8 p-0">
                      {blogs.length > 0 ? (
                          blogs.map((blog) => (
                              <div className="blog-item" key={blog.id}>
                                  <div className="bi-pic">
                                      <img src={blog.image_url} alt={blog.title} />
                                  </div>
                                  <div className="bi-text">
                                      <h5>
                                          <Link to={`/blog-details?id=${blog.id}`}>
                                              {blog.title}
                                          </Link>
                                      </h5>
                                      <ul>
                                          <li>by {blog.author}</li>
                                          <li>{blog.created_at}</li>
                                          <li>Category: {blog.category}</li>
                                      </ul>
                                      <p>{blog.content && blog.content.length > 180 ? `${blog.content.substring(0, 180)}...` : blog.content}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="col-12 text-center text-white">No blog posts available.</div>
                      )}
                  </div>
                  <div className="col-lg-4 col-md-8 p-0">
                      <div className="sidebar-option">
                          <div className="so-categories">
                              <h5 className="title">Categories</h5>
                              <ul>
                                  {Object.keys(categoriesCount).map((cat) => (
                                      <li key={cat}>
                                          <a href="#">{cat} <span>{categoriesCount[cat]}</span></a>
                                      </li>
                                  ))}
                                  {Object.keys(categoriesCount).length === 0 && (
                                      <li className="text-white">No categories.</li>
                                  )}
                              </ul>
                          </div>
                          <div className="so-latest">
                              <h5 className="title">Feature posts</h5>
                              {latestBlogs.length > 0 ? (
                                  <>
                                      <div className="latest-large set-bg" data-setbg={latestBlogs[0].image_url} style={{ backgroundImage: `url(${latestBlogs[0].image_url})` }}>
                                          <div className="ll-text">
                                              <h5>
                                                  <Link to={`/blog-details?id=${latestBlogs[0].id}`}>
                                                      {latestBlogs[0].title}
                                                  </Link>
                                              </h5>
                                              <ul>
                                                  <li>{latestBlogs[0].created_at}</li>
                                              </ul>
                                          </div>
                                      </div>
                                      {latestBlogs.slice(1).map((blog) => (
                                          <div className="latest-item" key={blog.id}>
                                              <div className="li-pic">
                                                  <img src={blog.image_url} alt={blog.title} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                                              </div>
                                              <div className="li-text">
                                                  <h6>
                                                      <Link to={`/blog-details?id=${blog.id}`}>
                                                          {blog.title}
                                                      </Link>
                                                  </h6>
                                                  <span className="li-time">{blog.created_at}</span>
                                              </div>
                                          </div>
                                      ))}
                                  </>
                              ) : (
                                  <div className="text-white">No feature posts.</div>
                              )}
                          </div>
                          <div className="so-tags">
                              <h5 className="title">Popular tags</h5>
                              <a href="#">Gyming</a>
                              <a href="#">Body building</a>
                              <a href="#">Yoga</a>
                              <a href="#">Weightloss</a>
                              <a href="#">Professional</a>
                              <a href="#">Stretching</a>
                              <a href="#">Cardio</a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>
      {/*  Blog Section End  */}
    </>
  );
};

export default Blog;
