import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../App"; // Ensure this is the correct import
import { collection, getDocs, query } from "firebase/firestore";

const SelectedCandidates = () => {
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  const fetchInterviews = async () => {
    try {
      const q = query(collection(db, `interviews-${loggedInEmployeeId}`));
      const querySnapshot = await getDocs(q);
      const filteredInterviews = [];
      querySnapshot.forEach((doc) => {
        const interviewData = doc.data();
        if (interviewData.r2Status === "Selected") {
          filteredInterviews.push({ id: doc.id, ...interviewData });
        }
      });
      setInterviews(filteredInterviews);
    } catch (error) {
      console.error("Error fetching interviews: ", error);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [location.state.loggedInEmployeeId]);

  return (
    <div>
      <h2>Selected Candidates</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Position</th>
            <th>Contacted</th>
            <th>Scheduling</th>
            <th>R2 Status</th>
            <th>Skills</th>
            <th>Resume</th>
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
              <td>{interview.contacted}</td>
              <td>{interview.scheduling}</td>
             
              <td>{interview.r2Status}</td>
              <td>{interview.skills}</td>
              <td>
                <a href={interview.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectedCandidates;
