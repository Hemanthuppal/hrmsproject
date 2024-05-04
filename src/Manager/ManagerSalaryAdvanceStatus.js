import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerSalaryAdvance from './ManagerSalaryAdvance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function SalaryAdvanceRequestStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [salaryAdvanceRequests, setSalaryAdvanceRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleModal = () => setShowModal(!showModal);

  useEffect(() => {
    const fetchSalaryAdvanceRequests = async () => {
      const collectionRef = collection(db, `managersalaryadvance__${loggedInEmployeeId}`);
      const docs = await getDocs(collectionRef);
      const data = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalaryAdvanceRequests(data);
    };

    fetchSalaryAdvanceRequests();
  }, [loggedInEmployeeId]);

  const handleDelete = async (requestId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this salary advance request?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, `managersalaryadvance__${loggedInEmployeeId}`, requestId));
        setSalaryAdvanceRequests(salaryAdvanceRequests.filter(request => request.id !== requestId));
      } catch (error) {
        console.error('Error deleting salary advance request:', error);
        alert("Failed to delete salary advance request.");
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
          <Button variant="primary" onClick={handleModal}>Apply Salary Advance</Button>
          <h4 id="welcome">Salary Advance Request Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Amount Requested</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salaryAdvanceRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.amountRequested}</td>
                  <td>{request.reason}</td>
                  <td style={getStatusStyle(request.status)}>{request.status}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(request.id)}>
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
          <Modal.Title>Salary Advance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerSalaryAdvance />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SalaryAdvanceRequestStatus;
