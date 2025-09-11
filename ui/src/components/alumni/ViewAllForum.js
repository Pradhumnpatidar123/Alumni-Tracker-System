import React, { useEffect, useState } from "react";
import { API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AlumniViewAllForum() {
  const [message, setMessage] = useState("");
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const msg = location.state?.message;
  
  useEffect(() => {
    if (msg) {
      setMessage(msg);
    }
  }, [msg]);
  
  const { user } = useAuth();
  const email = user?.email;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_ALUMNI_URL}/alumniViewAllForum`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Forum data:', data);
        setForums(data.forumData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forum data:", error);
        setMessage("Failed to load forums");
        setLoading(false);
      }
    }
    
    if (email) {
      fetchData();
    }
  }, [email, message]);

  const handleJoin = async (forumObj) => {
    if (!forumObj) return;
    
    // If already joined (Send Message), navigate to chat
    if (forumObj.messageStatus === "Send Message") {
      navigate('/join', { state: { forumDetails: forumObj } });
      return;
    }
    
    // Otherwise, join the forum
    setActionLoadingId(forumObj.forumId);
    
    try {
      const response = await fetch(`${API_ALUMNI_URL}/alumniJoinForum`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          forumDetails: forumObj
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage(data.message || "Successfully joined the forum!");
        // Refresh the forum list to update the button status
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage(data.message || "Failed to join forum");
      }
    } catch (error) {
      console.error("Error joining forum:", error);
      setMessage("Network error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="section-header text-center mb-3">
            <h2 className="h3 fw-bold text-primary mb-2" style={{fontSize: '24px'}}>Alumni Forum Community</h2>
            <p className="text-muted mb-2" style={{fontSize: '14px'}}>Connect, discuss, and share experiences with fellow alumni</p>
            {message && (
              <div className={`alert ${message.includes('Success') || message.includes('join') ? 'alert-success' : 'alert-info'} alert-dismissible fade show mb-2`} role="alert" style={{padding: '8px 12px', fontSize: '13px'}}>
                <i className="fas fa-info-circle me-1"></i>
                {message}
                <button type="button" className="btn-close btn-close-sm" onClick={() => setMessage('')} aria-label="Close"></button>
              </div>
            )}
          </div>
        </div>

        <div className="col-11 col-lg-10">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted" style={{fontSize: '13px'}}>Loading forums...</p>
            </div>
          ) : forums.length === 0 ? (
            <div className="text-center py-3">
              <i className="fas fa-comments fa-2x text-muted mb-2"></i>
              <h6 className="text-muted" style={{fontSize: '14px'}}>No Forums Available</h6>
              <p className="text-muted" style={{fontSize: '12px'}}>Be the first to create a forum discussion!</p>
            </div>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: 12 }}>
                <thead className="table-primary" style={{fontSize: '11px'}}>
                  <tr>
                    <th className="text-center" style={{padding: '8px 4px', width: '40px'}}>#</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Forum ID</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '90px'}}>Created By</th>
                    <th style={{padding: '8px 10px'}}>Forum Topic</th>
                    <th style={{padding: '8px 10px'}}>Description</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Start Date</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Start Time</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '90px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {forums.map((obj, index) => (
                    <tr key={obj.forumId ?? index}>
                      <td className="text-center fw-bold" style={{padding: '6px 4px'}}>{index + 1}</td>
                      <td className="text-center" style={{padding: '6px'}}><span className="badge bg-secondary" style={{fontSize: '10px'}}>{obj.forumId}</span></td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.alumniId}</td>
                      <td className="fw-semibold text-primary" style={{padding: '6px 10px', fontSize: '12px'}}>{obj.forumTopic}</td>
                      <td className="text-muted" style={{padding: '6px 10px', maxWidth: '180px', wordWrap: 'break-word', fontSize: '11px'}}>{obj.description}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.startDate}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.startTime}</td>
                      <td className="text-center" style={{padding: '6px'}}>
                        <button
                          className={`btn btn-sm ${
                            obj.messageStatus === "Send Message" 
                              ? "btn-outline-warning" 
                              : "btn-outline-success"
                          }`}
                          style={{padding: '4px 8px', fontSize: '10px'}}
                          onClick={() => handleJoin(obj)}
                          disabled={actionLoadingId === obj.forumId}
                        >
                          {actionLoadingId === obj.forumId ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" style={{width: '10px', height: '10px'}} role="status" aria-hidden="true"></span>
                              Loading...
                            </>
                          ) : (
                            <>
                              <i className={`fas ${
                                obj.messageStatus === "Send Message" 
                                  ? "fa-comments" 
                                  : "fa-plus"
                              } me-1`} style={{fontSize: '9px'}}></i>
                              {obj.messageStatus || "Join"}
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
        </div>
      </div>
    </div>
  );
}