import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../App"; // Ensure this is the correct import
import {
  collection,
  getDocs,
  doc,
  setDoc,
  query,
} from "firebase/firestore";

const Interviews = () => {
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [interviewStatuses, setInterviewStatuses] = useState({});
  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  const fetchInterviews = async () => {
    try {
      const q = query(collection(db, `interviews-${loggedInEmployeeId}`));
      const querySnapshot = await getDocs(q);
      const fetchedInterviews = [];
      const statuses = {};
      querySnapshot.forEach((doc) => {
        const interviewData = { id: doc.id, ...doc.data() };
        fetchedInterviews.push(interviewData);
        statuses[doc.id] = {
          r1Status: interviewData.r1Status || "",
          r2Status: interviewData.r2Status || ""
        };
      });
      setInterviews(fetchedInterviews);
      setInterviewStatuses(statuses);
    } catch (error) {
      console.error("Error fetching interviews: ", error);
    }
  };

  const handleStatusChange = useCallback(async (interview, newStatus, isR2 = false) => {
    const updatedInterview = { ...interview };

    if (isR2) {
      updatedInterview.r2Status = newStatus;
    } else {
      updatedInterview.r1Status = newStatus;
      if (newStatus === "Rejected" && updatedInterview.r2Status === "Selected") {
        updatedInterview.r2Status = "NA";
      } else if (newStatus !== "R2 Scheduled") {
        updatedInterview.r2Status = "NA";
      }
    }

    setInterviewStatuses((prevStatuses) => ({
      ...prevStatuses,
      [interview.id]: {
        r1Status: updatedInterview.r1Status,
        r2Status: updatedInterview.r2Status
      }
    }));

    const statusDocRef = doc(db, `interviews-${loggedInEmployeeId}`, interview.id);
    await setDoc(statusDocRef, updatedInterview);
  }, [loggedInEmployeeId]);

  useEffect(() => {
    fetchInterviews();
  }, [location.state.loggedInEmployeeId]);

  return (
    <div>
      <h2>Interviews</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Position</th>
            
            
            <th>R1 Status</th>
            <th>R2 Status</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map((interview, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{interview.name}</td>
              <td>{interview.email}</td>
              <td>{interview.mobileNumber}</td>
              <td>{interview.jobTitle}</td>
              
             
              <td>
                <select
                  value={interviewStatuses[interview.id]?.r1Status || ""}
                  onChange={(e) => handleStatusChange(interview, e.target.value)}
                >
                  <option value="">Select Status</option>
                  <option value="R2 Scheduled">R2 Scheduled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </td>
              <td>
                {interviewStatuses[interview.id]?.r1Status === "R2 Scheduled" ? (
                  <select
                    value={interviewStatuses[interview.id]?.r2Status || ""}
                    onChange={(e) => handleStatusChange(interview, e.target.value, true)}
                  >
                    <option value="">Select Status</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <span>{interviewStatuses[interview.id]?.r2Status || "NA"}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Interviews;
