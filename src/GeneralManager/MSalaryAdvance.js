import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function MSalaryAdvance() {
  const [salaryAdvanceRequests, setSalaryAdvanceRequests] = useState([]);

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

  const fetchAllManagersSalaryAdvanceRequests = async () => {
    try {
      const managerUids = await fetchManagerUids();
      let allSalaryAdvanceRequestsData = [];

      for (const managerUid of managerUids) {
        const salaryAdvanceDocs = await getDocs(collection(db, `managersalaryadvance__${managerUid}`));
        const managerSalaryAdvanceRequestsData = salaryAdvanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allSalaryAdvanceRequestsData = allSalaryAdvanceRequestsData.concat(managerSalaryAdvanceRequestsData);
      }

      setSalaryAdvanceRequests(allSalaryAdvanceRequestsData);
    } catch (error) {
      console.error('Error fetching salary advance requests:', error);
    }
  };

  useEffect(() => {
    fetchAllManagersSalaryAdvanceRequests();
  }, []);

  const handleStatusChange = async (requestId, employeeUid, newStatus) => {
    try {
      const employeeRequestRef = doc(db, `managersalaryadvance__${employeeUid}`, requestId);
      await updateDoc(employeeRequestRef, { status: newStatus });

      setSalaryAdvanceRequests(prevState =>
        prevState.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Error updating salary advance request status:', error);
    }
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
          <h4 id="welcome">Salary Advance Request Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Manager Id</th>
                <th>Manager Name</th>
                <th>Amount </th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salaryAdvanceRequests.map((request) => (
                <tr key={request.id}>
                    <td>{request.employeeId}</td>
                    <td>{request.employeeName}</td>
                  <td>{request.amountRequested}</td>
                  <td>{request.reason}</td>
                  <td style={{ ...getStatusStyle(request.status) }}>
                    {request.status}
                  </td>
                  <td>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(request.id, request.employeeUid, e.target.value)}
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

export default MSalaryAdvance;
