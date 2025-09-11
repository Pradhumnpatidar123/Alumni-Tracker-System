import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = () => (
  <div className="top-bar">
    <div className="container-fluid">
      <div className="row align-items-center h-100">
        <div className="col-lg-4 col-md-12">
          <div className="logo">
            {/* <Link to="/"> */}
              <h2>AlumniTracker</h2>
              {/* <img src="/img/logo1.png" alt="Logo" height={500} width={80} /> */}
            {/* </Link> */}
          </div>
        </div>
        <div className="col-lg-8 col-md-7 d-none d-lg-block">
          <div className="row h-100">
            <div className="col-4">
              <div className="top-bar-item h-100">
                <div className="top-bar-icon">
                  <i className="flaticon-calendar" />
                </div>
                <div className="top-bar-text">
                  <h3>College Time</h3>
                  <p>Mon - Fri</p>
                  <p>9:00am - 05:00pm</p>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="top-bar-item h-100">
                <div className="top-bar-icon">
                  <i className="flaticon-call" />
                </div>
                <div className="top-bar-text">
                  <h3>Contact Us</h3>
                  <p>+012 872 8888</p>
                  <p>+91 989856541</p>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="top-bar-item h-100">
                <div className="top-bar-icon">
                  <i className="flaticon-send-mail" />
                </div>
                <div className="top-bar-text">
                  <h3>Email Us</h3>
                  <p>College@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TopBar;
