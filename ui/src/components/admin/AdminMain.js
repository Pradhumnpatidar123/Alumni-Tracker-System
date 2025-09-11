// AlumniTrackerPage.jsx
import React, { useEffect } from 'react';
import TopBar from '../common/TopBar';
// Optional: Manage <head> with react-helmet if desired
// import { Helmet } from 'react-helmet';
import Footer from '../common/Footer';
import { Outlet } from 'react-router-dom';
import AdminNavBar from './AdminNavBar';

const BackToTop = () => (
  <a href="#" className="back-to-top">
    <i className="fa fa-chevron-up" />
  </a>
);

const AlumniTrackerPage = ({ message = '' }) => {
  // useEffect(() => {
  //   // Optional: mimic original script to push forward in history once
  //   try {
  //     window.history.forward();
  //   } catch (_) {
  //     // no-op
  //   }
  // }, []);

  return (
    <div className="wrapper">
      
      <TopBar />
      <AdminNavBar />
      <Outlet />
      {message && <div className="alert alert-info text-center">{message}</div>}
      <Footer />
      <BackToTop />
    </div>
  );
};

export default AlumniTrackerPage;
