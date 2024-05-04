import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getFirestore, collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "./App";

function EmployeeReport() {
  const location = useLocation();
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = performanceData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(performanceData.length / recordsPerPage);
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
    setIsLoading(true);
    const db = getFirestore();
    const q = query(collection(db, `metrics-${loggedInEmployeeId}`), orderBy("createdAt", "desc"));

    getDocs(q)
      .then((querySnapshot) => {
        const fetchedData = [];
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() });
        });
        setPerformanceData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setError(error);
        setIsLoading(false);
      });
  }, [loggedInEmployeeId]);

 

  return (
    <div className="container">
      <h3>Performance Report</h3>
      <table className="styled-table">
        <thead>
          <tr>
          <th>S.No</th>
            <th>Date</th>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Total Points</th>
            <th>Average Points</th>
            <th>Remarks</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((item, index) => (
            <tr key={item.id}>
                <td>{index+1}</td>
              <td>{item.date}</td>
              <td>{item.employeeId}</td>
              <td>{item.fullName}</td>
              <td>{item.role}</td>
              <td>{item.totalPoints}</td>
              <td>{item.averagePoints}</td>
              <td>{item.remarks}</td>
              <td>{item.status || "Not Reviewed"}</td>

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

export default EmployeeReport;
