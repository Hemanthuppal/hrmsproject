// ExpenseReportsTable.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc ,deleteDoc  } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';
import ManagerExpenses from './ManagerExpenses';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function ExpenseReportsTable() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [expenseReports, setExpenseReports] = useState([]);
  const [showModal, setShowModal] = useState(false); 

  const handleModal = () => setShowModal(!showModal);


  useEffect(() => {
    const fetchExpenseReports = async () => {
      const expenseCollectionRef = collection(db, `managerexpenses_${loggedInEmployeeId}`);
      const expenseDocs = await getDocs(expenseCollectionRef);
      const expenseData = expenseDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenseReports(expenseData);
    };

    fetchExpenseReports();
  }, [loggedInEmployeeId]);


  const handleDelete = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this expense report?")) {
      await deleteDoc(doc(db, `managerexpenses_${loggedInEmployeeId}`, reportId));
      setExpenseReports(expenseReports.filter(report => report.id !== reportId));
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
        <Button variant="primary" onClick={handleModal}>Add Expense</Button> {/* Add Button */}
          <h4 id="welcome">Expense Reports</h4>
          <table className="styled-table">
            <thead>
              <tr>
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
                    <Button variant="danger" size="sm" onClick={() => handleDelete(report.id)} className="btn-icon">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="row r3">

      <Modal show={showModal} onHide={handleModal}>
        <Modal.Header closeButton>
          <Modal.Title> Expenses</Modal.Title>
        </Modal.Header>
        <Modal.Body className='col-lg'>
          <ManagerExpenses />
        </Modal.Body>
      </Modal>
      </div>
    </div>
  );
}

export default ExpenseReportsTable;
