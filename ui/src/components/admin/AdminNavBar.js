import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
 
function AdminNavBar () {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin, logout, refresh } = useAuth();
    const [navCollapsed, setNavCollapsed] = useState(true);
  
  const [openDropdown, setOpenDropdown] = useState(null); // 'jobs' | 'forum' | null
    const toggleNav = () => setNavCollapsed(prev => !prev);
    const closeNav = () => setNavCollapsed(true);
  
    const toggleDropdown = (key) => {
      setOpenDropdown(prev => (prev === key ? null : key));
    };
  
    const closeAll = () => {
      setOpenDropdown(null);
      closeNav();
    };
  
    // Get authentication state from context
  
    const linkClass = ({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`;
    const dropItemClass = ({ isActive }) => `dropdown-item${isActive ? ' active' : ''}`;
  
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/admin/login', { replace: true });
    } else {
      console.error('Logout failed:', result.message);
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

  // Debug: Log authentication state
  console.log('AdminNavBar - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);

  // Check if user is authenticated AND is an admin
  const isAdminAuthenticated = isAuthenticated && isAdmin;

  return (
    <div className="nav-bar">
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
          <Link to="#" className="navbar-brand">MENU</Link>
        {isAdminAuthenticated && (
          <span className="navbar-text text-light ms-2">
            🔐 Admin Logged In
          </span>
        )}

          <button
            type="button"
            className="navbar-toggler"
            data-toggle="collapse"
            data-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse justify-content-between" id="navbarCollapse">
            <div className="navbar-nav mr-auto">
              {isAdminAuthenticated ? (
                <>
                  <NavLink
                    to="/admin/adminHome"
                    end
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Home
                  </NavLink>

                  <NavLink
                    to="/admin/viewJob"
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Jobs
                  </NavLink>

                  <NavLink
                    to="/admin/alumniList"
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Alumni
                  </NavLink>
{/* 
                  <div className="nav-item dropdown">
                    <button
                      type="button"
                      className="nav-link dropdown-toggle btn btn-link p-0"
                      data-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Events
                    </button> */}
                    {/* <div className="dropdown-menu">
                      <NavLink to="/admin/addEvent" className="dropdown-item">
                        ADD EVENTS
                      </NavLink>
                      <NavLink to="/admin/adminViewEvents" className="dropdown-item">
                        VIEW EVENTS
                      </NavLink>
                      <NavLink to="/admin/adminViewAlumniStatus" className="dropdown-item">
                        VIEW ALUMNI STATUS
                      </NavLink>
                    </div>
                  </div> */}
  <div className="nav-item dropdown">
                    <a
                      href="#jobs"
                      className={`nav-link dropdown-toggle${openDropdown === 'jobs' ? ' show' : ''}`}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={openDropdown === 'jobs'}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDropdown('jobs');
                      }}
                    >
                      Events
                    </a>
                    <div className={`dropdown-menu${openDropdown === 'jobs' ? ' show' : ''}`}>
                      <NavLink to="/admin/addEvent" className={dropItemClass} onClick={closeAll}>
                        Add Events
                      </NavLink>
                      <NavLink to="/admin/eventList" className={dropItemClass} onClick={closeAll}>
                        View Events
                      </NavLink>
                      <NavLink to="/admin/confirmationEventList" className={dropItemClass} onClick={closeAll}>
                        Confirmation List
                      </NavLink>
                    </div>
                  </div>
                  <NavLink
                    to="/admin/adminViewForum"
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Forum
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="nav-item nav-link btn btn-link p-0"
                    style={{ border: 'none', background: 'none' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/admin/login"
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Admin Login
                  </NavLink>
                  <NavLink
                    to="/"
                    className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}
                  >
                    Home
                  </NavLink>
                </>
              )}
            </div>

            <div className="ml-auto">
              {isAdminAuthenticated && (
                <>
                  {/* <button 
                    onClick={refresh} 
                    className="btn btn-outline-light me-2"
                    title="Refresh authentication status"
                  >
                    🔄
                  </button> */}
                  <Link className="btn" to="#">Contact</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
export default AdminNavBar;
