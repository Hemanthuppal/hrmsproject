import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc,query,where } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { db } from '../App';

function FinalSettlement() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [settlementData, setSettlementData] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

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
    const fetchSettlementData = async () => {
      try {
        if (role === 'Manager') {
          let allSettlementData = []; 
          for (const manager of managers) {
            const settlementCollectionRef = collection(db, `managersettlements_${manager.id}`);
            const settlementDocs = await getDocs(settlementCollectionRef);
            const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allSettlementData = [...allSettlementData, ...settlementData];
          }
  
          setSettlementData(allSettlementData); // Update state with accumulated data
        } else if (role === 'Employee' && selectedManager && selectedManager !== 'All') {
          console.log("Selected Manager:", selectedManager);
          // Fetch settlement requests for the selected manager (if employee role and manager selected)
          const settlementCollectionRef = collection(db, `settlements_${selectedManager}`);
          const settlementDocs = await getDocs(settlementCollectionRef);
          const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSettlementData(settlementData);
        } else if (role === 'Employee' && selectedManager === 'All') {
          // Fetch settlement requests for all employees
          let allSettlementData = []; // Accumulate data from all employees
  
          for (const employee of employees) {
            const settlementCollectionRef = collection(db, `settlements_${employee.id}`);
            const settlementDocs = await getDocs(settlementCollectionRef);
            const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allSettlementData = [...allSettlementData, ...settlementData];
          }
  
          setSettlementData(allSettlementData); // Update state with accumulated data
        } else if (role === 'Employee') {
          // Fetch settlement requests for all employees
          let allSettlementData = []; // Accumulate data from all employees
  
          for (const employee of employees) {
            const settlementCollectionRef = collection(db, `settlements_${employee.id}`);
            const settlementDocs = await getDocs(settlementCollectionRef);
            const settlementData = settlementDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allSettlementData = [...allSettlementData, ...settlementData];
          }
  
          setSettlementData(allSettlementData); // Update state with accumulated data
        }
      } catch (error) {
        console.error('Error fetching settlement requests:', error);
      }
    };
  
    fetchSettlementData();
  }, [role, selectedManager, managers, employees]);
  

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager('');
    setSettlementData([]);
  };

  const handleStatusChange = async (setId, employeeUid, newStatus) => {
    try {
      const employeeSettlementRef = doc(db, `managersettlements_${employeeUid}`, setId);
      await updateDoc(employeeSettlementRef, { status: newStatus });

      setSettlementData((prevSettlementData) =>
        prevSettlementData.map((settlement) =>
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

  const handleManagerChange = (event) => {
    setSelectedManager(event.target.value);
  };

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4>Settlement Status</h4>
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
                <th>EmployeeId</th>
                <th>Employee Name</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Status</th>
                {role === 'Manager' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((data, index) => (
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
                  {role === 'Manager' && (
                    <td>
                      <select
                        defaultValue=""
                        onChange={(e) => handleStatusChange(data.id, data.employeeUid, e.target.value)}
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
    </div>
  );
}

export default FinalSettlement;
