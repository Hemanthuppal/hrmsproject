import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../App'; // Update the path according to your structure

function EmployeeDisplay() {
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10); // State for records per page

  const { data: salesExecutives = [], isLoading, isError } = useQuery(
    'salesExecutives',
    () => fetchSalesExecutives(),
    {
      staleTime: 3600000, // 1 hour in milliseconds
      cacheTime: 3600000, // 1 hour in milliseconds
    }
  );

  async function fetchSalesExecutives() {
    const q = query(collection(db, 'users'), where('role', '==', 'Employee'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
  }

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage < Math.ceil(salesExecutives.length / recordsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching data</div>;

  // Calculate pagination
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = salesExecutives.slice(firstIndex, lastIndex);
  const npage = Math.ceil(salesExecutives.length / recordsPerPage);
  const numbers = Array.from({ length: npage }, (_, i) => i + 1);

  return (
    <div className="container ">
      <h2>Employees</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Employee Id</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Department</th>
            <th>Assigned Manager</th>
          </tr>
        </thead>
        <tbody>
          {records.map((executive, index) => (
            <tr key={executive.uid}>
              <td>{firstIndex + index + 1}</td>
              <td>{executive.employeeId}</td>
              <td>{executive.fullName}</td>
              <td>{executive.email}</td>
              <td>{executive.mobile}</td>
              <td>{executive.department}</td>
              <td>{executive.assignedManager}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav
        aria-label="Page navigation example"
        style={{ position: 'sticky', bottom: '5px', right: '10px', cursor: 'pointer' }}
      >
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" aria-label="Previous" onClick={prePage}>
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          {numbers.map((n, i) => (
            <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
              <button className="page-link" onClick={() => changeCPage(n)}>
                {n}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
            <button className="page-link" aria-label="Next" onClick={nextPage}>
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default EmployeeDisplay;
