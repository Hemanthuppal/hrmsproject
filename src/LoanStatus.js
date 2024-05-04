import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs,getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import Loan from './Loan';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [loanRequests, setLoanRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleModal = () => setShowModal(!showModal);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = loanRequests.slice(firstIndex, lastIndex);
  const npage = Math.ceil(loanRequests.length / recordsPerPage);
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
    const fetchLoanRequests = async () => {
      const loanCollectionRef = collection(db, `loan_advance_requests_${loggedInEmployeeId}`);
      const loanDocs = await getDocs(loanCollectionRef);
      const loanData = loanDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanRequests(loanData);
    };

    fetchLoanRequests();
  }, [loggedInEmployeeId]);

  const handleDelete = async (loanId) => {
    if (!window.confirm("Are you sure you want to delete this loan request?")) {
      return;
    }
  
    try {
      // Delete the loan request from the employee's collection
      await deleteDoc(doc(db, `loan_advance_requests_${loggedInEmployeeId}`, loanId));
  
      // Fetch the employee's document to get the assigned manager's UID
      const employeeDoc = await getDoc(doc(db, 'users', loggedInEmployeeId));
      if (employeeDoc.exists()) {
        const managerUid = employeeDoc.data().assignedManagerUid;
        if (managerUid) {
          // Delete the loan request from the manager's collection
          await deleteDoc(doc(db, `loan_advance_requests_${managerUid}`, loanId));
        } else {
          console.log("Manager UID not found for the employee.");
        }
      } else {
        console.error("Employee document does not exist.");
      }
  
      // Update the local state to reflect the deletion
      setLoanRequests(loanRequests.filter(loan => loan.id !== loanId));
    } catch (error) {
      console.error("Error deleting loan request:", error);
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
        <div className="col-md-12 ">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 id="welcome">Loan Request</h3>
            <Button variant="primary" onClick={handleModal}>+ Add Loan</Button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Repayment Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((application, index) => (
                <tr key={application.id}>
                  <td>{index + 1}</td>
                  <td>{application.amountRequested}</td>
                  <td>{application.reason}</td>
                  <td>{application.proposedRepaymentPlan}</td>
                  <td style={getStatusStyle(application.status)}>{application.status}</td>
                  <td>
                    <Button variant="danger" onClick={() => handleDelete(application.id)} className="btn-icon">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
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
      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Loan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Loan />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LoanAdvanceRequestStatus;
