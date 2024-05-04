import React, { useState, useEffect } from 'react';

import { collection, query, where, getDocs ,doc,updateDoc} from 'firebase/firestore';

import { db } from '../App';

function ExpenseReportsTable() {
  
  const [expenseReports, setExpenseReports] = useState([]);

  // Fetch UIDs of all managers
  const fetchManagerUids = async () => {
    try {
      const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(userQuery);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching manager UIDs:', error);
      return [];
    }
  };

  // Fetch expense reports data for each manager
  const fetchAllManagersExpenseReports = async () => {
    try {
      const managerUids = await fetchManagerUids();
      let allExpenseReportsData = [];

      for (const managerUid of managerUids) {
        // Assuming there is an 'expenses' subcollection within each manager's document
        const expenseDocs = await getDocs(collection(db, `managerexpenses_${managerUid}`));
        const managerExpenseReportsData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allExpenseReportsData = allExpenseReportsData.concat(managerExpenseReportsData);
      }

      setExpenseReports(allExpenseReportsData);
    } catch (error) {
      console.error('Error fetching expense reports:', error);
    }
  };

  useEffect(() => {
    fetchAllManagersExpenseReports();
  },);

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
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4 id="welcome">Expense Reports</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Manager Id</th>
                <th>Manager Name</th>
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
      <div className="row r3">
        {/* Additional content for row r3 if needed */}
      </div>
    </div>
  );
}

export default ExpenseReportsTable;
