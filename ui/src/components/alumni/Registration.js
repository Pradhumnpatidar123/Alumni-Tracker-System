import React, { useMemo, useState } from 'react';
import { API_ALUMNI_URL } from '../../utils';
import { useNavigate } from 'react-router-dom';

const initial = {
  username: '',
  email: '',
  password: '',
  contect: '',
  dob: '',
  gender: '',
  passOutYear: '',
  stream: '',
  branch: '',
  experience: '',
  currentCompany: '',
  designation: '',
  profile: null, // File
  linkedInProfileLink: '',
};

function getValidationErrors(values) {
  const e = {};
  if (!values.username.trim()) e.username = 'Username is required';
  if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = 'Valid email required';
  if (!values.password || values.password.length < 6) e.password = 'Min 6 characters';
  if (!/^\d{10}$/.test(values.contect)) e.contect = 'Enter 10-digit mobile';
  if (!values.dob) e.dob = 'Date of birth required';
  if (!values.gender) e.gender = 'Select gender';
  const thisYear = new Date().getFullYear();
  const y = Number(values.passOutYear);
  if (!y || y < 1970 || y > thisYear + 1) e.passOutYear = 'Enter a valid year';
  if (!values.stream) e.stream = 'Select stream';
  if (!values.branch) e.branch = 'Select branch';
  if (values.linkedInProfileLink) {
    try {
      const u = new URL(values.linkedInProfileLink);
      if (!u.hostname.includes('linkedin.')) e.linkedInProfileLink = 'Provide a LinkedIn URL';
    } catch {
      e.linkedInProfileLink = 'Provide a valid URL';
    }
  }
  return e;
}

export default function AlumniRegistration({ onSuccess }) {
  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate = useNavigate();
  const setFieldError = (name, nextValues) => {
    const all = getValidationErrors(nextValues);
    setErrors((prev) => ({ ...prev, [name]: all[name] }));
  };

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    const nextValue = type === 'file' ? (files && files[0] ? files[0] : null) : value;
    
    // Handle profile image preview
    if (name === 'profile' && files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setProfilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setProfilePreview(null);
        alert('Please select a valid image file');
        return;
      }
    } else if (name === 'profile' && !files) {
      setProfilePreview(null);
    }
    
    setFormData((s) => {
      const updated = { ...s, [name]: nextValue };
      setFieldError(name, updated);
      return updated;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldError(name, formData);
  };

  const allErrors = useMemo(() => getValidationErrors(formData), [formData]);

  const isValid =
    Object.keys(allErrors).length === 0 &&
    formData.username &&
    formData.email &&
    formData.password &&
    formData.contect &&
    formData.dob &&
    formData.gender &&
    formData.passOutYear &&
    formData.stream &&
    formData.branch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const all = getValidationErrors(formData);
    setErrors(all);
    setTouched(Object.keys(formData).reduce((acc, k) => ((acc[k] = true), acc), {}));
    if (Object.keys(all).length > 0) return;

    setSubmitting(true);
    setServerMsg('');
    try {
      const body = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) body.append(k, v);
      });

      const res = await fetch(API_ALUMNI_URL+'/alumniRegistration', {
        method: 'POST',
        body, // let the browser set multipart boundary
        credentials: 'include',
      });
      
      

      const data = await res.json().catch(() => null);
      if (res.ok) {
        setServerMsg(data.message);
        if (onSuccess) onSuccess(data);

        setFormData(initial);
        setErrors({});
        setTouched({});
        navigate('/login', { state: { message: data.message } });
      } else {
        setServerMsg((data && data.message) || 'Registration failed.');
      }
    } catch {
      setServerMsg('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initial);
    setErrors({});
    setTouched({});
    setServerMsg('');
    setProfilePreview(null);
  };

  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <form
        action="/alumni/alumniRegistration"
        className="form-group"
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        noValidate
      >
        <div className="container">
          <div className="row align-items-start">
            <div className="section-header text-left w-100">
              <h3>Alumni Registration</h3>
              <span className="text-primary">{serverMsg}</span>
            </div>

            {/* Left column */}
            <div className="col-lg-6 col-md-6">
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className={`form-control ${touched.username && errors.username ? 'is-invalid' : ''}`}
                  name="username"
                  id="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.username && errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  id="email"
                  placeholder="Enter Email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.email && errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                  name="password"
                  id="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.password && errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="contect" className="form-label">Mobile Number</label>
                <input
                  type="text"
                  className={`form-control ${touched.contect && errors.contect ? 'is-invalid' : ''}`}
                  name="contect"
                  id="contect"
                  placeholder="Enter 10-digit number"
                  value={formData.contect}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.contect && errors.contect && (
                  <div className="invalid-feedback">{errors.contect}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className={`form-control ${touched.dob && errors.dob ? 'is-invalid' : ''}`}
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.dob && errors.dob && (
                  <div className="invalid-feedback">{errors.dob}</div>
                )}
              </div>

              <div className="mb-3">
                <span className="form-label d-block mb-1">Gender</span>
                <div className="d-flex align-items-center gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="male"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={submitting}
                      required
                    />
                    <label className="form-check-label" htmlFor="male">Male</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="female"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={submitting}
                      required
                    />
                    <label className="form-check-label" htmlFor="female">Female</label>
                  </div>
                </div>
                {touched.gender && errors.gender && (
                  <div className="text-danger small mt-1">{errors.gender}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="passOutYear" className="form-label">Pass Out Year</label>
                <input
                  type="number"
                  className={`form-control ${touched.passOutYear && errors.passOutYear ? 'is-invalid' : ''}`}
                  name="passOutYear"
                  id="passOutYear"
                  placeholder="Enter Pass Out Year"
                  value={formData.passOutYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                />
                {touched.passOutYear && errors.passOutYear && (
                  <div className="invalid-feedback">{errors.passOutYear}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="stream" className="form-label">Stream</label>
                <select
                  name="stream"
                  id="stream"
                  className={`form-control ${touched.stream && errors.stream ? 'is-invalid' : ''}`}
                  value={formData.stream}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Stream</option>
                  <option value="BTech">BTech</option>
                  <option value="MTech">MTech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BSC">BSC</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                </select>
                {touched.stream && errors.stream && (
                  <div className="invalid-feedback">{errors.stream}</div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="col-lg-6 col-md-6">
              <div className="mb-3">
                <label htmlFor="branch" className="form-label">Branch</label>
                <select
                  name="branch"
                  id="branch"
                  className={`form-control ${touched.branch && errors.branch ? 'is-invalid' : ''}`}
                  value={formData.branch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  required
                >
                  <option value="">Select branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Business Administration">Business Administration</option>
                  <option value="HR">HR</option>
                </select>
                {touched.branch && errors.branch && (
                  <div className="invalid-feedback">{errors.branch}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="experience" className="form-label">Experience</label>
                <select
                  name="experience"
                  id="experience"
                  className="form-control"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                >
                  <option value="">Select Experience</option>
                  <option value="6 Month">6 Month</option>
                  <option value="1+ Years">1+ Year</option>
                  <option value="3+ Years">3+ Years</option>
                  <option value="5+ Years">5+ Years</option>
                  <option value="10+ Years">10+ Years</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="currentCompany" className="form-label">Current Company</label>
                <input
                  type="text"
                  className="form-control"
                  name="currentCompany"
                  id="currentCompany"
                  placeholder="Enter Current Company"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="designation" className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-control"
                  name="designation"
                  id="designation"
                  placeholder="Enter Designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="profile" className="form-label">Upload Profile Picture</label>
                <div className="row">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      name="profile"
                      id="profile"
                      accept="image/*"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={submitting}
                    />
                    <small className="text-muted">Accepted formats: JPG, PNG, GIF (Max 5MB)</small>
                  </div>
                  <div className="col-md-4">
                    {profilePreview ? (
                      <div className="text-center">
                        <img 
                          src={profilePreview} 
                          alt="Profile Preview" 
                          className="img-thumbnail"
                          style={{
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                        />
                        <div className="mt-1">
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setFormData(prev => ({...prev, profile: null}));
                              setProfilePreview(null);
                              document.getElementById('profile').value = '';
                            }}
                            disabled={submitting}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted">
                        <div 
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '2px dashed #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                          }}
                        >
                          <i className="fas fa-user fa-2x"></i>
                        </div>
                        <small>No image selected</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="linkedInProfileLink" className="form-label">LinkedIn Profile Link</label>
                <input
                  type="url"
                  className={`form-control ${touched.linkedInProfileLink && errors.linkedInProfileLink ? 'is-invalid' : ''}`}
                  name="linkedInProfileLink"
                  id="linkedInProfileLink"
                  placeholder="Enter LinkedIn Profile Link"
                  value={formData.linkedInProfileLink}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                />
                {touched.linkedInProfileLink && errors.linkedInProfileLink && (
                  <div className="invalid-feedback">{errors.linkedInProfileLink}</div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-warning btn-block w-100"
                  disabled={submitting || !isValid}
                >
                  {submitting ? 'Submitting…' : 'Add Alumni'}
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-block w-100"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Reset
                </button>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
