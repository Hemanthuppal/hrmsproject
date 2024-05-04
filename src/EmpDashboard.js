import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './App';

function Dashboard({ setCurrentPage }) {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [approvedTrainingCount, setApprovedTrainingCount] = useState(0);
// New state for approved training count
  const dashboardLinkStyle = {
    textDecoration: 'none',
    color: '#333',
  };
  const dashboardBoxStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px',
  };


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch pending leave applications count
        const leaveCollectionRef = collection(db, `leave_${loggedInEmployeeId}`);
        const leaveQuery = query(leaveCollectionRef, where("status", "==", "pending"));
        const leaveQuerySnapshot = await getDocs(leaveQuery);
        setPendingLeaveCount(leaveQuerySnapshot.docs.length);

        // Fetch approved training requests count
        const trainingRequestsRef = collection(db, 'traininglist'); // Ensure this matches your actual collection name
        const trainingQuery = query(trainingRequestsRef, where("assignedToUid", "==", loggedInEmployeeId), where("status", "==", "Completed")); // Assuming "Completed" is the status for approved training
        const trainingQuerySnapshot = await getDocs(trainingQuery);
        setApprovedTrainingCount(trainingQuerySnapshot.docs.length);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchCounts();
  }, [loggedInEmployeeId]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      {/* Existing dashboard box for pending leave applications */}
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('viewLeave')}>
        <a href="#" style={dashboardLinkStyle}>Leave</a>
        <h4>Pending Leave Applications Count: {pendingLeaveCount}</h4>
      </div>
      
      {/* New dashboard box for approved training requests */}
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('viewTraining')}>
        <a href="#" style={dashboardLinkStyle}>Training</a>
        <h4>Approved Training Requests: {approvedTrainingCount}</h4>
      </div>
    </div>
  );
}

export default Dashboard;
