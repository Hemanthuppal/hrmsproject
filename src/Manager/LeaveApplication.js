import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
function LeaveApplication() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [leaveApplications, setLeaveApplications] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = leaveApplications.slice(firstIndex, lastIndex);
  const npage = Math.ceil(leaveApplications.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  useEffect(() => {
    // Fetch leave applications based on loggedInEmployeeId
    const fetchLeaveApplications = async () => {
      const leaveCollectionRef = collection(db, `leave_${loggedInEmployeeId}`);
      const leaveDocs = await getDocs(leaveCollectionRef);
      const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaveApplications(leaveData);
    };

    fetchLeaveApplications();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `leave_${loggedInEmployeeId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update in the employee's collection
      const employeeLeaveApplicationRef = doc(db, `leave_${employeeUid}`, applicationId);
      await updateDoc(employeeLeaveApplicationRef, { status: newStatus });

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
      textAlign: 'center',
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
              <th>S.No</th>
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
              {records.map((application,index) => (
                <tr key={application.id}>
                  <td>{index + 1}</td>
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
          <nav aria-label="Page navigation example" style={{ position: "sticky", bottom: "5px", right: "10px", cursor: "pointer" }}>
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Previous" onClick={prePage}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {numbers.map((n, i) => (
            <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
              <a className="page-link" onClick={() => changeCPage(n)}>
                {n}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === npage ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Next" onClick={nextPage}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
        </nav>
        </div>
      </div>
      <div className="row r3"></div>
    </div>
  );
}

export default LeaveApplication;
