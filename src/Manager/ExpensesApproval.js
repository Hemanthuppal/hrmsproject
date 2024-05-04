// ExpenseReportsTable.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function ExpenseReportsTable() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [expenseReports, setExpenseReports] = useState([]);

  useEffect(() => {
    const fetchExpenseReports = async () => {
      const expenseCollectionRef = collection(db, `expenses_${loggedInEmployeeId}`);
      const expenseDocs = await getDocs(expenseCollectionRef);
      const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenseReports(expenseData);
    };

    fetchExpenseReports();
  }, [loggedInEmployeeId]);

  const handleStatusChange = async (applicationId, employeeUid, newStatus) => {
    try {
      // Update in the manager's collection
      const managerExpenseRef = doc(db, `expenses_${loggedInEmployeeId}`, applicationId);
      await updateDoc(managerExpenseRef, { status: newStatus });

      // Update in the employee's collection
      const employeeExpenseRef = doc(db, `expenses_${employeeUid}`, applicationId);
      await updateDoc(employeeExpenseRef, { status: newStatus });

      // Update local state to reflect the new status
      setExpenseReports(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
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
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4 id="welcome">Expense Reports</h4>
          <table className="styled-table">
            <thead>
              <tr>
              <th>Employee Id</th>
              <th>Employee Name</th>
                <th>Date of Expense</th>
                <th>Expense Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Receipt URL</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenseReports.map((report) => (
                <tr key={report.id}>
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
                  <td style={{ ...getStatusStyle(report.status) }}>{report.status}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row r3"></div>
    </div>
  );
}

export default ExpenseReportsTable;
