import React, { useEffect, useState } from "react";
import { API_ADMIN_URL, API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const AlumniEventList = () => {
  // Handler functions trigger the parent handler with event data
  const [message, setMessage] = useState('');
  const [msgBtn,setMsgBtn]=useState('')
  const [eventData, setEventData]=useState([])
    const { user } = useAuth();
    const email = user?.email;
    useEffect(() => {
         // Fetch event data from API
         const fetchEvents = async () => { 
           try {
             const response = await fetch(API_ALUMNI_URL+'/alumniViewEvents', {
               method: 'GET',
               credentials: 'include', // include cookies
               headers: {
                 'Content-Type': 'application/json',
               },
             });
     
             if (!response.ok) {
               throw new Error('Network response was not ok');
             }
               const data = await response.json();
               setEventData(data.events || []); // Adjust based on actual response structure
           } catch (error) {
             console.error('Error fetching events:', error);
           }
         };
           fetchEvents();
       }, [message]);
  const handleAccept = async(eventObj) => {
    const response = await fetch(API_ALUMNI_URL+'/alumniAcceptInvitation', {
      method: 'POST',
      credentials: 'include', // include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({eventObj,email}),
    });
    const data = await response.json();
    console.log(data);
    
    if (response.ok) {
      setEventData(data.eventData || []);
      setMessage(data.message || '');
    } else {
      setMessage(data.message || 'Failed to accept invitation');
     }
  };

  const handleDecline = async(eventObj) => {
    const response = await fetch(API_ALUMNI_URL+'/alumniDeclainInvitation', {
      method: 'POST',
      credentials: 'include', // include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({eventObj,email}),
    });
    const data = await response.json();
    console.log(data);
    
    if (response.ok) {
      setEventData(data.eventData || []);
      setMessage(data.message || '');
    } else {
      setMessage(data.message || 'Failed to decline invitation');
     }
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="section-header text-center mb-3">
            <h2 className="h3 fw-bold text-primary mb-2" style={{fontSize: '24px'}}>Alumni Events</h2>
            <p className="text-muted mb-2" style={{fontSize: '14px'}}>Manage your event invitations and participation</p>
            {message && (
              <div className="mt-2 p-2 rounded" style={{fontSize: '12px', backgroundColor: '#e8f4fd', color: '#0066cc', border: '1px solid #b3d9ff'}}>
                <i className="fas fa-info-circle me-1"></i>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="col-11 col-lg-10">
          {!eventData || eventData.length === 0 ? (
            <div className="text-center py-3">
              <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
              <h6 className="text-muted" style={{fontSize: '14px'}}>No Events Available</h6>
              <p className="text-muted" style={{fontSize: '12px'}}>Check back later for upcoming events!</p>
            </div>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <table className="table table-hover table-bordered align-middle mb-0" style={{ fontSize: 12 }}>
                <thead className="table-primary" style={{fontSize: '11px'}}>
                  <tr>
                    <th className="text-center" style={{padding: '8px 4px', width: '40px'}}>#</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Event ID</th>
                    <th style={{padding: '8px 10px'}}>Event Name</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Start Date</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>End Date</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '70px'}}>Start Time</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '70px'}}>End Time</th>
                    <th style={{padding: '8px 10px'}}>Location</th>
                    <th style={{padding: '8px 10px'}}>Description</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '80px'}}>Event Type</th>
                    <th className="text-center" style={{padding: '8px 6px', width: '100px'}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {eventData.map((obj, index) => (
                    <tr key={obj.eventId ?? index}>
                      <td className="text-center fw-bold" style={{padding: '6px 4px'}}>{index + 1}</td>
                      <td className="text-center" style={{padding: '6px'}}><span className="badge bg-secondary" style={{fontSize: '10px'}}>{obj.eventId}</span></td>
                      <td className="fw-semibold text-primary" style={{padding: '6px 10px', fontSize: '12px'}}>{obj.eventName}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.eventStartDate}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.eventEndDate}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.eventStartTime}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>{obj.eventEndTime}</td>
                      <td className="text-muted" style={{padding: '6px 10px', maxWidth: '150px', wordWrap: 'break-word', fontSize: '11px'}}>{obj.location}</td>
                      <td className="text-muted" style={{padding: '6px 10px', maxWidth: '180px', wordWrap: 'break-word', fontSize: '11px'}}>{obj.description}</td>
                      <td className="text-center" style={{padding: '6px', fontSize: '11px'}}>
                        <span className="badge bg-info text-dark" style={{fontSize: '10px'}}>{obj.typeOfEvent}</span>
                      </td>
                      <td className="text-center" style={{padding: '6px'}}>
                        {obj.inviteBTNMessage === 'Accept Invitation' ? (
                          <button
                            className="btn btn-outline-success btn-sm"
                            style={{padding: '4px 8px', fontSize: '10px'}}
                            onClick={() => handleAccept(obj)}
                          >
                            <i className="fas fa-check me-1" style={{fontSize: '9px'}}></i>
                            Accept
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            style={{padding: '4px 8px', fontSize: '10px'}}
                            onClick={() => handleDecline(obj)}
                          >
                            <i className="fas fa-times me-1" style={{fontSize: '9px'}}></i>
                            Decline
                          </button>
                        )}
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
};

// Usage example:
// <EventList eventData={array} message="Success" onAccept={yourAcceptHandler} onDecline={yourDeclineHandler} />

export default AlumniEventList;
