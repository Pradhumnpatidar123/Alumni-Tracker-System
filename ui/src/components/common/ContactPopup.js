import React from 'react';

const ContactPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="contact-popup-overlay" 
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        className="contact-popup-card"
        style={{
          background: 'white',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div 
          className="popup-header"
          style={{
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px 12px 0 0',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
          <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600' }}>
            <i className="fas fa-graduation-cap me-2"></i>
            Contact Alumni Office
          </h2>
          <p style={{ margin: '5px 0 0 0', opacity: '0.9', fontSize: '14px' }}>
            Connect with our Alumni Network team - Building bridges for tomorrow
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '25px' }}>
          {/* Contact Information */}
          <div className="contact-info" style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>
              Alumni Network Hub
            </h3>
            
            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ecf0f1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#34495e' }}></i>
              </div>
              <div>
                <strong style={{ color: '#2c3e50', fontSize: '14px' }}>Address:</strong>
                <p style={{ margin: '0', color: '#7f8c8d', fontSize: '13px' }}>
                  Alumni Office, University Campus<br />
                  Building A, 2nd Floor, Room 205
                </p>
              </div>
            </div>

            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#d5dbdb',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <i className="fas fa-phone-alt" style={{ color: '#27ae60' }}></i>
              </div>
              <div>
                <strong style={{ color: '#2c3e50', fontSize: '14px' }}>Phone:</strong>
                <p style={{ margin: '0', color: '#7f8c8d', fontSize: '13px' }}>
                  +1 (555) 123-4567<br />
                  <small style={{ color: '#999' }}>Monday - Friday, 9:00 AM - 5:00 PM</small>
                </p>
              </div>
            </div>

            <div className="contact-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#fadbd8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '15px'
              }}>
                <i className="fas fa-envelope" style={{ color: '#e74c3c' }}></i>
              </div>
              <div>
                <strong style={{ color: '#2c3e50', fontSize: '14px' }}>Email:</strong>
                <p style={{ margin: '0', color: '#7f8c8d', fontSize: '13px' }}>
                  alumni@university.edu<br />
                  <small style={{ color: '#999' }}>We respond within 24 hours</small>
                </p>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="office-hours" style={{ marginBottom: '25px' }}>
            <h3 style={{ color: '#2c3e50', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>
              Office Hours
            </h3>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #bdc3c7'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#2c3e50', fontSize: '13px', fontWeight: '500' }}>Monday - Friday:</span>
                <span style={{ color: '#7f8c8d', fontSize: '13px' }}>9:00 AM - 5:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#2c3e50', fontSize: '13px', fontWeight: '500' }}>Saturday:</span>
                <span style={{ color: '#7f8c8d', fontSize: '13px' }}>10:00 AM - 2:00 PM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#2c3e50', fontSize: '13px', fontWeight: '500' }}>Sunday:</span>
                <span style={{ color: '#7f8c8d', fontSize: '13px' }}>Closed</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <h3 style={{ color: '#2c3e50', fontSize: '18px', marginBottom: '15px', fontWeight: '600' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
              <a 
                href="mailto:alumni@university.edu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                <i className="fas fa-envelope me-1"></i>
                Send Email
              </a>
              <a 
                href="tel:+15551234567"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#229954'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#27ae60'}
              >
                <i className="fas fa-phone me-1"></i>
                Call Now
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #bdc3c7',
          padding: '15px 25px',
          backgroundColor: '#ecf0f1',
          borderRadius: '0 0 12px 12px'
        }}>
          <p style={{
            margin: '0',
            textAlign: 'center',
            color: '#7f8c8d',
            fontSize: '12px'
          }}>
            <i className="fas fa-graduation-cap me-1"></i>
            Connecting Alumni Worldwide - Building Stronger Networks
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPopup;