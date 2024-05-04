// ManagersList.js
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../App'; // Update the path according to your structure

function ManagersList() {
  const [managers, setManagers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = managers.slice(firstIndex, lastIndex);
  const npage = Math.ceil(managers.length / recordsPerPage);
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
    const fetchManagers = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(q);
      const managersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
      setManagers(managersData);
    };

    fetchManagers();
  }, []);

  return (
    <div className="container ">
      <h2>Managers</h2>
      <table className="styled-table">
      <thead>
          <tr>
            <th>S.No</th>
            <th>Employee Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            
          </tr>
        </thead>
        <tbody>
        {records.map((manager, index) => ( 
            <tr key={manager.uid}>
              <td>{index + 1}</td> 
              <td>{manager.employeeId}</td>
              <td>{manager.fullName}</td>
              <td>{manager.email}</td>
              <td>{manager.mobile}</td>
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

export default ManagersList;
