import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from './App'; // Assuming db is exported from your main app file

const FullFinalSettlementForm = () => {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    resignationDate: '',
    lastWorkingDay: '',
    reason: '', // New field
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!loggedInEmployeeId) return;

      const employeeDocRef = doc(db, 'users', loggedInEmployeeId);

      try {
        const employeeDocSnap = await getDoc(employeeDocRef);
        if (employeeDocSnap.exists()) {
          const employeeData = employeeDocSnap.data();
          setFormData({
            employeeId: employeeData.employeeId,
            employeeName: employeeData.fullName,
            resignationDate: '',
            lastWorkingDay: '',
            reason: '', // Initialize new field
          });
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [loggedInEmployeeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // If the event object is present, prevent default form submission behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!loggedInEmployeeId) {
      console.error('Logged-in employee ID not available.');
      return;
    }

    // Add validation if necessary, for example:
    if (!formData.resignationDate || !formData.lastWorkingDay || !formData.reason) {
      alert('Please fill in all the fields.');
      return;
    }

    try {
      const employeeDocRef = doc(db, 'users', loggedInEmployeeId);
      const employeeDocSnap = await getDoc(employeeDocRef);

      if (!employeeDocSnap.exists()) {
        console.error('Logged-in employee not found.');
        return;
      }

      const loggedInEmployee = employeeDocSnap.data();

      // Ensure manager UID is available
      const managerUid = loggedInEmployee?.assignedManagerUid; // Adjust to your actual field name

      if (!managerUid) {
        console.error('Manager UID not available for the logged-in employee.');
        // Consider adding a return statement here if you do not wish to proceed further
      }

      // Only proceed if managerUid is available
      if (managerUid) {
        // Save data in the logged-in employee's collection
        const employeeSettlementRef = doc(collection(db, `settlements_${loggedInEmployeeId}`));
        await setDoc(employeeSettlementRef, { ...formData, employeeUid: loggedInEmployeeId });

        // Save data in the manager's collection
        const managerSettlementRef = doc(db, `settlements_${managerUid}`, employeeSettlementRef.id);
        await setDoc(managerSettlementRef, { ...formData, employeeUid: loggedInEmployeeId });

        alert('Full & Final Settlement Form submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleManualSubmit = () => {
    handleSubmit();
  };

  return (
    <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-12">
        {/* Form UI similar to ApplyLeave */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Employee ID:</label>
            <input
              type="text"
              className="form-control"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">Employee Name:</label>
            <input
              type="text"
              className="form-control"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">Date of Resignation/Termination:</label>
            <input
              type="date"
              className="form-control"
              name="resignationDate"
              value={formData.resignationDate}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">Last Working Day:</label>
            <input
              type="date"
              className="form-control"
              name="lastWorkingDay"
              value={formData.lastWorkingDay}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">Reason:</label>
            <input
              type="text"
              className="form-control"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>
  
          <div className="text-center">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  );
};

export default FullFinalSettlementForm;
