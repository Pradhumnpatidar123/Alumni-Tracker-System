import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AboutLogin({ message: initialMessage = '', useFetchMode = false }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(initialMessage);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    try {
      const result = await loginAdmin(email, password);
      
      if (result.success) {
        navigate('/admin/adminhome', { replace: true });
        return;
      } else {
        setMsg(result.message || 'Login failed, please check credentials.');
      }
    } catch (err) {
      setMsg('Network error, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Basic client-side required validation for UX
  const emailInvalid = !email || !/\S+@\S+\.\S+/.test(email);
  const passwordInvalid = !password;
  const canSubmit = !emailInvalid && !passwordInvalid && !submitting;

  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-5 col-md-6">
            <div className="about-img">
              <img src="/img/adminVector.jpg" alt="Admin Illustration" />
            </div>
          </div>
          <div className="col-lg-7 col-md-6">
            <div className="section-header text-left">
              <h3>Admin panel | Login</h3>
              <span role="alert" aria-live="polite" className="text-danger">
                {msg}
              </span>
            </div>
            <div className="about-text">
                  
                <form className="form-group" onSubmit={handleSubmit} noValidate>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    aria-invalid={emailInvalid ? 'true' : 'false'}
                    required
                  />
                  <br />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    aria-invalid={passwordInvalid ? 'true' : 'false'}
                    required
                  />
                  <br />
                  <button
                    type="submit"
                    className="btn btn-warning w-100 btn-block"
                    disabled={!canSubmit}
                  >
                    {submitting ? 'Logging in…' : 'Login'}
                  </button>
                  <br />
                  <br />
                  <button
                    type="button"
                    className="btn btn-danger w-100 btn-block"
                    onClick={() => {
                      setEmail('');
                      setPassword('');
                      setMsg('');
                    }}
                    disabled={submitting}
                  >
                    Reset
                  </button>
                </form>
              
              {/* Optional inline helper text for validation */}
              {useFetchMode && (
                <small className="form-text text-muted">
                  Use a valid email and password. The login button enables when inputs are valid.
                </small>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutLogin;
