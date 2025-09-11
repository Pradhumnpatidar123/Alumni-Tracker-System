import React from 'react';

const Footer = () => (
  <div className="footer wow fadeIn" data-wow-delay="0.3s">
    <div className="container">
      <div className="row">
        <div className="col-md-6 col-lg-3">
          <div className="footer-contact">
            <h2>Contact Us</h2>
            <p><i className="fa fa-map-marker-alt" />Alumni Office, University Campus</p>
            <p><i className="fa fa-phone-alt" />+1 (555) 123-4567</p>
            <p><i className="fa fa-envelope" />alumni@university.edu</p>
            <div className="footer-social">
              <a href="#"><i className="fab fa-twitter" /></a>
              <a href="#"><i className="fab fa-facebook-f" /></a>
              <a href="#"><i className="fab fa-youtube" /></a>
              <a href="#"><i className="fab fa-instagram" /></a>
              <a href="#"><i className="fab fa-linkedin-in" /></a>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="footer-link">
            <h2>Quick Links</h2>
            <a href="#">Alumni Directory</a>
            <a href="#">Job Board</a>
            <a href="#">Events</a>
            <a href="#">Forums</a>
            <a href="#">Gallery</a>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="footer-link">
            <h2>Resources</h2>
            <a href="#">About Alumni Network</a>
            <a href="#">Contact Support</a>
            <a href="#">Success Stories</a>
            <a href="#">Career Services</a>
            <a href="#">Mentorship Program</a>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="newsletter">
            <h2>Stay Connected</h2>
            <p>
              Subscribe to our newsletter to receive updates about alumni events, job opportunities, and networking activities.
            </p>
            <div className="form">
              <input className="form-control" placeholder="Email here" />
              <button className="btn">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="container footer-menu">
      <div className="f-menu">
        <a href="#">Terms of Use</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Alumni Guidelines</a>
        <a href="#">Help & Support</a>
        <a href="#">FAQs</a>
      </div>
    </div>

    <div className="container copyright">
      <div className="row">
        <div className="col-md-6">
          <p>&copy; <a href="#">Alumni Tracker System</a>, All Rights Reserved.</p>
        </div>
        <div className="col-md-6">
          <p>Connecting Alumni Worldwide</p>
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
