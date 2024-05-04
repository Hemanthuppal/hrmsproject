import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import FinalSettlement from './FinalSettlement';

function FinalSettlementStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [settlementData, setSettlementData] = useState([]);
  const [showModal, setShowModal] = useState(false); 
  const handleModal = () => setShowModal(!showModal);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = settlementData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(settlementData.length / recordsPerPage);
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
    const fetchSettlementData = async () => {
      if (!loggedInEmployeeId) return;

      const settlementCollectionRef = collection(db, `settlements_${loggedInEmployeeId}`);
      const settlementDocs = await getDocs(settlementCollectionRef);
      const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSettlementData(settlementData);
    };

    fetchSettlementData();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (setId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerSettlementRef = doc(db, `settlements_${loggedInEmployeeId}`, setId);
      await updateDoc(managerSettlementRef, { status: newStatus });

      // Update in the employee's collection
      const employeeSettlementRef = doc(db, `settlements_${employeeUid}`, setId);
      await updateDoc(employeeSettlementRef, { status: newStatus });

      // Update local state to reflect the new status
      setSettlementData(prevState =>
        prevState.map(settlement =>
          settlement.id === setId ? { ...settlement, status: newStatus } : settlement
        )
      );
    } catch (error) {
      console.error('Error updating settlement status:', error);
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
      <div className="row justify-content-center">
        <div className="col-md-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        
          <h4>Settlement Status</h4>
          <div>
          <Button variant="primary" onClick={handleModal}>Apply For Resignation</Button> {/* Add Button */}
          </div>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
              <th>S.No</th>
                <th>EmployeeId</th>
                <th>Employee Name</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Status</th>
                {/* <th>Action</th> */}
              </tr>
            </thead>
            <tbody>
              {records.map((data,index) => (
                <tr key={data.id}>
                  <td>{index + 1}</td> 
                  <td>{data.employeeId}</td>
                  <td>{data.employeeName}</td>
                  <td>{data.resignationDate}</td>
                  <td>{data.lastWorkingDay}</td>
                  <td>{data.reason}</td>
                  <td style={{ ...styles.tableCell, ...getStatusStyle(data.status) }}>
                    {data.status}
                  </td>
                  {/* <td style={styles.tableCell}>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(data.id, data.employeeUid, e.target.value)}
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
        {/* Modal for applying leave */}
        <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Resignation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FinalSettlement />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default FinalSettlementStatus;
