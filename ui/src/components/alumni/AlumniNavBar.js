import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path as needed
import ContactPopup from '../common/ContactPopup';

function AlumniNavbar() {
  const [navCollapsed, setNavCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null); // 'jobs' | 'forum' | null
  const [loggingOut, setLoggingOut] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);

  const toggleNav = () => setNavCollapsed(prev => !prev);
  const closeNav = () => setNavCollapsed(true);

  const toggleDropdown = (key) => {
    setOpenDropdown(prev => (prev === key ? null : key));
  };

  const closeAll = () => {
    setOpenDropdown(null);
    closeNav();
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactPopup(true);
    closeAll();
  };

  const closeContactPopup = () => {
    setShowContactPopup(false);
  };

  const navigate = useNavigate();
  // Get authentication state from context
  const { isAuthenticated, isLoading, isAlumni, logout, user } = useAuth();

  // Debug: Log authentication state whenever it changes
  useEffect(() => {
    console.log('AlumniNavBar - Auth State Changed:', {
      isAuthenticated,
      isAlumni,
      isLoading,
      user,
      userRole: user?.role,
      userType: user?.userType
    });
  }, [isAuthenticated, isAlumni, isLoading, user]);

  const linkClass = ({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`;
  const dropItemClass = ({ isActive }) => `dropdown-item${isActive ? ' active' : ''}`;

  const handleLogout = async () => {
    if (loggingOut) return; // Prevent multiple logout attempts
    
    console.log('Starting logout process...');
    setLoggingOut(true);
    closeAll(); // Close navigation immediately
    
    try {
      if (logout) {
        const result = await logout('alumni'); // specify alumni logout
        console.log('Logout result:', result);
        
        // Force a small delay to ensure state updates propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      // Navigate regardless of logout success/failure
      navigate('/', { replace: true }); // use replace: true to prevent back navigation
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="nav-bar">
        <div className="container-fluid">
          <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
            <div className="navbar-nav mr-auto">
              <span className="nav-item nav-link">Loading...</span>
            </div>
          </nav>
        </div>
      </div>
    );
  }

  // Check if user is authenticated AND is an alumni
  const isAlumniAuthenticated = isAuthenticated && isAlumni;

  return (
    <div className="nav-bar"  key={`navbar-${isAuthenticated}-${isAlumni}-${loggingOut}`}>
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark py-1">
          <NavLink to="/" className="navbar-brand py-1" onClick={closeAll}>
            <span style={{fontSize: '13px'}}>ALUMNI MENU</span>
          </NavLink>

          <button
            type="button"
            className="navbar-toggler navbar-toggler-sm"
            aria-controls="navbarCollapse"
            aria-expanded={!navCollapsed}
            aria-label="Toggle navigation"
            onClick={toggleNav}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse justify-content-between ${navCollapsed ? '' : 'show'}`}
            id="navbarCollapse"
          >
            <div className="navbar-nav mr-auto">
              {isAlumniAuthenticated ? (
                <>
                  <NavLink to="/alumniHome" className={linkClass} onClick={closeAll}>
                    <i className="fas fa-home me-1"></i>Home
                  </NavLink>

                  {/* Compact Jobs dropdown */}
                  <div className="nav-item dropdown">
                    <a
                      href="#jobs"
                      className={`nav-link dropdown-toggle py-2${openDropdown === 'jobs' ? ' show' : ''}`}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={openDropdown === 'jobs'}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown('jobs');
                      }}
                    >
                      <i className="fas fa-briefcase me-1"></i>Jobs
                    </a>
                    <div className={`dropdown-menu dropdown-menu-sm${openDropdown === 'jobs' ? ' show' : ''}`}>
                      <NavLink to="/jobform" className={dropItemClass} onClick={closeAll}>
                        <i className="fas fa-plus me-1"></i>Add Jobs
                      </NavLink>
                      <NavLink to="/alumniviewjob" className={dropItemClass} onClick={closeAll}>
                        <i className="fas fa-eye me-1"></i>View Jobs
                      </NavLink>
                    </div>
                  </div>

                  {/* Compact Forum dropdown */}
                  <div className="nav-item dropdown">
                    <a
                      href="#forum"
                      className={`nav-link dropdown-toggle py-2${openDropdown === 'forum' ? ' show' : ''}`}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={openDropdown === 'forum'}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown('forum');
                      }}
                    >
                      <i className="fas fa-comments me-1"></i>Forum
                    </a>
                    <div className={`dropdown-menu dropdown-menu-sm${openDropdown === 'forum' ? ' show' : ''}`}>
                      <NavLink to="/addFourm" className={dropItemClass} onClick={closeAll}>
                        <i className="fas fa-plus me-1"></i>Add Forum
                      </NavLink>
                      <NavLink to="/viewMyForum" className={dropItemClass} onClick={closeAll}>
                        <i className="fas fa-user me-1"></i>My Forum
                      </NavLink>
                      <NavLink to="/viewAllForum" className={dropItemClass} onClick={closeAll}>
                        <i className="fas fa-list me-1"></i>All Forums
                      </NavLink>
                    </div>
                  </div>

                  <NavLink to="/alumniViewEvents" className={linkClass} onClick={closeAll}>
                    <i className="fas fa-calendar me-1"></i>Events
                  </NavLink>
                  <NavLink to="/gallery" className={linkClass} onClick={closeAll}>
                    <i className="fas fa-images me-1"></i>Gallery
                  </NavLink>

                  <NavLink
                    onClick={handleLogout}
                    style={{ color: '#dc3545', opacity: loggingOut ? 0.6 : 1 }}
                    className="nav-item nav-link py-2"
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass} onClick={closeAll}>
                    <i className="fas fa-sign-in-alt me-1"></i>Login
                  </NavLink>
                  <NavLink to="/signup" className={linkClass} onClick={closeAll}>
                    <i className="fas fa-user-plus me-1"></i>Sign Up
                  </NavLink>
                </>
              )}
            </div>

            <div className="ml-auto">
              <button 
                className="btn btn-outline-light btn-sm py-1" 
                onClick={handleContactClick}
                style={{ border: '1px solid rgba(255,255,255,0.5)' }}
              >
                <i className="fas fa-envelope me-1"></i>Contact
              </button>
            </div>
          </div>
        </nav>
      </div>
      
      {/* Compact navbar styles */}
      <style jsx>{`
        .navbar {
          min-height: 40px;
        }
        .navbar-nav .nav-link {
          padding: 0.3rem 0.6rem !important;
          font-size: 5px;
        }
        .dropdown-menu-sm {
          padding: 0.1rem 0;
          min-width: 120px;
        }
        .dropdown-menu-sm .dropdown-item {
          padding: 0.25rem 0.6rem;
          font-size: 11px;
        }
        .navbar-brand {
          font-size: 13px !important;
          padding: 0.3rem 0.6rem !important;
        }
        .btn-sm {
          padding: 0.2rem 0.4rem;
          font-size: 11px;
        }
      `}</style>
      
      {/* Contact Popup */}
      <ContactPopup 
        isOpen={showContactPopup} 
        onClose={closeContactPopup} 
      />
    </div>
  );
}

export default AlumniNavbar;
