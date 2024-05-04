import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './App';
import { Modal, Button } from 'react-bootstrap';
import ApplyLeave from './ApplyLeave';
import { doc, deleteDoc,getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function LeaveStatus() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [leaveApplications, setLeaveApplications] = useState([]);
  const [showModal, setShowModal] = useState(false); 

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

  const fetchLeaveApplications = async () => {
    const leaveCollectionRef = collection(db, `leave_${loggedInEmployeeId}`);
    const leaveDocs = await getDocs(leaveCollectionRef);
    const leaveData = leaveDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setLeaveApplications(leaveData);
  };

  useEffect(() => {
    fetchLeaveApplications();
  }, [loggedInEmployeeId]); // Add fetchLeaveApplications to the dependency array if you're using ESLint rules that require it

  const handleModal = () => setShowModal(!showModal);

  const handleDelete = async (leaveId) => {
    if (!window.confirm("Are you sure you want to delete this leave application?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, `leave_${loggedInEmployeeId}`, leaveId));

      const employeeDoc = await getDoc(doc(db, 'users', loggedInEmployeeId));
      if (employeeDoc.exists()) {
        const managerUid = employeeDoc.data().assignedManagerUid;
        if (managerUid) {
          await deleteDoc(doc(db, `leave_${managerUid}`, leaveId));
        } else {
          console.log("Manager UID not found for the employee.");
        }
      } else {
        console.log("Employee document does not exist.");
      }

      fetchLeaveApplications(); // Now accessible
    } catch (error) {
      console.error("Error deleting leave application:", error);
    }
  };


  return (
    <div className="container">
      <div className="row r2">
        
        <div className="col-md-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        
          <h4 id="welcome" className='text-center'>Leave Status</h4>
          <div>
          <Button variant="primary" onClick={handleModal}>Apply Leave</Button> {/* Add Button */}
          </div>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((application,index) => (
                <tr key={application.id}>
                  <td>{index + 1}</td> 
                  <td>{application.leaveType}</td>
                  <td>{application.fromDate}</td>
                  <td>{application.toDate}</td>
                  <td>{application.description}</td>
                  <td>{application.status}</td>
                  <td>
                <button className="btn btn-danger" onClick={() => handleDelete(application.id)}>
                  <FontAwesomeIcon icon={faTrash} />
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
      <div className="row r3"></div>
       {/* Modal for applying leave */}
       <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ApplyLeave />
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default LeaveStatus;
