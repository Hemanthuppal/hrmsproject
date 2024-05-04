// SalaryAdvanceRequestStatus.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import SalaryAdvance from './SalaryAdvance';

function SalaryAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [salaryAdvanceRequests, setSalaryAdvanceRequests] = useState([]);
  const handleModal = () => setShowModal(!showModal);
  const [showModal, setShowModal] = useState(false); 

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = salaryAdvanceRequests.slice(firstIndex, lastIndex);
  const npage = Math.ceil(salaryAdvanceRequests.length / recordsPerPage);
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
    // Fetch salary advance requests based on loggedInEmployeeId
    const fetchSalaryAdvanceRequests = async () => {
      const collectionRef = collection(db, `salary_advance_requests_${loggedInEmployeeId}`);
      const docs = await getDocs(collectionRef);
      const data = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalaryAdvanceRequests(data);
    };

    fetchSalaryAdvanceRequests();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (requestId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerRequestRef = doc(db, `salary_advance_requests_${loggedInEmployeeId}`, requestId);
      await updateDoc(managerRequestRef, { status: newStatus });

      // Update in the employee's collection
      const employeeRequestRef = doc(db, `salary_advance_requests_${employeeUid}`, requestId);
      await updateDoc(employeeRequestRef, { status: newStatus });

      // Update local state to reflect the new status
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
        <div className="col-md-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 id="welcome">Salary Advance</h4>
          <div>
          <Button variant="primary" onClick={handleModal}>Apply Salary Advance</Button> {/* Add Button */}
          </div>
      </div>
          <table className="styled-table">
            <thead>
              <tr>
              <th>S.No</th>
                <th>Amount Requested</th>
                <th>Reason</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {records.map((request,index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td> 
                  <td>{request.amountRequested}</td>
                  <td>{request.reason}</td>
                  <td style={{ ...getStatusStyle(request.status) }}>
                    {request.status}
                  </td>
                  {/* <td>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(request.id, request.employeeUid, e.target.value)}
                    >
                      <option value="" disabled>Choose Action</option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td> */}
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
       {/* Modal for applying leave */}
       <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>salary advance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SalaryAdvance />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SalaryAdvanceRequestStatus;
