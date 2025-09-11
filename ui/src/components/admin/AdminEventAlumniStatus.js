import React from "react";
import { API_ADMIN_URL } from "../../utils";


export default function AlumniEventConfirmationList() {
    const [alumniConfirmationData, setAlumniConfirmationData] = React.useState([]);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_ADMIN_URL+"/adminViewAlumniStatus", {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log(data);
        setAlumniConfirmationData(data.items || []);
        setMessage("");
      } catch (error) {
        console.error('Error fetching alumni status:', error);
        setMessage('Failed to load data');
        setAlumniConfirmationData([]);
      }
    }
    fetchData();
  }, []); // Remove dependency to prevent infinite loop


  const hasRows = Array.isArray(alumniConfirmationData) && alumniConfirmationData.length > 0;

  return (
    <div className="container">
      <div className="text-left mb-3">
        <h3>Alumni Event Confirmation List</h3>
        {message && <div style={{color:'red'}}>{message}</div>}
      </div>
      <div className="table-responsive">
        {!hasRows ? (
          <div>No Record Found</div>
        ) : (
          <table className="table table-striped table-bordered align-middle" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>S.no</th>
                <th>Alumni Id</th>
                <th>Alumni Name</th>
                <th>Event Id</th>
                <th>Event Name</th>
              </tr>
            </thead>
            <tbody>
              {alumniConfirmationData.map((obj, index) => (
                <tr key={`${obj.alumniId}-${obj.eventId}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{obj.alumniId}</td>
                  <td>{obj.alumniName}</td>
                  <td>{obj.eventId}</td>
                  <td>{obj.eventName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
