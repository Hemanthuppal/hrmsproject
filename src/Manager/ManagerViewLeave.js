import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerApplyLeave from './ManagerApplyLeave';
// Import Font Awesome if you're using an icon for the delete button
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function ManagerViewLeave() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [leaveApplications, setLeaveApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      const leaveCollectionRef = collection(db, `Managerleave_${loggedInEmployeeId}`);
      const leaveDocs = await getDocs(leaveCollectionRef);
      const leaveData = [];
      leaveDocs.forEach((doc) => {
        leaveData.push({ id: doc.id, ...doc.data() });
      });

      setLeaveApplications(leaveData);
    };

    fetchLeaveApplications();
  }, [loggedInEmployeeId]);

  const handleModal = () => setShowModal(!showModal);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave application?")) {
      await deleteDoc(doc(db, `Managerleave_${loggedInEmployeeId}`, id));
      // Refresh the leave applications to reflect the deletion
      const updatedLeaveApplications = leaveApplications.filter(application => application.id !== id);
      setLeaveApplications(updatedLeaveApplications);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = leaveApplications.slice(firstIndex, lastIndex);
  const npage = Math.ceil(leaveApplications.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const prePage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    if (currentPage < npage) setCurrentPage(currentPage + 1);
  };

  const changeCPage = (id) => {
    setCurrentPage(id);
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 ">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 id="welcome">Leave Status</h4>
            <Button variant="primary" onClick={handleModal}>Apply Leave</Button>
          </div>
          <table className="styled-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Leave Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Action</th> {/* Add an Action header for the delete button */}
              </tr>
            </thead>
            <tbody>
              {records.map((application, index) => (
                <tr key={application.id}>
                  <td>{firstIndex + index + 1}</td> {/* Adjusted to correctly show the S.No */}
                  <td>{application.leaveType}</td>
                  <td>{application.fromDate}</td>
                  <td>{application.toDate}</td>
                  <td>{application.description}</td>
                  <td>{application.status}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(application.id)}>
                      <FontAwesomeIcon icon={faTrash} /> {/* Use an icon for the delete button */}
                    </button>
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
      {/* Modal for applying leave */}
      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManagerApplyLeave />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default ManagerViewLeave;
