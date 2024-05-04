import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../App';

function SalaryAdvanceRequestStatus() {
  const [salaryAdvanceRequests, setSalaryAdvanceRequests] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = salaryAdvanceRequests.slice(firstIndex, lastIndex);
  const npage = Math.ceil(salaryAdvanceRequests.length / recordsPerPage);
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
      try {
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where('role', '==', 'Manager'));
        const managersSnapshot = await getDocs(managersQuery);
        const fetchedManagers = managersSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
        setManagers(fetchedManagers);
        console.log('managers:', fetchedManagers);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const usersRef = collection(db, 'users');
        const employeesQuery = query(usersRef, where('role', '==', 'Employee'));
        const employeesSnapshot = await getDocs(employeesQuery);
        const fetchedEmployees = employeesSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchSalaryAdvanceRequests = async () => {
      try {
        let allRequests = []; // Initialize an array to store all requests
  
        if (role === 'Manager') {
          // Fetch salary advance requests for each manager
          for (const manager of managers) {
            const managerSalaryAdvanceCollectionRef = collection(db, `managersalaryadvance__${manager.id}`);
            const managerSalaryAdvanceDocs = await getDocs(managerSalaryAdvanceCollectionRef);
            const managerSalaryAdvanceData = managerSalaryAdvanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allRequests = [...allRequests, ...managerSalaryAdvanceData]; // Concatenate arrays
          }
        } else if (role === 'Employee' && selectedManager && selectedManager !== 'All') {
          // Fetch salary advance requests for the selected manager
          const selectedManagerSalaryAdvanceCollectionRef = collection(db, `salary_advance_requests_${selectedManager}`);
          const selectedManagerSalaryAdvanceDocs = await getDocs(selectedManagerSalaryAdvanceCollectionRef);
          const selectedManagerSalaryAdvanceData = selectedManagerSalaryAdvanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          allRequests = [...allRequests, ...selectedManagerSalaryAdvanceData]; // Concatenate arrays
        } else if (role === 'Employee' && selectedManager === 'All') {
          // Fetch salary advance requests for all employees
          for (const employee of employees) {
            const employeeSalaryAdvanceCollectionRef = collection(db, `salary_advance_requests_${employee.id}`);
            const employeeSalaryAdvanceDocs = await getDocs(employeeSalaryAdvanceCollectionRef);
            const employeeSalaryAdvanceData = employeeSalaryAdvanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allRequests = [...allRequests, ...employeeSalaryAdvanceData]; // Concatenate arrays
          }
        } else if (role === 'Employee') {
          // Fetch salary advance requests for all employees
          for (const employee of employees) {
            const employeeSalaryAdvanceCollectionRef = collection(db, `salary_advance_requests_${employee.id}`);
            const employeeSalaryAdvanceDocs = await getDocs(employeeSalaryAdvanceCollectionRef);
            const employeeSalaryAdvanceData = employeeSalaryAdvanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allRequests = [...allRequests, ...employeeSalaryAdvanceData]; // Concatenate arrays
          }
        }
  
        // Update the state with all fetched requests
        setSalaryAdvanceRequests(allRequests);
      } catch (error) {
        console.error('Error fetching salary advance requests:', error);
      }
    };
  
    fetchSalaryAdvanceRequests();
  }, [role, selectedManager, managers, employees]);
  
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager('');
    setSalaryAdvanceRequests([]);
  };

  const handleStatusChange = async (requestId, employeeUid, newStatus) => {
    try {
      const employeeRequestRef = doc(db, `managersalaryadvance__${employeeUid}`, requestId);
      await updateDoc(employeeRequestRef, { status: newStatus });

      setSalaryAdvanceRequests(prevState =>
        prevState.map(request =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Error updating salary advance request status:', error);
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

  const handleManagerChange = (event) => {
    setSelectedManager(event.target.value);
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4 id="welcome">Salary Advance Request Status</h4>
          <div className='row'>
          <div className='col-md-4'>
            <label htmlFor="roleSelect" className="form-label">Select Role:</label>
            <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
              <option value="" disabled>Select Role</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
            </div>
            {role === 'Employee' && (
              <>
              <div className='col-md-4'>
                <label htmlFor="managerSelect" className="form-label" style={{ marginLeft: '10px' }}>Select Manager:</label>
                <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                  <option value="" disabled>Select a Manager</option>
                  <option value="All">All Manager</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>{manager.fullName}</option>
                  ))}
                </select>
                </div>
              </>
            )}
          </div>
          <table className="styled-table">
            <thead>
              <tr>
              <th>S.No</th>
                <th>Employee Id </th>
                <th>Employee Name </th>
                <th>Amount </th>
                <th>Reason</th>
                <th>Status</th>
                {role === 'Manager' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((request,index) => (
                <tr key={request.id}>
                  <td>{index + 1}</td> 
                  <td>{request.employeeId}</td>
                  <td>{request.employeeName}</td>
                  <td>{request.amountRequested}</td>
                  <td>{request.reason}</td>
                  <td style={{ ...getStatusStyle(request.status) }}>
                    {request.status}
                  </td>
                  {role === 'Manager' && (
                    <td>
                      <select
                        defaultValue=""
                        onChange={(e) => handleStatusChange(request.id, request.employeeUid, e.target.value)}
                      >
                        <option value="" disabled>Select Action</option>
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                      </select>
                    </td>
                  )}
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
    </div>
  );
}

export default SalaryAdvanceRequestStatus;
