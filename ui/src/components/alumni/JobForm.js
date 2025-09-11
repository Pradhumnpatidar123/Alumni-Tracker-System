import React, { useEffect, useState } from 'react';
import { API_ALUMNI_URL } from '../../utils';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

function JobForm() {
  const [form, setForm] = useState({
    company: '',
    post: '',
    department: '',
    vacancy: '',
    salary: '',
    location: '',
    bond: '',
    timings: '',
    applyFromDate: '',
    applyTillDate: '',
    mode: '',
    type: '',

  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = location.state?.jobId;
  const { user } = useAuth();
  const email = user?.email;
  console.log(email);
  useEffect(() => {
    if (jobId) {
      // Fetch existing job data to populate form for editing
      fetch(`${API_ALUMNI_URL}/alumniUpdateJob`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, jobId }),
      }).then(res => res.json())
        .then(data => {
          if (data && data.job) {
            setForm({
              company: data.job.company || '',
              post: data.job.post || '',
              department: data.job.department || '',
              vacancy: data.job.vacancy || '',
              salary: data.job.salary || '',
              location: data.job.location || '',
              bond: data.job.bond || '',
              timings: data.job.timings || '',
              applyFromDate: data.job.applyFromDate ? data.job.applyFromDate.split('T')[0] : '',
              applyTillDate: data.job.applyTillDate ? data.job.applyTillDate.split('T')[0] : '',
              mode: data.job.mode || '',
              type: data.job.type || '',
            })
          }
        })
        .catch(err => {
          console.error('Error fetching job data:', err);
          setMessage('Error loading job data for editing.');
        });
    }
  }, [jobId, email]);
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    // Basic checks similar to required fields; extend as needed
    if (!form.company || !form.post || !form.department || !form.location) return 'Please fill all required fields.';
    if (!form.applyFromDate || !form.applyTillDate) return 'Please select apply dates.';
    if (new Date(form.applyFromDate) > new Date(form.applyTillDate)) return 'Apply From Date must be before Apply Till Date.';
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }
    try {
      setSubmitting(true);
      setMessage('');
      if (jobId) {
        // Update existing job
        const res = await fetch(API_ALUMNI_URL + '/alumniJobUpdate', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form,email, jobId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setMessage(data?.message || 'Job updated successfully.');
          setForm({
            company: '',
            post: '',
            department: '',
            vacancy: '',
            salary: '',
            location: '',
            bond: '',
            timings: '',
            applyFromDate: '',
            applyTillDate: '',
            mode: '',
            type: '',
          });
          navigate('/alumnijobview');
        } else {
          setMessage(data?.message || 'Failed to update job posting.');
        }
      } else {
        // Create new job
        // If backend expects URL-encoded form, switch to URLSearchParams
        const res = await fetch(API_ALUMNI_URL + '/alumniJobHosting', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ form, email }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setMessage(data?.message || 'Job posted successfully.');
          setForm({
            company: '',
            post: '',
            department: '',
            vacancy: '',
            salary: '',
            location: '',
            bond: '',
            timings: '',
            applyFromDate: '',
            applyTillDate: '',
            mode: '',
            type: '',
          });
        } else {
          setMessage(data?.message || 'Failed to submit job posting.');
        }
      }
    } catch (error) {
      setMessage('Network error while submitting job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="section-header text-left">
          <h3>Alumni Add Job Posting</h3>
          <small style={{ color: 'green' }}>
            <span>{message}</span>
          </small>
        </div>

        <div className="card shadow-sm border-0" style={{ marginTop: '-30px', marginBottom: '20px' }}>
          <div className="card-body" style={{ padding: '15px' }}>
            <form onSubmit={onSubmit} className="form-group">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="mb-2">
                    <label htmlFor="company" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Company</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="company"
                      name="company"
                      placeholder="Enter Company Name"
                      value={form.company}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="post" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Post</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="post"
                      name="post"
                      placeholder="Enter Post Name"
                      value={form.post}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="department" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Department</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="department"
                      name="department"
                      placeholder="Enter Department"
                      value={form.department}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="vacancy" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Vacancy</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="vacancy"
                      name="vacancy"
                      placeholder="Enter Number of Vacancy"
                      value={form.vacancy}
                      onChange={onChange}
                      min="0"
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="salary" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Salary</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="salary"
                      name="salary"
                      placeholder="Enter Salary"
                      value={form.salary}
                      onChange={onChange}
                      min="0"
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="location" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Location</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      id="location"
                      name="location"
                      placeholder="Enter Location"
                      value={form.location}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label htmlFor="bond" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Bond</label>
                    <select
                      name="bond"
                      id="bond"
                      className="form-control"
                      style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                      value={form.bond}
                      onChange={onChange}
                    >
                      <option value="">Select Bond (If Any)</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>


                </div>

                <div className="col-lg-6 col-md-6">
                  <div className="about-text">
                    <div className="mb-2">
                      <label htmlFor="timings" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Timings</label>
                      <select
                        name="timings"
                        id="timings"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                        value={form.timings}
                        onChange={onChange}
                      >
                        <option value="">Select Timings</option>
                        <option value="8:00 AM To 4:00 PM">8:00 AM To 4:00 PM</option>
                        <option value="9:00 AM To 6:00 PM">9:00 AM To 6:00 PM</option>
                        <option value="10:00 AM To 7:00 PM">10:00 AM To 7:00 PM</option>
                        <option value="11:00 AM To 8:00 PM">11:00 AM To 8:00 PM</option>
                        <option value="Flexible 9 Hour">Flexible 9 Hour</option>
                        <option value="Hours According to Part Time">Hours According to Part Time</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label htmlFor="applyFromDate" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Apply From Date</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                        id="applyFromDate"
                        name="applyFromDate"
                        value={form.applyFromDate}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="applyTillDate" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Apply Till Date</label>
                      <input
                        type="date"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                        id="applyTillDate"
                        name="applyTillDate"
                        value={form.applyTillDate}
                        onChange={onChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label htmlFor="mode" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Experience</label>
                      <select
                        name="mode"
                        id="mode"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                        value={form.mode}
                        onChange={onChange}
                      >
                        <option value="">Select Mode</option>
                        <option value="Fresher">Fresher</option>
                        <option value="6+ Month">6+ Month</option>
                        <option value="1+ Year">1+ Year</option>
                        <option value="2+ Year">2+ Year</option>
                        <option value="5+ Year">5+ Year</option>
                        <option value="10+ Year">10+ Year</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label htmlFor="type" className="form-label" style={{ fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>Employment Type</label>
                      <select
                        name="type"
                        id="type"
                        className="form-control"
                        style={{ padding: '6px 10px', fontSize: '14px', height: '32px' }}
                        value={form.type}
                        onChange={onChange}
                      >
                        <option value="">Select Type</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                      </select>
                    </div>

                    <div className="d-grid gap-2" style={{ marginTop: '15px' }}>
                      <button type="submit" className="btn btn-warning btn-block" style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }} disabled={submitting}>
                        {submitting ? 'Submitting…' : 'Add Job Posting'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-block"
                        style={{ padding: '8px 16px', fontSize: '14px', fontWeight: '500' }}
                        onClick={() =>
                          setForm({
                            company: '',
                            post: '',
                            department: '',
                            vacancy: '',
                            salary: '',
                            location: '',
                            bond: '',
                            timings: '',
                            applyFromDate: '',
                            applyTillDate: '',
                            mode: '',
                            type: '',
                          })
                        }
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
        </div>

      </div>
    </div>
  );
}

export default JobForm;
