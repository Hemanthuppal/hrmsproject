import React, { useState, useEffect } from 'react';
import { collection, getDocs,query,where } from 'firebase/firestore';
import { db } from '../App'; 
import { useLocation } from 'react-router-dom';

function ExitProcedure() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [exitDetails, setExitDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = exitDetails.slice(firstIndex, lastIndex);
  const npage = Math.ceil(exitDetails.length / recordsPerPage);
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
    const fetchExitDetails = async () => {
      try {
        const exitProcedureCollection = collection(db, 'exitProcedure');
        const querySnapshot = await getDocs(
          query(exitProcedureCollection, where('assignedManagerUid', '==', loggedInEmployeeId))
        );
  
        const exitDetailsData = [];
        querySnapshot.forEach((doc) => {
          exitDetailsData.push({ id: doc.id, ...doc.data() });
        });
  
        setExitDetails(exitDetailsData);
      } catch (error) {
        console.error('Error fetching exit details:', error);
      }
    };
  
    if (loggedInEmployeeId) {
      fetchExitDetails();
    }
  }, [loggedInEmployeeId]);
  

  return (
    <div className="container">
      <h3>Exit Details</h3>
      <table className="styled-table">
        <thead>
          <tr>
          <th>S.No</th>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Departure Date</th>
            <th>Reason for Departure</th>
            <th>Notice Period</th>
            <th>Final Settlement Details</th>
            <th>Exit Checklist</th>
            <th>Experience Certificate</th>
            
          </tr>
        </thead>
        <tbody>
          {records.map((exitDetail,index) => (
            <tr key={exitDetail.id}>
              <td>{index + 1}</td> 
              <td>{exitDetail.employeeId}</td>
              <td>{exitDetail.name}</td>
              <td>{exitDetail.department}</td>
              <td>{exitDetail.departureDate}</td>
              <td>{exitDetail.reasonForDeparture}</td>
              <td>{exitDetail.noticePeriod}</td>
              <td>{exitDetail.finalSettlementDetails}</td>
              <td>{exitDetail.exitChecklist}</td>
              <td>{exitDetail.experienceCertificate}</td>
              
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
  );
}

export default ExitProcedure;