import React, { useEffect, useMemo, useState } from "react";
import { API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


function JobsList() {
  // Always start with arrays to keep filtering safe
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
    const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_ALUMNI_URL + "/alumniViewJob", {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const next = Array.isArray(data?.jobData) ? data.jobData : []; // normalize to array. [9]
        setRows(next);
      } catch (e) {
        console.error("Failed to fetch job data:", e);
        setRows([]); // keep an array shape on failure. [9]
      }
    }
    fetchData();
  }, [email]);

  const searchable = (text) => (text ?? "").toString().toLowerCase();

  const filtered = useMemo(() => {
    const src = Array.isArray(rows) ? rows : [];
    const q = (query || "").trim().toLowerCase();
    if (!q) return src;
    return src.filter((r) => {
      return (
        searchable(r?.company).includes(q) ||
        searchable(r?.post).includes(q) ||
        searchable(r?.department).includes(q) ||
        searchable(r?.location).includes(q) ||
        searchable(r?.status).includes(q) ||
        searchable(r?.mode).includes(q) ||
        searchable(r?.type).includes(q) ||
        searchable(r?.jobId).includes(q) ||
        searchable(r?.alumniId).includes(q)
      );
    });
  }, [rows, query]);
  
  const handleUpdate = async (jobId) => {
    // try {
    //   setBusyId(jobId);
    //   const res = await fetch("/alumni/alumniUpdateJob", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json", Accept: "application/json" },
    //     body: JSON.stringify({ jobId }),
    //   });
    //   if (!res.ok) throw new Error(await res.text());
    //   alert("Update request submitted.");
    // } catch (e) {
    //   alert(`Update failed: ${e.message}`);
    // } finally {
        //   setBusyId(null);
        // }
        navigate('/jobform', { state: { jobId } });
  };

  const handleDelete = async (jobId) => {
    const jobToDelete = rows.find(job => job.jobId === jobId);
    const confirmMessage = `Are you sure you want to delete this job posting?\n\nCompany: ${jobToDelete?.company || 'N/A'}\nPosition: ${jobToDelete?.post || 'N/A'}\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setBusyId(jobId);
      const res = await fetch(API_ALUMNI_URL+"/alumniDeleteJob", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRows((prev) => (Array.isArray(prev) ? prev.filter((r) => r?.jobId !== jobId) : [])); // guard. [9]
      
      // Show success message
      const successMsg = `Job posting "${jobToDelete?.post || 'Job'}" has been successfully deleted.`;
      if (window.alert) {
        window.alert(successMsg);
      }
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  // Hardened: always coerce to string prior to lowercasing. [1]
  const statusClass = (s) => {
    const raw = Array.isArray(s) ? s : s;
    const v = String(raw ?? "").toLowerCase();
    if (v === "1" || v === "true") return "badge badge--ok";
    if (v === "0" || v === "false") return "badge badge--muted";
    if (v.includes("open") || v.includes("active")) return "badge badge--ok";
    if (v.includes("closed") || v.includes("inactive")) return "badge badge--muted";
    if (v.includes("urgent")) return "badge badge--warn";
    return "badge";
  };

  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="section-header text-center">
          <h2>Alumni Job Listings</h2>
        </div>
        <section className="jobs-section">
          <style>{css}</style>

          <header className="header">
            <div className="tools">
              <input
                type="search"
                className="search"
                placeholder="Search company, post, location, status…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search jobs"
              />
              <div className="count" aria-live="polite">
                {Array.isArray(filtered) ? filtered.length : 0} records
              </div>
            </div>
          </header>

          {(!Array.isArray(filtered) || filtered.length === 0) ? (
            <div className="empty">No Record Found</div>
          ) : (
            <div className="table-wrap" role="region" aria-label="Jobs table" tabIndex={0}>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">S.no</th>
                <th scope="col">JobId</th>
                <th scope="col">AlumniId</th>
                <th scope="col">Company</th>
                <th scope="col">Post</th>
                <th scope="col">Department</th>
                <th scope="col">Vacancy</th>
                <th scope="col">Salary</th>
                <th scope="col">Location</th>
                <th scope="col">Bond</th>
                <th scope="col">Timings</th>
                <th scope="col">Apply From</th>
                <th scope="col">Apply Till</th>
                <th scope="col">Mode</th>
                <th scope="col">Type</th>
                <th scope="col">Post Date</th>
                <th scope="col">Post Time</th>
                <th scope="col">Status</th>
                <th scope="col">Update</th>
                <th scope="col">Delete</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((obj, index) => (
                <tr key={obj?.jobId ?? `${index}-${obj?.company ?? "row"}`}>
                  <td>{index + 1}</td>
                  <td>{obj?.jobId}</td>
                  <td>{obj?.alumniId}</td>
                  <td className="truncate">{obj?.company}</td>
                  <td className="truncate">{obj?.post}</td>
                  <td className="truncate">{obj?.department}</td>
                  <td>{obj?.vacancy}</td>
                  <td className="nowrap">{obj?.salary}</td>
                  <td className="truncate">{obj?.location}</td>
                  <td className="truncate">{obj?.bond}</td>
                  <td className="truncate">{obj?.timings}</td>
                  <td className="nowrap">{obj?.applyFromDate}</td>
                  <td className="nowrap">{obj?.applyTillDate}</td>
                  <td>{obj?.mode}</td>
                  <td>{obj?.type}</td>
                  <td className="nowrap">{obj?.postDate}</td>
                  <td className="nowrap">{obj?.postTime}</td>
                  <td>
                    <span className={statusClass(obj?.status)}>{String(obj?.status ?? "")}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--primary"
                      onClick={() => handleUpdate(obj?.jobId)}
                      disabled={busyId === obj?.jobId}
                      aria-label={`Update job ${obj?.jobId}`}
                      title="Edit job details"
                    >
                      {busyId === obj?.jobId ? (
                        <span className="spinner">⟳</span>
                      ) : (
                        <>
                          <i className="fas fa-edit" style={{fontSize: '10px', marginRight: '3px'}}></i>
                          Edit
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--danger"
                      onClick={() => handleDelete(obj?.jobId)}
                      disabled={busyId === obj?.jobId}
                      aria-label={`Delete job ${obj?.jobId}`}
                      title="Delete this job posting"
                    >
                      {busyId === obj?.jobId ? (
                        <span className="spinner">⟳</span>
                      ) : (
                        <>
                          <i className="fas fa-trash" style={{fontSize: '10px', marginRight: '3px'}}></i>
                          Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </section>
      </div>
    </div>
  );
}

// Optimized CSS with proper layout management
const css = `
/* Main section styling with compact margins and centering */
.jobs-section { 
  display: grid; 
  gap: 10px; 
  max-width: 100%; 
  margin: 0 auto;
  padding: 15px 0;
}

/* Header with reduced spacing */
.header { 
  display: grid; 
  gap: 8px; 
  margin-bottom: 8px;
  padding: 0 10px;
  background: white;
  z-index: 10;
}

/* Tools section with compact layout */
.tools { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  gap: 8px; 
  flex-wrap: wrap;
  padding: 6px 0;
}

.search { 
  flex: 1 1 250px; 
  max-width: 400px; 
  padding: 6px 10px; 
  border: 2px solid #e5e7eb; 
  border-radius: 6px;
  font-size: 13px;
  height: 32px;
  transition: border-color 0.3s;
}

.search:focus {
  outline: none;
  border-color: #fdbe33;
}

.count { 
  font-size: 0.8rem; 
  color: #666666;
  font-weight: 500;
  white-space: nowrap;
}

/* Table wrapper with compact margins */
.table-wrap { 
  width: 100%; 
  overflow-x: auto; 
  border: 2px solid #e5e7eb; 
  border-radius: 8px;
  margin: 0 auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.table { 
  width: 100%; 
  border-collapse: collapse; 
  font-size: 0.8rem;
  background: white;
}

caption { 
  caption-side: top; 
  padding: 6px 8px; 
  font-weight: 600; 
}

/* Compact header styling */
thead th { 
  position: sticky; 
  top: 0; 
  background: #030f27; 
  color: white;
  z-index: 1;
  font-weight: 600;
  text-align: center;
  padding: 8px 6px;
  font-size: 12px;
}

th, td { 
  border: 1px solid #e5e7eb; 
  padding: 6px 8px; 
  text-align: left; 
  vertical-align: middle;
  font-size: 11px;
  line-height: 1.2;
}

/* Row styling */
tbody tr:nth-of-type(even) { 
  background: #f8f9fa; 
}

tbody tr:hover {
  background: #e8f4fd;
  transition: background-color 0.2s;
}

/* Compact badge styling */
.badge { 
  display: inline-block; 
  padding: 2px 6px; 
  border-radius: 999px; 
  background: #eef2ff; 
  color: #3730a3; 
  font-size: 0.7rem; 
  white-space: nowrap;
  font-weight: 500;
  line-height: 1;
}

.badge--ok { 
  background: #ecfdf5; 
  color: #065f46; 
}

.badge--warn { 
  background: #fef3c7; 
  color: #92400e; 
}

.badge--muted { 
  background: #f3f4f6; 
  color: #374151; 
}

/* Compact button styling with enhanced interactions */
.btn { 
  appearance: none; 
  border: none; 
  padding: 4px 8px; 
  border-radius: 4px; 
  cursor: pointer; 
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 60px;
  height: 26px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  position: relative;
  overflow: hidden;
}

.btn:before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover:not(:disabled):before {
  left: 100%;
}

.btn--primary { 
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white; 
  border: 1px solid #1e40af;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
}

.btn--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn--primary:disabled { 
  background: #93c5fd; 
  cursor: not-allowed;
  box-shadow: none;
  border-color: #93c5fd;
}

.btn--danger { 
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white; 
  border: 1px solid #b91c1c;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.btn--danger:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.btn--danger:disabled { 
  background: #fca5a5; 
  cursor: not-allowed;
  box-shadow: none;
  border-color: #fca5a5;
}

/* Spinner animation */
.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  font-size: 12px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Compact text utilities */
.truncate { 
  max-width: 120px; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

.nowrap { 
  white-space: nowrap; 
}

td { 
  word-break: break-word; 
}

/* Compact empty state styling */
.empty { 
  padding: 20px 15px; 
  border: 2px dashed #e5e7eb; 
  border-radius: 8px; 
  color: #6b7280; 
  text-align: center;
  font-size: 0.9rem;
  margin: 15px auto;
  max-width: 300px;
}

/* Responsive design with compact spacing */
@media (max-width: 1200px) {
  .jobs-section {
    padding: 10px 5px;
  }
  
  .header {
    padding: 0 5px;
  }
}

@media (max-width: 768px) {
  .jobs-section {
    gap: 8px;
    padding: 8px 3px;
  }
  
  .header {
    padding: 0 3px;
  }
  
  .tools {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 4px 0;
  }
  
  .search {
    max-width: 100%;
    height: 28px;
    padding: 4px 8px;
    font-size: 12px;
  }
  
  th, td { 
    padding: 4px 6px; 
    font-size: 10px; 
  }
  
  .table { 
    min-width: 980px; 
  }
  
  .truncate {
    max-width: 80px;
  }
  
  .btn {
    padding: 3px 6px;
    font-size: 0.65rem;
    min-width: 50px;
    height: 22px;
    gap: 1px;
  }
  
  .btn i {
    font-size: 8px !important;
    margin-right: 2px !important;
  }
}

@media (max-width: 480px) {
  .empty {
    padding: 15px 10px;
    font-size: 0.8rem;
  }
  
  .count {
    font-size: 0.75rem;
  }
}
`;

export default JobsList;
