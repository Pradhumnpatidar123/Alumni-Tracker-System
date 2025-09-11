import React, { useEffect, useState } from "react";
import { API_ADMIN_URL } from "../../utils";
import { useLocation, useNavigate } from "react-router-dom";
const initialState = {
  eventName: "",
  eventStartDate: "",
  eventEndDate: "",
  description: "",
  eventStartTime: "",
  eventEndTime: "",
  location: "",
  typeOfEvent: "",
  criteria: "",
  modeOfApply: "",
  startDateToApply: "",
  lastDateToApply: "",
};
const AdminAddEvent = () => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
 const [message, setMessage] = useState(null);
 const navigate = useNavigate()
 const location = useLocation()
 const eventId=location.state?.eventId
 useEffect(() => {
    async function fetchData() {
        if (eventId) {
            const response=await fetch(API_ADMIN_URL+'/adminUpdateEvent',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                credentials:'include',
                body:JSON.stringify({eventId})
            })
            const data=await response.json()
            console.log(data)
            if(response.ok){
                setFormData(
                  {
                    eventName:data.eventData.eventName,
                    eventStartDate:data.eventData.eventStartDate,
                    eventEndDate:data.eventData.eventEndDate,
                    description:data.eventData.description,
                    eventStartTime:data.eventData.eventStartTime,
                    eventEndTime:data.eventData.eventEndTime,
                    location:data.eventData.location,
                    typeOfEvent:data.eventData.typeOfEvent,
                    criteria:data.eventData.criteria,
                    modeOfApply:data.eventData.modeOfApply,
                    lastDateToApply:data.eventData.lastDateToApply,
                    startDateToApply:data.eventData.startDateToApply,
                    uploadDate:data.eventData.uploadDate,
                    uploadTime:data.eventData.uploadTime,
                    inviteBTNMessage:data.eventData.inviteBTNMessage,
                    status:data.eventData.status,
                  }
                )
            }else{
              setMessage(data.message || "Failed to update event");
              navigate('/admin/adminViewEvent')
            }
        }
    }
    fetchData()
 }, [eventId]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" })); // clear error on change
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.eventName) newErrors.eventName = "Event Name is required";
    if (!formData.eventStartDate) newErrors.eventStartDate = "Start Date is required";
    if (!formData.eventEndDate) newErrors.eventEndDate = "End Date is required";
    return newErrors;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Add validation here if needed
  
  try {
    if(!eventId){
    var response = await fetch(API_ADMIN_URL+"/adminAddEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });
  }else{
    var response = await fetch(API_ADMIN_URL+"/adminEventUpdate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({...formData,eventId})
    });
  }
    if (response.ok) {
      const result = await response.json();
      if(response.status===200){
        setMessage(response.message || "Event update successfully");
        navigate('/admin/eventList',{state:{message:'Event update successfully',status:200}})
      }else{
        setMessage(response.message || "Event Added successfully");
      }
      setFormData(initialState); // Reset form
    } else {
      const error = await response.json();
        setMessage(error.message || "Failed to add event");
    }
  } catch (err) {
    setMessage("An error occurred while adding the event");
  }
};


  const handleReset = () => {
    setFormData(initialState);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="form-group bg-light p-4 rounded shadow-sm">
      <div className="container">
        <div className="row align-items-start">
          <div className="col-12 mb-3">
            <h3 className="mb-3 text-primary">Admin Add Events</h3>
          </div>
            {message && (
            <div className="col-12 mb-3">
              <div style={{ color: message.includes('successfully') ? 'green' : 'red' }}>
                {message}
              </div>
            </div>
            )}
          <div className="col-lg-6 col-md-12 mb-3">
            <label htmlFor="eventName" className="form-label">Event Name</label>
            <input
              type="text"
              className={`form-control mb-2 ${errors.eventName ? 'is-invalid' : ''}`}
              placeholder="Enter Event Name"
              name="eventName"
              id="eventName"
              value={formData.eventName}
              onChange={handleChange}
            />
            {errors.eventName && <div className="invalid-feedback">{errors.eventName}</div>}

            <label htmlFor="eventStartDate" className="form-label">Event Start Date</label>
            <input
              type="date"
              className={`form-control mb-2 ${errors.eventStartDate ? 'is-invalid' : ''}`}
              name="eventStartDate"
              id="eventStartDate"
              value={formData.eventStartDate}
              onChange={handleChange}
            />
            {errors.eventStartDate && <div className="invalid-feedback">{errors.eventStartDate}</div>}

            <label htmlFor="eventEndDate" className="form-label">Event End Date</label>
            <input
              type="date"
              className={`form-control mb-2 ${errors.eventEndDate ? 'is-invalid' : ''}`}
              name="eventEndDate"
              id="eventEndDate"
              value={formData.eventEndDate}
              onChange={handleChange}
            />
            {errors.eventEndDate && <div className="invalid-feedback">{errors.eventEndDate}</div>}

            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              name="description"
              id="description"
              className="form-control mb-2"
              placeholder="Enter Description"
              value={formData.description}
              onChange={handleChange}
            />

            <label htmlFor="eventStartTime" className="form-label">Event Start Time</label>
            <input
              type="text"
              className="form-control mb-2"
              name="eventStartTime"
              id="eventStartTime"
              value={formData.eventStartTime}
              onChange={handleChange}
              placeholder="e.g., 09:00 AM"
            />

            <label htmlFor="eventEndTime" className="form-label">Event End Time</label>
            <input
              type="text"
              className="form-control mb-2"
              name="eventEndTime"
              id="eventEndTime"
              value={formData.eventEndTime}
              onChange={handleChange}
              placeholder="e.g., 11:00 AM"
            />
          </div>
          <div className="col-lg-6 col-md-12 mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              className="form-control mb-2"
              id="location"
              placeholder="Enter Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />

            <label htmlFor="typeOfEvent" className="form-label">Type Of Event</label>
            <input
              type="text"
              className="form-control mb-2"
              id="typeOfEvent"
              placeholder="Enter Type Of Event"
              name="typeOfEvent"
              value={formData.typeOfEvent}
              onChange={handleChange}
            />

            <label htmlFor="criteria" className="form-label">Criteria</label>
            <input
              type="text"
              className="form-control mb-2"
              id="criteria"
              placeholder="Enter Criteria"
              name="criteria"
              value={formData.criteria}
              onChange={handleChange}
            />

            <label htmlFor="modeOfApply" className="form-label">Mode Of Apply (Optional)</label>
            <select
              name="modeOfApply"
              className="form-control mb-2"
              value={formData.modeOfApply}
              id="modeOfApply"
              onChange={handleChange}
            >
              <option value="">Select Mode Of Apply</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="both">Both</option>
            </select>

            <label htmlFor="startDateToApply" className="form-label">Start Date To Apply (Optional)</label>
            <input
              type="date"
              className="form-control mb-2"
              id="startDateToApply"
              name="startDateToApply"
              value={formData.startDateToApply}
              onChange={handleChange}
            />

            <label htmlFor="lastDateToApply" className="form-label">Last Date To Apply (Optional)</label>
            <input
              type="date"
              className="form-control mb-2"
              id="lastDateToApply"
              name="lastDateToApply"
              value={formData.lastDateToApply}
              onChange={handleChange}
            />

            <button type="submit" className="btn btn-warning w-100 mb-2">
              Add Event
            </button>
            <button type="button" className="btn btn-danger w-100" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
export default AdminAddEvent;
