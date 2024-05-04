import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'; // Updated imports
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerFinalSettlement from './ManagerFinalSettlement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function FinalSettlementStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [settlementData, setSettlementData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleModal = () => setShowModal(!showModal);

  useEffect(() => {
    const fetchSettlementData = async () => {
      const settlementCollectionRef = collection(db, `managersettlements_${loggedInEmployeeId}`);
      const settlementDocs = await getDocs(settlementCollectionRef);
      const data = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSettlementData(data);
    };

    fetchSettlementData();
  }, [loggedInEmployeeId]);

  const handleDelete = async (setId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this settlement request?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, `managersettlements_${loggedInEmployeeId}`, setId));
        setSettlementData(settlementData.filter(data => data.id !== setId));
      } catch (error) {
        console.error('Error deleting settlement request:', error);
        alert("Failed to delete settlement request.");
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
      <div className="row justify-content-center">
        <div className="col-md-12 mt-3">
          <Button variant="primary" onClick={handleModal}>Apply For Resignation</Button>
          <h4>Settlement Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>EmployeeId</th>
                <th>Employee Name</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th> {/* Added column for actions */}
              </tr>
            </thead>
            <tbody>
              {settlementData.map((data) => (
                <tr key={data.id}>
                  <td>{data.employeeId}</td>
                  <td>{data.employeeName}</td>
                  <td>{data.resignationDate}</td>
                  <td>{data.lastWorkingDay}</td>
                  <td>{data.reason}</td>
                  <td style={{ ...getStatusStyle(data.status) }}>
                    {data.status}
                  </td>
                  <td>
                    <Button variant="link" onClick={() => handleDelete(data.id)} className="text-danger">
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
          <Modal.Title>Resignation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerFinalSettlement />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default FinalSettlementStatus;
