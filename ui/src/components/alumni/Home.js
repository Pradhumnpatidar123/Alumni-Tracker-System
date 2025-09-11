import React from "react";
import { Link } from "react-router-dom";
import '../../App.css';
const Home = () => (
  

<div>
  
                        <img src="img/banner6.jpg" id="fullImage" alt="Carousel Image"/>
    {/* Feature Start */}
    <div className="feature wow fadeInUp" data-wow-delay="0.1s">
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col-lg-4 col-md-12">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="flaticon-worker"></i>
              </div>
              <div className="feature-text">
                <h3>Alumni</h3>
                <p>Lorem ipsum dolor sit amet elit. Phasus nec pretim ornare velit non</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-12">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="flaticon-building"></i>
              </div>
              <div className="feature-text">
                <h3>Forum</h3>
                <p>Lorem ipsum dolor sit amet elit. Phasus nec pretim ornare velit non</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-12">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="flaticon-call"></i>
              </div>
              <div className="feature-text">
                <h3>Events</h3>
                <p>Lorem ipsum dolor sit amet elit. Phasus nec pretim ornare velit non</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Feature End */}
  

   
    <a href="#" className="back-to-top"><i className="fa fa-chevron-up"></i></a>
  </div>
);

export default Home; 