import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import SearchModel from './SearchModel';
import ScrollToTop from './ScrollToTop';
import ChatBot from './ChatBot';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header onSearchClick={() => setIsSearchOpen(true)} />
      <Outlet />
      <Footer />
      <SearchModel isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ChatBot />
    </>
  );
};

export default Layout;
