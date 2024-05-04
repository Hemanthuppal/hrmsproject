import React, { useState, useEffect } from "react";
import { db } from "../App"; // Ensure this is the correct import path
import { collection, getDocs, query } from "firebase/firestore";

const AdminSelectedCandidates = () => {
  const [interviews, setInterviews] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = interviews.slice(firstIndex, lastIndex);
  const npage = Math.ceil(interviews.length / recordsPerPage);
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


  const fetchEmployeeIds = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    const employeeIds = querySnapshot.docs.map(doc => doc.id);
    return employeeIds;
  };

  const fetchInterviewsForEmployee = async (employeeId) => {
    try {
      const q = query(collection(db, `interviews-${employeeId}`));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error fetching interviews for employee ${employeeId}: `, error);
      return [];
    }
  };

  const fetchAllInterviews = async () => {
    try {
      const employeeIds = await fetchEmployeeIds();
      const allInterviews = await Promise.all(
        employeeIds.map(employeeId => fetchInterviewsForEmployee(employeeId))
      );
      setInterviews(allInterviews.flat().filter(interview => interview.r2Status === "Selected"));
    } catch (error) {
      console.error("Error fetching all interviews: ", error);
    }
  };

  useEffect(() => {
    fetchAllInterviews();
  }, []);

  return (
    <div>
      <h2>Selected Candidates</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Contacted</th>
            
            <th>Status</th>
            <th>Skills</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {records.map((interview, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{interview.name}</td>
              <td>{interview.email}</td>
              <td>{interview.mobileNumber}</td>
              <td>{interview.contacted}</td>
              
              <td>{interview.r2Status}</td>
              <td>{interview.skills}</td>
              <td>
                <a href={interview.resume} target="_blank" rel="noopener noreferrer">Resume</a>
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
  );
};

export default AdminSelectedCandidates;
