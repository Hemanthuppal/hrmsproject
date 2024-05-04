// SalaryAdvanceRequest.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';

function SalaryAdvanceRequest() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [amountRequested, setAmountRequested] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    setIsSubmitting(true); // Indicate that submission is in progress

    const db = getFirestore();

    try {
      // Fetch manager UID and employee details for the logged-in employee
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

      // Prepare salary advance request data
      const salaryAdvanceRequestData = {
        amountRequested: Number(amountRequested),
        reason,
        employeeUid: loggedInEmployeeId,
        employeeId: loggedInEmployee.employeeId, // Add employee ID to the request data
        employeeName: loggedInEmployee.fullName, // Add employee name to the request data
        isSalaryAdvance: true,
        status:'pending', // Additional field to specify it's a salary advance
      };

      // Save the salary advance request in the employee's collection
      const newRequestRef = await addDoc(collection(db, `salary_advance_requests_${loggedInEmployeeId}`), salaryAdvanceRequestData);

      // Save the salary advance request in the manager's collection
      const managerRequestRef = await setDoc(doc(db, `salary_advance_requests_${managerUid}`, newRequestRef.id), salaryAdvanceRequestData);

      alert("Salary Advance Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting salary advance request:", error);
      alert("An error occurred while submitting the salary advance request. Please check the console for details.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }

    // Reset form fields after submission
    setAmountRequested('');
    setReason('');
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="amountRequested" className="form-label">Amount Requested:</label>
          <input
            type="number"
            className="form-control"
            id="amountRequested"
            value={amountRequested}
            onChange={(e) => setAmountRequested(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="reason" className="form-label">Reason:</label>
          <textarea
            className="form-control"
            id="reason"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Submit Salary Advance Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default SalaryAdvanceRequest;
