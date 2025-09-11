import React, { useEffect, useState } from "react";
import { API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function AlumniAddForumTopic() {
  const [forumTopic, setForumTopic] = useState("");
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState(""); // replaces <%= message %>
  const [submitting, setSubmitting] = useState(false);
  const {user}=useAuth();
  const email=user?.email;
  const navigate=useNavigate();
  const location=useLocation()
  const obj=location.state?.obj;
  
  // Initialize form data from location state in useEffect to prevent infinite re-renders
  useEffect(() => {
    if(obj){
      setForumTopic(obj.forumTopic || "");
      setDescription(obj.description || "");
    }
  }, [obj]);
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload on submit [web:9]
    setSubmitting(true);
    setMessage("");
    if(!obj){

      try {
        const res = await fetch(API_ALUMNI_URL+"/alumniAddForumTopic", {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // send JSON payload [web:5][web:12]
          body: JSON.stringify({ forumTopic, description, email }), // controlled inputs -> JSON body [web:5][web:9]
        });
        
        if (!res.ok) {
          // handle HTTP errors explicitly; fetch doesn't throw on 4xx/5xx by default [web:5]
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }
        
        const data = await res.json().catch(() => ({})); // tolerate empty JSON [web:5]
        setMessage(data.message || "Forum topic submitted successfully."); // simple UX feedback [web:5]
        setForumTopic("");
        setDescription("");
      } catch (err) {
        setMessage(err.message || "Something went wrong while submitting."); // basic error handling [web:5]
      } finally {
        setSubmitting(false);
      }
    } else{
      try {
        const res = await fetch(API_ALUMNI_URL+"/alumniForumUpdate", {
          method: "POST",
          headers: { "Content-Type": "application/json" }, // send JSON payload [web:5][web:12]
          body: JSON.stringify({ forumTopic, description, email, forumId:obj.forumId }), // controlled inputs -> JSON body [web:5][web:9]
        }) 
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed with status ${res.status}`);
        }else{ 
          const data = await res.json().catch(() => ({})); // tolerate empty JSON [web:5]
          // simple UX feedback [web:5]
          setForumTopic("");
          setDescription("");
          navigate('/viewMyForum',{state:{message:data.message}});
        }

      } catch (err) { 
        setMessage(err.message || "Something went wrong while updating.");
      }finally { 
        setSubmitting(false); 
      } 
    }
  };

  const handleReset = () => {
    setForumTopic("");
    setDescription("");
    setMessage("");
  };

  return (
    <div className="container py-4">
      <div className="row align-items-center gy-4">
        <div className="col-lg-5 col-md-6">
          <div className="about-img text-center">
            <img
              src="img/adminVector.jpg"
              alt="Image"
              className="img-fluid rounded"
            />
          </div>
        </div>

        <div className="col-lg-7 col-md-6">
          <div className="section-header text-left mb-3">
            <h3 className="h4 mb-2">Alumni Add Forum Topic</h3>
            <span className={message ? "text-success" : "text-muted"}>
              {message}
            </span>
          </div>

          <div className="about-text">
            <form onSubmit={handleSubmit} className="form-group">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter Forum Topic"
                name="forumTopic"
                value={forumTopic}
                onChange={(e) => setForumTopic(e.target.value)} // controlled input [web:9]
                required
              />

              <textarea
                className="form-control mb-3"
                placeholder="Enter Description"
                name="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)} // controlled input [web:9]
                required
              />

              {/* If dates are needed later, uncomment and wire as controlled inputs */}

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Alumni Add Forum"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
