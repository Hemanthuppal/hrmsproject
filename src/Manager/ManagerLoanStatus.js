import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerLoan from './ManagerLoan';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [loanRequests, setLoanRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleModal = () => setShowModal(!showModal);

  useEffect(() => {
    const fetchLoanRequests = async () => {
      const loanCollectionRef = collection(db, `managerloan_${loggedInEmployeeId}`);
      const loanDocs = await getDocs(loanCollectionRef);
      const loanData = loanDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoanRequests(loanData);
    };
    fetchLoanRequests();
  }, [loggedInEmployeeId]);

  const handleDelete = async (loanId) => {
    if (window.confirm("Are you sure you want to delete this loan request?")) {
      try {
        await deleteDoc(doc(db, `managerloan_${loggedInEmployeeId}`, loanId));
        setLoanRequests(loanRequests.filter(request => request.id !== loanId));
        alert("Loan request deleted successfully.");
      } catch (error) {
        console.error('Error deleting loan request:', error);
        alert("Failed to delete loan request.");
      }
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
          <Button variant="primary" onClick={handleModal}>Add Loan</Button>
          <h4 id="welcome">Loan Request</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Reason</th>
                <th>Repayment Plan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loanRequests.map((application) => (
                <tr key={application.id}>
                  <td>{application.amountRequested}</td>
                  <td>{application.reason}</td>
                  <td>{application.proposedRepaymentPlan}</td>
                  <td style={getStatusStyle(application.status)}>{application.status}</td>
                  <td>
                    <Button variant="danger" onClick={() => handleDelete(application.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Loan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerLoan />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LoanAdvanceRequestStatus;
