import React, { useEffect, useState } from "react";
import { API_ADMIN_URL } from "../../utils";
import { useLocation, useNavigate } from "react-router-dom";

const EventList =()=> {
  // For file uploads, store selected files per eventId
    const [eventData, setEventData] = useState([]);
    const [message,setMessage]=useState('')
    const [selectedFiles, setSelectedFiles] = useState({});
    const [uploadLoading, setUploadLoading] = useState({});
    const navigate = useNavigate()
    const location = useLocation()
    const msg=location.state?.message
    // setMessage(msg)

    useEffect(() => {
      // Fetch event data from API
      const fetchEvents = async () => { 
        try {
          const response = await fetch(API_ADMIN_URL+'/adminViewEvents', {
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
    const onUpdate = (eventId) => {
        navigate('/admin/addEvent', { state: { eventId } });
        console.log("Update event with ID:", eventId);
      };
    
      const onDelete = async(eventId) => {
        const response=await fetch(API_ADMIN_URL+'/adminDeleteEvent',{
          method:'POST',
          credentials:'include',
          headers:{
            'Content-Type':'application/json'
          },
          body:JSON.stringify({eventId})
        })
        const data=await response.json()
        setMessage(data.message)
        
      };

      // Handle file selection for each event
      const handleFileChange = (eventId, files) => {
        setSelectedFiles(prev => ({
          ...prev,
          [eventId]: files
        }));
      };

      // Handle upload for specific event
      const handleUpload = async (eventId) => {
        const files = selectedFiles[eventId];
        if (!files || files.length === 0) {
          setMessage('Please select files to upload');
          return;
        }

        // Set loading state for this specific event
        setUploadLoading(prev => ({ ...prev, [eventId]: true }));

        try {
          const formData = new FormData();
          formData.append('eventId', eventId);
          
          // Append all selected files with the name 'images' as expected by backend
          for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
          }

          const response = await fetch(API_ADMIN_URL + '/adminUploadImages', {
            method: 'POST',
            credentials: 'include',
            body: formData // Don't set Content-Type header, let browser set it for FormData
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.status === 200) {
            setMessage(`${data.message} (${data.uploadedFiles || files.length} file(s) uploaded)`);
            // Clear selected files for this event after successful upload
            setSelectedFiles(prev => {
              const updated = { ...prev };
              delete updated[eventId];
              return updated;
            });
            // Clear the file input
            const fileInput = document.getElementById(`fileInput-${eventId}`);
            if (fileInput) {
              fileInput.value = '';
            }
          } else {
            setMessage(data.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setMessage('Error uploading images. Please try again.');
        } finally {
          // Clear loading state for this specific event
          setUploadLoading(prev => ({ ...prev, [eventId]: false }));
        }
      };      
  
  


  return (
    <div className="container">
      <div className="text-left mb-3">
        <h3>Events List</h3>
        {!message &&
        location.state?.message && (
          <div style={{color:location.state.status===200?'green':'red'}}>
            {location.state.message}
          </div>
        )}
        {message && (
          <div style={{color: message.includes('successfully') || message.includes('uploaded') ? 'green' : 'red'}}>
            {message}
          </div>
        )}
      </div>
      <div className="table-responsive">
        {eventData.length === 0 ? (
          <div>No Record Found</div>
        ) : (
          <table className="table table-striped table-bordered align-middle" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>S.no</th>
                <th>EventId</th>
                <th>EventName</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Location</th>
                <th>Description</th>
                <th>Type Of Event</th>
                <th>Criteria</th>
                <th>Mode Of Apply</th>
                <th>Apply From</th>
                <th>Apply Till</th>
                <th>Upload Date</th>
                <th>Upload Time</th>
                <th>Upload Images</th>
                <th>Update</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {eventData.map((obj, index) => (
                <tr key={obj.eventId}>
                  <td>{index + 1}</td>
                  <td>{obj.eventId}</td>
                  <td>{obj.eventName}</td>
                  <td>{obj.eventStartDate}</td>
                  <td>{obj.eventEndDate}</td>
                  <td>{obj.eventStartTime}</td>
                  <td>{obj.eventEndTime}</td>
                  <td>{obj.location}</td>
                  <td>{obj.description}</td>
                  <td>{obj.typeOfEvent}</td>
                  <td>{obj.criteria}</td>
                  <td>{obj.modeOfApply}</td>
                  <td>{obj.startDateToApply}</td>
                  <td>{obj.lastDateToApply}</td>
                  <td>{obj.uploadDate}</td>
                  <td>{obj.uploadTime}</td>
                  <td>
                    <input
                      id={`fileInput-${obj.eventId}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => handleFileChange(obj.eventId, e.target.files)}
                      className="form-control form-control-sm mb-1"
                    />
                    <button
                      className="btn btn-primary btn-sm w-100"
                      onClick={() => handleUpload(obj.eventId)}
                      disabled={!selectedFiles[obj.eventId] || uploadLoading[obj.eventId]}
                    >
                      {uploadLoading[obj.eventId] ? 'Uploading...' : 'Upload'}
                    </button>
                    {selectedFiles[obj.eventId] && (
                      <small className="text-muted d-block mt-1">
                        {selectedFiles[obj.eventId].length} file(s) selected
                      </small>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-success btn-sm w-100"
                      onClick={() => onUpdate(obj.eventId)}
                    >
                      Update
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm w-100"
                      onClick={() => onDelete(obj.eventId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Usage Example:
// <EventList eventData={eventArr} onUpdate={handleUpdate} onDelete={handleDelete} onUpload={handleUploadImages} />

export default EventList;
