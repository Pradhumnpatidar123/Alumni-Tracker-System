import React, { useEffect, useMemo, useState } from "react";
import { API_ADMIN_URL, API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminJobsList() {
  // Always start with arrays to keep filtering safe
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_ADMIN_URL + "/adminViewJob", {
        
          credentials: 'include',
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const next = Array.isArray(data?.jobData) ? data.jobData : [];
        setRows(next);
        setMessage(data?.message || "");
      } catch (e) {
        console.error("Failed to fetch job data:", e);
        setRows([]);
        setMessage("Failed to load job data");
      }
    }
    fetchData();
  }, [email]);

  const searchable = (text) => (text ?? "").toString().toLowerCase();

  const filtered = useMemo(() => {
    let src = Array.isArray(rows) ? rows : [];
    const q = (query || "").trim().toLowerCase();
    
    // Apply status filter
    if (statusFilter !== "all") {
      src = src.filter((r) => {
        const status = searchable(r?.status);
        if (statusFilter === "active") return status === "1" || status === "true" || status.includes("active") || status.includes("open");
        if (statusFilter === "inactive") return status === "0" || status === "false" || status.includes("inactive") || status.includes("closed");
        return true;
      });
    }
    
    // Apply search filter
    if (q) {
      src = src.filter((r) => {
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
    }
    
    // Apply sorting
    if (sortConfig.key) {
      src.sort((a, b) => {
        const aVal = a?.[sortConfig.key] ?? "";
        const bVal = b?.[sortConfig.key] ?? "";
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return src;
  }, [rows, query, statusFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleApprove = async (jobId) => {
    if (!window.confirm("Approve this job posting?")) return;
    try {
      setBusyId(jobId);
      const res = await fetch(API_ALUMNI_URL + "/adminApproveJob", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ jobId, status: "1" }),
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Update local state
      setRows((prev) => 
        Array.isArray(prev) 
          ? prev.map((r) => r?.jobId === jobId ? { ...r, status: "1" } : r)
          : []
      );
      setMessage("Job approved successfully");
    } catch (e) {
      alert(`Approval failed: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm("Reject this job posting?")) return;
    try {
      setBusyId(jobId);
      const res = await fetch(API_ALUMNI_URL + "/adminRejectJob", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ jobId, status: "0" }),
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Update local state
      setRows((prev) => 
        Array.isArray(prev) 
          ? prev.map((r) => r?.jobId === jobId ? { ...r, status: "0" } : r)
          : []
      );
      setMessage("Job rejected successfully");
    } catch (e) {
      alert(`Rejection failed: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Permanently delete this job posting?")) return;
    try {
      setBusyId(jobId);
      const res = await fetch(API_ALUMNI_URL + "/adminDeleteJob", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error(await res.text());
      
      setRows((prev) => (Array.isArray(prev) ? prev.filter((r) => r?.jobId !== jobId) : []));
      setMessage("Job deleted successfully");
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setBusyId(null);
    }
  };



  const statusClass = (s) => {
    const raw = Array.isArray(s) ? s : s;
    const v = String(raw ?? "").toLowerCase();
    if (v === "1" || v === "true" || v.includes("approved") || v.includes("active")) return "badge badge--ok";
    if (v === "0" || v === "false" || v.includes("rejected") || v.includes("inactive")) return "badge badge--danger";
    if (v.includes("pending")) return "badge badge--warn";
    return "badge";
  };

  const getStatusText = (s) => {
    const v = String(s ?? "").toLowerCase();
    if (v === "1" || v === "true") return "Approved";
    if (v === "0" || v === "false") return "Rejected";
    if (v.includes("pending")) return "Pending";
    return s || "Unknown";
  };



  return (
    <div className="about wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        <div className="section-header text-center">
          <h2>Admin Job Management</h2>
          {message && (
            <div className={`alert ${message.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
              {message}
            </div>
          )}
        </div>
        <section className="jobs-section">
          <style>{css}</style>

          <header className="header">
            <div className="tools">
              <input
                type="search"
                className="search"
                placeholder="Search company, post, location, jobId, alumniId…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search jobs"
              />
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Approved</option>
                <option value="inactive">Rejected</option>
              </select>
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
                    <th scope="col" onClick={() => handleSort('jobId')} className="sortable">
                      JobId
                    </th>
                    <th scope="col" onClick={() => handleSort('alumniId')} className="sortable">
                      AlumniId
                    </th>
                    <th scope="col" onClick={() => handleSort('company')} className="sortable">
                      Company
                    </th>
                    <th scope="col" onClick={() => handleSort('post')} className="sortable">
                      Post
                    </th>
                    <th scope="col" onClick={() => handleSort('department')} className="sortable">
                      Department
                    </th>
                    <th scope="col">Vacancy</th>
                    <th scope="col">Salary</th>
                    <th scope="col" onClick={() => handleSort('location')} className="sortable">
                      Location
                    </th>
                    <th scope="col">Bond</th>
                    <th scope="col">Timings</th>
                    <th scope="col">Apply From</th>
                    <th scope="col">Apply Till</th>
                    <th scope="col">Mode</th>
                    <th scope="col">Type</th>
                    <th scope="col" onClick={() => handleSort('postDate')} className="sortable">
                      Post Date
                    </th>
                    <th scope="col">Post Time</th>
                    <th scope="col" onClick={() => handleSort('status')} className="sortable">
                      Status
                    </th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((obj, index) => (
                    <tr key={obj?.jobId ?? `${index}-${obj?.company ?? "row"}`}>
                      <td>{index + 1}</td>
                      <td className="nowrap">{obj?.jobId}</td>
                      <td className="nowrap">{obj?.alumniId}</td>
                      <td className="truncate" title={obj?.company}>{obj?.company}</td>
                      <td className="truncate" title={obj?.post}>{obj?.post}</td>
                      <td className="truncate" title={obj?.department}>{obj?.department}</td>
                      <td>{obj?.vacancy}</td>
                      <td className="nowrap">{obj?.salary}</td>
                      <td className="truncate" title={obj?.location}>{obj?.location}</td>
                      <td className="truncate">{obj?.bond}</td>
                      <td className="truncate">{obj?.timings}</td>
                      <td className="nowrap">{obj?.applyFromDate}</td>
                      <td className="nowrap">{obj?.applyTillDate}</td>
                      <td>{obj?.mode}</td>
                      <td>{obj?.type}</td>
                      <td className="nowrap">{obj?.postDate}</td>
                      <td className="nowrap">{obj?.postTime}</td>
                      <td>
                        <span className={statusClass(obj?.status)}>
                          {getStatusText(obj?.status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(obj?.status === "0" || obj?.status === "false" || String(obj?.status).toLowerCase().includes("rejected")) && (
                            <button
                              type="button"
                              className="btn btn--success"
                              onClick={() => handleApprove(obj?.jobId)}
                              disabled={busyId === obj?.jobId}
                              aria-label={`Approve job ${obj?.jobId}`}
                            >
                              {busyId === obj?.jobId ? "…" : "Approve"}
                            </button>
                          )}
                          
                          {(obj?.status === "1" || obj?.status === "true" || String(obj?.status).toLowerCase().includes("approved")) && (
                            <button
                              type="button"
                              className="btn btn--warn"
                              onClick={() => handleReject(obj?.jobId)}
                              disabled={busyId === obj?.jobId}
                              aria-label={`Reject job ${obj?.jobId}`}
                            >
                              {busyId === obj?.jobId ? "…" : "Reject"}
                            </button>
                          )}
                          
                          <button
                            type="button"
                            className="btn btn--danger"
                            onClick={() => handleDelete(obj?.jobId)}
                            disabled={busyId === obj?.jobId}
                            aria-label={`Delete job ${obj?.jobId}`}
                          >
                            {busyId === obj?.jobId ? "…" : "Delete"}
                          </button>
                        </div>
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

// Enhanced CSS with admin-specific styling
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

.status-filter {
  padding: 6px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  height: 32px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.status-filter:focus {
  outline: none;
  border-color: #fdbe33;
}

.count { 
  font-size: 0.8rem; 
  color: #666666;
  font-weight: 500;
  white-space: nowrap;
}

/* Alert styling */
.alert {
  padding: 10px 15px;
  margin: 10px 0;
  border-radius: 6px;
  font-size: 14px;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
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

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.sortable:hover {
  background: #1a2332 !important;
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

/* Action buttons container */
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
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

.badge--danger { 
  background: #fef2f2; 
  color: #991b1b; 
}

/* Compact button styling */
.btn { 
  appearance: none; 
  border: none; 
  padding: 4px 8px; 
  border-radius: 4px; 
  cursor: pointer; 
  font-size: 0.7rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 50px;
  height: 24px;
  line-height: 1;
  margin: 1px;
}

.btn--primary { 
  background: #2563eb; 
  color: white; 
}

.btn--primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn--primary:disabled { 
  background: #93c5fd; 
  cursor: wait; 
}

.btn--success { 
  background: #059669; 
  color: white; 
}

.btn--success:hover:not(:disabled) {
  background: #047857;
  transform: translateY(-1px);
}

.btn--success:disabled { 
  background: #6ee7b7; 
  cursor: wait; 
}

.btn--warn { 
  background: #d97706; 
  color: white; 
}

.btn--warn:hover:not(:disabled) {
  background: #b45309;
  transform: translateY(-1px);
}

.btn--warn:disabled { 
  background: #fbbf24; 
  cursor: wait; 
}

.btn--danger { 
  background: #ef4444; 
  color: white; 
}

.btn--danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn--danger:disabled { 
  background: #fca5a5; 
  cursor: wait; 
}

.btn--info { 
  background: #0891b2; 
  color: white; 
}

.btn--info:hover:not(:disabled) {
  background: #0e7490;
  transform: translateY(-1px);
}

.btn--info:disabled { 
  background: #67e8f9; 
  cursor: wait; 
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
  
  .search, .status-filter {
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
    min-width: 1200px; 
  }
  
  .truncate {
    max-width: 80px;
  }
  
  .btn {
    padding: 3px 6px;
    font-size: 0.65rem;
    min-width: 40px;
    height: 20px;
  }
  
  .action-buttons {
    gap: 2px;
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

export default AdminJobsList;