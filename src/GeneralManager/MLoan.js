import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function MLoan() {
  const [loanRequests, setLoanRequests] = useState([]);

  // Fetch UIDs of all managers
  const fetchManagerUids = async () => {
    try {
      const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(userQuery);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching manager UIDs:', error);
      return [];
    }
  };

  // Fetch loan and advance requests for each manager
  const fetchAllManagersLoanRequests = async () => {
    try {
      const managerUids = await fetchManagerUids();
      let allLoanRequestsData = [];

      for (const managerUid of managerUids) {
        const loanDocs = await getDocs(collection(db, `managerloan_${managerUid}`));
        const managerLoanRequestsData = loanDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allLoanRequestsData = allLoanRequestsData.concat(managerLoanRequestsData);
      }

      setLoanRequests(allLoanRequestsData);
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    }
  };

  useEffect(() => {
    fetchAllManagersLoanRequests();
  }, []);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      const employeeLoanApplicationRef = doc(db, `managerloan_${employeeUid}`, applicationId);
      await updateDoc(employeeLoanApplicationRef, { status: newStatus });

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
       
          <h4 id="welcome">Loan  Request </h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Manager Id</th>
                <th>Manager Name</th>
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
                  <td>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(application.id, application.employeeUid, e.target.value)}
                    >
                      <option value="" disabled>Select Action</option>
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

export default MLoan;
