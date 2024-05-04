import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, setDoc, collection, addDoc,getDoc } from 'firebase/firestore';

function LoanAdvanceRequest() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [amountRequested, setAmountRequested] = useState('');
  const [reason, setReason] = useState('');
  const [proposedRepaymentPlan, setProposedRepaymentPlan] = useState('');
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

      // Prepare loan & advance request data
      const loanAdvanceRequestData = {
        amountRequested: Number(amountRequested),
        reason,
        proposedRepaymentPlan,
        employeeUid: loggedInEmployeeId,
        employeeId: loggedInEmployee.employeeId, // Add employee ID to the request data
        employeeName: loggedInEmployee.fullName,
        status:'pending',
      };

      // Save the loan & advance request in the employee's collection
      const newRequestRef = await addDoc(collection(db, `loan_advance_requests_${loggedInEmployeeId}`), loanAdvanceRequestData);

      // Save the loan & advance request in the manager's collection
      const managerRequestRef = await setDoc(doc(db, `loan_advance_requests_${managerUid}`, newRequestRef.id), loanAdvanceRequestData);

      alert("Loan & Advance Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting loan & advance request:", error);
      alert("An error occurred while submitting the loan & advance request. Please check the console for details.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }

    // Reset form fields after submission
    setAmountRequested('');
    setReason('');
    setProposedRepaymentPlan('');
  };
  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="amountRequested" className="form-label">Amount Required:</label>
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

        <div className="mb-3">
          <label htmlFor="proposedRepaymentPlan" className="form-label">Repayment Plan:</label>
          <textarea
            className="form-control"
            id="proposedRepaymentPlan"
            rows="3"
            value={proposedRepaymentPlan}
            onChange={(e) => setProposedRepaymentPlan(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            Submit Loan & Advance Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoanAdvanceRequest;