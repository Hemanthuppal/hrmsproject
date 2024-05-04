import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function ExpenseReportsTable() {
  const [expenseReports, setExpenseReports] = useState([]);
  const [role, setRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = expenseReports.slice(firstIndex, lastIndex);
  const npage = Math.ceil(expenseReports.length / recordsPerPage);
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
        console.log("fetchedEmployees=",fetchedEmployees)
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchExpenseReports = async () => {
      try {
        if (role === 'Manager' && managers.length > 0) {
          let allReports = [];
          for (const manager of managers) {
            const expensesCollectionRef = collection(db, `managerexpenses_${manager.id}`);
            try {
              const expenseDocs = await getDocs(expensesCollectionRef);
              const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              allReports = allReports.concat(expenseData);
            } catch (error) {
              console.error(`Error fetching expense reports for manager ${manager.id}:`, error);
            }
          }
          setExpenseReports(allReports);
        } else if (role === 'Employee' && selectedManager && selectedManager !== 'All') {
          const expensesCollectionRef = collection(db, `expenses_${selectedManager}`);
          try {
            const expenseDocs = await getDocs(expensesCollectionRef);
            const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setExpenseReports(expenseData);
          } catch (error) {
            console.error('Error fetching expense reports:', error);
          }
        } else if (role === 'Employee' && selectedManager === 'All') {
          let allReports = [];
          for (const employee of employees) {
            const expensesCollectionRef = collection(db, `expenses_${employee.id}`);
            try {
              const expenseDocs = await getDocs(expensesCollectionRef);
              const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              allReports = allReports.concat(expenseData);
            } catch (error) {
              console.error('Error fetching expense reports:', error);
            }
          }
          setExpenseReports(allReports);
        } else if (role === 'Employee') {
          let allReports = [];
          for (const employee of employees) {
            const expensesCollectionRef = collection(db, `expenses_${employee.id}`);
            try {
              const expenseDocs = await getDocs(expensesCollectionRef);
              const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              allReports = allReports.concat(expenseData);
            } catch (error) {
              console.error('Error fetching expense reports:', error);
            }
          }
          setExpenseReports(allReports);
        }
      } catch (error) {
        console.error('Error fetching expense reports:', error);
      }
    };
  
    fetchExpenseReports();
  }, [role, selectedManager, managers, employees]);
  

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager('');
    setExpenseReports([]);
  };

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
  };

  const handleStatusChange = async (expenseReportId, employeeUid, newStatus) => {
    try {
      // Assuming you have a 'managerexpenses' collection where expense reports are stored
      const expenseDocRef = doc(db, `managerexpenses_${employeeUid}`, expenseReportId);

      // Update the 'status' field of the expense report
      await updateDoc(expenseDocRef, { status: newStatus });

      // Update the local state to reflect the change
      setExpenseReports((prevExpenseReports) =>
        prevExpenseReports.map((report) =>
          report.id === expenseReportId ? { ...report, status: newStatus } : report
        )
      );

      console.log(`Expense report ${expenseReportId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating expense report status:', error);
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

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-3">
          <h4>Expense Reports</h4>
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
          <table className="styled-table mt-4">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Employee Id</th>
                <th>Employee Name</th>
                <th>Date of Expense</th>
                <th>Expense Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Receipt URL</th>
                <th>Status</th>
                {role === 'Manager' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1}</td> 
                  <td>{report.employeeId}</td>
                  <td>{report.employeeName}</td>
                  <td>{report.dateOfExpense}</td>
                  <td>{report.expenseCategory}</td>
                  <td>{report.amount}</td>
                  <td>{report.description}</td>
                  <td>
                    <a href={report.receiptUrl} target="_blank" rel="noopener noreferrer">
                      View Receipt
                    </a>
                  </td>
                  <td style={getStatusStyle(report.status)}>{report.status}</td>
                  {role === 'Manager' && (
                    <td>
                     <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(report.id, report.employeeUid, e.target.value)}
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

export default ExpenseReportsTable;
