import React, { useEffect, useState } from "react";
import { API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AlumniMyForumList() {
  const [message, setMessage] = useState(""); // replaces <%= message %>
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const navigate=useNavigate()
  const location=useLocation()
  const msg=location.state?.message
  useEffect(()=>{
    setMessage(msg)
  },[msg])
  const {user}=useAuth();
  const email=user?.email;
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_ALUMNI_URL}/alumniViewMyForum`,
          { 
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email})
          }
        );
        const data = await response.json();
        console.log(data);
        setForums(data.forumData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }
    fetchData();
  
  },[message])
  const handleUpdate=async(obj)=>{
    // const response = await fetch(`${API_ALUMNI_URL}/alumniForumUpdate`,
    //   { 
    //     method: 'POST',
    //     credentials: 'include',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({forumId})
    //   }
    // );
    navigate('/addFourm',{state:{obj}})
  }
  const handleDelete=async(forumId)=>{
  const response = await fetch(`${API_ALUMNI_URL}/alumniDeleteForum`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({forumId})
    }
  );
  if (!response.ok) {
    setMessage('Something went wrong!');
  }
  const data = await response.json();
  setMessage(data.message);
  }
  return (
    <div className="container-fluid px-4 py-3">
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="section-header text-center mb-3">
            <h2 className="h3 fw-bold text-primary mb-2" style={{fontSize: '24px'}}>My Forum Discussions</h2>
            <p className="text-muted mb-2" style={{fontSize: '14px'}}>Manage and track your created forum discussions</p>
            {message && (
              <div className={`alert ${message.includes('Success') || message.includes('delete') ? 'alert-success' : 'alert-info'} alert-dismissible fade show mb-2`} role="alert" style={{padding: '8px 12px', fontSize: '13px'}}>
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
              <p className="mt-2 text-muted" style={{fontSize: '13px'}}>Loading your forums...</p>
            </div>
          ) : forums.length === 0 ? (
            <div className="text-center py-3">
              <i className="fas fa-comments fa-2x text-muted mb-2"></i>
              <h6 className="text-muted" style={{fontSize: '14px'}}>No Forums Created Yet</h6>
              <p className="text-muted" style={{fontSize: '12px'}}>Start creating your first forum discussion!</p>
            </div>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: 12 }}>
                <thead className="table-primary" style={{fontSize: '11px'}}>
                  <tr>
                    <th className="text-center" style={{padding: '8px 4px', width: '40px'}}>#</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Forum ID</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '90px'}}>Username</th>
                    <th style={{padding: '8px 10px'}}>Forum Topic</th>
                    <th style={{padding: '8px 10px'}}>Description</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Start Date</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Start Time</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '70px'}}>Update</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '70px'}}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {forums.map((obj, index) => (
                    <tr key={obj.forumId ?? index}>
                      <td className="text-center fw-bold" style={{padding: '6px 4px'}}>{index + 1}</td>
                      <td className="text-center" style={{padding: '6px'}}><span className="badge bg-secondary" style={{fontSize: '10px'}}>{obj.forumId}</span></td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.username}</td>
                      <td className="fw-semibold text-primary" style={{padding: '6px 10px', fontSize: '12px'}}>{obj.forumTopic}</td>
                      <td className="text-muted" style={{padding: '6px 10px', maxWidth: '180px', wordWrap: 'break-word', fontSize: '11px'}}>{obj.description}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.startDate}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.startTime}</td>
                      <td className="text-center" style={{padding: '6px'}}>
                        <button
                          className="btn btn-outline-warning btn-sm"
                          style={{padding: '4px 8px', fontSize: '10px'}}
                          onClick={() => handleUpdate(obj)}
                          disabled={actionLoadingId === obj.forumId}
                        >
                          {actionLoadingId === obj.forumId ? (
                            <span className="spinner-border spinner-border-sm" style={{width: '10px', height: '10px'}} role="status" aria-hidden="true"></span>
                          ) : (
                            <>
                              <i className="fas fa-edit me-1" style={{fontSize: '9px'}}></i>
                              Edit
                            </>
                          )}
                        </button>
                      </td>
                      <td className="text-center" style={{padding: '6px'}}>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          style={{padding: '4px 8px', fontSize: '10px'}}
                          onClick={() => handleDelete(obj.forumId)}
                          disabled={actionLoadingId === obj.forumId}
                        >
                          {actionLoadingId === obj.forumId ? (
                            <span className="spinner-border spinner-border-sm" style={{width: '10px', height: '10px'}} role="status" aria-hidden="true"></span>
                          ) : (
                            <>
                              <i className="fas fa-trash me-1" style={{fontSize: '9px'}}></i>
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
        </div>
      </div>
    </div>
  );
}
