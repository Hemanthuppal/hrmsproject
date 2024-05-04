import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc,query,where } from 'firebase/firestore';
import { db } from '../App';

function LoanAdvanceRequestStatus() {
  const location = useLocation();
  const [loanRequests, setLoanRequests] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = loanRequests.slice(firstIndex, lastIndex);
  const npage = Math.ceil(loanRequests.length / recordsPerPage);
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
        const fetchedManagers = managersSnapshot.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName }));
        setManagers(fetchedManagers);
        console.log("fetchedManagers=",fetchedManagers)
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
          let allLoanRequests = [];
          for (const manager of managers) {
            const loanDocs = await getDocs(collection(db, `managerloan_${manager.uid}`));
            const managerLoanRequestsData = loanDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allLoanRequests = [...allLoanRequests, ...managerLoanRequestsData]; // Use spread operator to merge arrays
          }
          setLoanRequests(allLoanRequests);
        } else if (role === 'Employee' && selectedManager && selectedManager !== 'All') {
          const leaveCollectionRef = collection(db, `loan_advance_requests_${selectedManager}`);
          const leaveDocs = await getDocs(leaveCollectionRef);
          const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setLoanRequests(leaveData);
        } else if (role === 'Employee' && selectedManager === 'All') {
          let allLoanRequests = []; // Initialize an array to store all loan requests
          for (const employee of employees) {
            const leaveCollectionRef = collection(db, `loan_advance_requests_${employee.id}`);
            const leaveDocs = await getDocs(leaveCollectionRef);
            const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allLoanRequests = [...allLoanRequests, ...leaveData]; // Concatenate arrays
          }
          setLoanRequests(allLoanRequests);
        } else if (role === 'Employee') {
          let allLoanRequests = []; // Initialize an array to store all loan requests
          for (const employee of employees) {
            const leaveCollectionRef = collection(db, `loan_advance_requests_${employee.id}`);
            const leaveDocs = await getDocs(leaveCollectionRef);
            const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allLoanRequests = [...allLoanRequests, ...leaveData]; // Concatenate arrays
          }
          setLoanRequests(allLoanRequests);
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
    setLoanRequests([]);
  };

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      const employeeLoanApplicationRef = doc(db, `managerloan_${employeeUid}`, applicationId);
      await updateDoc(employeeLoanApplicationRef, { status: newStatus });

      setLoanRequests(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating loan application status:', error);
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
          <h4 id="welcome">Loan & Advance Request Status</h4>
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
                  <option value=""disabled>Select a Manager</option>
                  <option value="All">All Manager</option>
                  {managers.map(manager => (
                    <option key={manager.uid} value={manager.uid}>{manager.fullName}</option>
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
                <th> Repayment Plan</th>
                <th>Status</th>
                {role === 'Manager' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((application,index) => (
                <tr key={application.id}>
                  <td>{index + 1}</td> 
                   <td>{application.employeeId}</td>
                   <td>{application.employeeName}</td>
                  <td>{application.amountRequested}</td>
                  <td>{application.reason}</td>
                  <td>{application.proposedRepaymentPlan}</td>
                  <td style={{ ...styles.tableCell, ...getStatusStyle(application.status) }}>
                    {application.status}
                  </td>
                  {role === 'Manager' && (
                    <td>
                      <select
                        defaultValue=""
                        onChange={(e) => handleStatusChange(application.id, application.employeeUid, e.target.value)}
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

export default LoanAdvanceRequestStatus;
