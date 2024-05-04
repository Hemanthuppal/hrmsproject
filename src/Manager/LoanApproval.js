import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [loanRequests, setLoanRequests] = useState([]);

  useEffect(() => {
    // Fetch loan and advance requests based on loggedInEmployeeId
    const fetchLoanRequests = async () => {
      const leaveCollectionRef = collection(db, `loan_advance_requests_${loggedInEmployeeId}`);
      const leaveDocs = await getDocs(leaveCollectionRef);
      const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanRequests(leaveData);
    };

    fetchLoanRequests();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `loan_advance_requests_${loggedInEmployeeId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update in the employee's collection
      const employeeLeaveApplicationRef = doc(db, `loan_advance_requests_${employeeUid}`, applicationId);
      await updateDoc(employeeLeaveApplicationRef, { status: newStatus });

      // Update local state to reflect the new status
      setLoanRequests(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating loan application status:', error);
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
          <h4 id="welcome">Loan & Advance Request Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
              <th>Employee Id </th>
              <th>Employee Name </th>
                <th>Amount </th>
                <th>Reason</th>
                <th> Repayment Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loanRequests.map((application) => (
                <tr key={application.id}>
                   <td>{application.employeeId}</td> 
                   <td>{application.employeeName}</td>
                  <td>{application.amountRequested}</td>
                  <td>{application.reason}</td>
                  <td>{application.proposedRepaymentPlan}</td>
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

export default LoanAdvanceRequestStatus;
