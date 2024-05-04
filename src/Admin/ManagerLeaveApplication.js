import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function LeaveApplications() {
  const [leaveApplications, setLeaveApplications] = useState([]);

  useEffect(() => {
    const fetchLeaveApplicationsForManagers = async () => {
      try {
        // Fetch users who are managers
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where("role", "==", "Manager"));
        const managersSnapshot = await getDocs(managersQuery);
        const managerIds = managersSnapshot.docs.map(doc => doc.id);

        // Fetch leave applications for each manager and aggregate
        let aggregatedLeaveApplications = [];
        for (const managerId of managerIds) {
          const leaveCollectionRef = collection(db, `Managerleave_${managerId}`);
          const leaveDocs = await getDocs(leaveCollectionRef);
          const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          aggregatedLeaveApplications = [...aggregatedLeaveApplications, ...leaveData];
        }

        setLeaveApplications(aggregatedLeaveApplications);
      } catch (error) {
        console.error('Error fetching leave applications for managers:', error);
      }
    };

    fetchLeaveApplicationsForManagers();
  }, []);

  const handleStatusChange = async (applicationId, managerId, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `Managerleave_${managerId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update local state to reflect the new status
      setLeaveApplications(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating leave application status:', error);
    }
  };

  const styles = {
    tableHeader: {
      padding: '8px',
      textAlign: 'left',
    },
    tableCell: {
      padding: '8px',
      textAlign: 'left',
    },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'Rejected':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return { color: 'black', fontWeight: 'bold' };
    }
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4 id="welcome">Leave Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
               <th>Username</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveApplications.map((application) => (
                <tr key={application.id}>
                  <td>{application.fullName}</td>
                  <td>{application.leaveType}</td>
                  <td>{application.fromDate}</td>
                  <td>{application.toDate}</td>
                  <td>{application.description}</td>
                  <td style={{ ...styles.tableCell, ...getStatusStyle(application.status) }}>
                    {application.status}
                  </td>
                  <td style={styles.tableCell}>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(application.id, application.employeeUid, e.target.value)}
                    >
                      <option value="" disabled>Choose Action</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row r3"></div>
    </div>
  );
}

export default LeaveApplications;
