import React, { useEffect, useMemo, useState } from 'react';
import { API_ADMIN_URL, API_URL } from '../../utils';

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function AlumniList({ initialMessage = '' }) {
  const [alumni, setAlumni] = useState([]);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const dq = useDebounce(q, 300);

  async function fetchAlumni(signal) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (dq) params.set('q', dq);

      const res = await fetch(`${API_URL}/admin/alumniList?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (!res.ok) {
        throw new Error(`Failed to load: ${res.status}`);
      }

      const data = await res.json();
      console.log('Fetched alumni data:', data);
      // Expecting { items: [], total: number } shape; adapt if backend differs
      setAlumni(Array.isArray(data.items) ? data.items : []);
      // Optionally read server message
      if (data.message) setMessage(data.message);
    } catch (e) {
      if (e.name !== 'AbortError') setError('Could not load alumni. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const c = new AbortController();
    fetchAlumni(c.signal);
    return () => c.abort();
  }, [page, pageSize, dq]);

  const filtered = useMemo(() => {
    if (!dq) return alumni;
    const s = dq.toLowerCase();
    return alumni.filter((a) => {
      return (
        String(a.username || '').toLowerCase().includes(s) ||
        String(a.email || '').toLowerCase().includes(s) ||
        String(a.currentCompany || '').toLowerCase().includes(s)
      );
    });
  }, [alumni, dq]);

  async function verifyAlumni(alumniId) {
    try {
      const res = await fetch(API_ADMIN_URL+'/adminVerifyAlumni', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ alumniId }),
      });
      if (!res.ok) throw new Error('Verify failed');
      // Optimistic update
      setAlumni((prev) =>
        prev.map((a) => (a.alumniId === alumniId ? { ...a, adminVerify: 'verified' } : a))
      );
      setMessage('Alumni verified.');
    } catch {
      setMessage('Verification failed.');
    }
  }

  const columns = [
    { key: 'idx', label: 'S.no', width: 80 },
    { key: 'alumniId', label: 'Alumni ID', width: 140 },
    { key: 'username', label: 'Username', width: 180 },
    { key: 'email', label: 'Email', width: 240 },
    { key: 'contect', label: 'Contact', width: 140 },
    { key: 'dob', label: 'DOB', width: 140 },
    { key: 'gender', label: 'Gender', width: 120 },
    { key: 'passOutYear', label: 'PassOut Year', width: 140 },
    { key: 'stream', label: 'Stream', width: 140 },
    { key: 'branch', label: 'Branch', width: 140 },
    { key: 'experience', label: 'Experience', width: 140 },
    { key: 'currentCompany', label: 'Current Company', width: 200 },
    { key: 'designation', label: 'Designation', width: 180 },
    { key: 'profile', label: 'Profile', width: 120 },
    { key: 'linkedInProfileLink', label: 'LinkedIn Link', width: 220 },
    { key: 'emailVerify', label: 'Email Verify', width: 140 },
    { key: 'adminVerify', label: 'Admin Verify', width: 160 },
  ];

  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="section-header text-left">
          <h3>Alumni Lists</h3>
          <span className="text-danger">{message}</span>
        </div>

        <div className="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
          <input
            type="search"
            className="form-control"
            placeholder="Search by name, email, company..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 420 }}
            aria-label="Search alumni"
          />
          <div className="d-flex align-items-center gap-2" style={{ marginTop: 8 }}>
            <label htmlFor="pageSize" className="mr-2 mb-0">Rows:</label>
            <select
              id="pageSize"
              className="form-control"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: 100 }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {loading && <div className="alert alert-info">Loading alumni…</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="alert alert-secondary">No Record Found</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table table-bordered table-striped mb-0 align-middle" style={{ fontSize: 13, minWidth: 1200 }}>
              <thead className="thead-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} style={{ whiteSpace: 'nowrap', minWidth: c.width }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((obj, idx) => (
                  <tr key={obj.alumniId || idx}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{obj.alumniId}</td>
                    <td>{obj.username}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{obj.email}</td>
                    <td>{obj.contect}</td>
                    <td>{obj.dob}</td>
                    <td>{obj.gender}</td>
                    <td>{obj.passOutYear}</td>
                    <td>{obj.stream}</td>
                    <td>{obj.branch}</td>
                    <td>{obj.experience}</td>
                    <td>{obj.currentCompany}</td>
                    <td>{obj.designation}</td>
                    <td>
                      {obj.profile ? (
                        <img
                          src={`/img/${obj.profile}`}
                          alt={`${obj.username || 'Alumni'} profile`}
                          height="56"
                          width="56"
                          style={{ objectFit: 'cover', borderRadius: 8 }}
                        />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {obj.linkedInProfileLink ? (
                        <a
                          href={obj.linkedInProfileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      {String(obj.emailVerify) === 'verified' || obj.emailVerify === true
                        ? <span style={{color:'green'}}>Verified</span>
                        : <span style={{color:'red'}}>Pending</span>}
                    </td>
                    <td>
                      {obj.adminVerify === 'verified' ? (
                        <span  style={{color:'green'}}>Verified</span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => verifyAlumni(obj.alumniId)}
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple pagination controls */}
        <div className="d-flex align-items-center justify-content-between mt-3">
          <button
            className="btn btn-outline-primary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-muted">Page {page}</span>
          <button
            className="btn btn-outline-primary"
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
