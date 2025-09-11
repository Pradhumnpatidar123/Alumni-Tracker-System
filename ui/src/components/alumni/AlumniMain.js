// AlumniTrackerPage.jsx
import React, { useEffect } from 'react';
import TopBar from '../common/TopBar';
// Optional: Manage <head> with react-helmet if desired
// import { Helmet } from 'react-helmet';
import NavBar from './Navbar';
import Footer from '../common/Footer';
import { Outlet } from 'react-router-dom';
import AlumniNavbar from './AlumniNavBar';
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
      <AlumniNavbar />
      <Outlet />
      {message && <div className="alert alert-info text-center">{message}</div>}
      <Footer />
      <BackToTop />
    </div>
  );
};

export default AlumniTrackerPage;
