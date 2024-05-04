import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './App'; // Ensure this is the correct import for your Firebase app instance

function SubmitExpenseReport() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [dateOfExpense, setDateOfExpense] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expensesStatus, setExpensesStatus] = useState('pending');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }
  
    setIsSubmitting(true); // Indicate that submission is in progress
  
    const storage = getStorage(app);
    const db = getFirestore(app);
  
    try {
      // Fetch manager UID for the logged-in employee
      const employeeDocRef = doc(db, "users", loggedInEmployeeId);
      const employeeDocSnap = await getDoc(employeeDocRef);
  
      if (!employeeDocSnap.exists()) {
        throw new Error("Logged-in employee not found.");
      }
  
      const loggedInEmployee = employeeDocSnap.data();
      const managerUid = loggedInEmployee.assignedManagerUid;
  
      if (!managerUid) {
        throw new Error("Assigned manager UID not available for the logged-in employee.");
      }
  
      // Retrieve employee ID and employee name
      const employeeId = loggedInEmployee.employeeId;
      const employeeName = loggedInEmployee.fullName;
  
      // Upload the receipt to Firebase Storage
      const receiptRef = storageRef(storage, `receipts/${loggedInEmployeeId}/${receipt.name}`);
      const snapshot = await uploadBytes(receiptRef, receipt);
      const receiptUrl = await getDownloadURL(snapshot.ref);
  
      // Prepare expense report data
      const expenseReportData = {
        dateOfExpense,
        expenseCategory,
        amount: Number(amount),
        description,
        receiptUrl,
        status: expensesStatus,
        employeeUid: loggedInEmployeeId,
        employeeId,
        employeeName,
      };
  
      // Save the expense report in both the employee's and manager's collections
      const newExpenseRef = doc(collection(db, `expenses_${loggedInEmployeeId}`));
      await setDoc(newExpenseRef, expenseReportData);
      
      const managerExpenseRef = doc(db, `expenses_${managerUid}`, newExpenseRef.id);
      await setDoc(managerExpenseRef, expenseReportData);
  
      alert("Expense report submitted successfully!");
    } catch (error) {
      console.error("Error submitting expense report:", error);
      alert("An error occurred while submitting the expense report. Please check the console for details.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  
    // Reset form fields after submission
    setDateOfExpense('');
    setExpenseCategory('');
    setAmount('');
    setDescription('');
    setReceipt(null);
    setExpensesStatus('pending');
  };
  

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="dateOfExpense" className="form-label">Date of Expense:</label>
          <input
            type="date"
            className="form-control"
            id="dateOfExpense"
            value={dateOfExpense}
            onChange={(e) => setDateOfExpense(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="expenseCategory" className="form-label">Expense Category:</label>
          <select
            className="form-select"
            id="expenseCategory"
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value)}
            required
          >
            <option value="">Choose a category</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
            <option value="supplies">Supplies</option>
            {/* Add other expense categories as needed */}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="amount" className="form-label">Amount:</label>
          <input
            type="number"
            className="form-control"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="receiptUpload" className="form-label">Receipt Upload:</label>
          <input
            type="file"
            className="form-control"
            id="receiptUpload"
            onChange={(e) => setReceipt(e.target.files[0])} // Assuming single file upload
          />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Submit Expense Report
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubmitExpenseReport;

