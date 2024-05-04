import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  where,
  query,
  getDocs,
  collection,
  setDoc
} from "firebase/firestore";

function Payout() {
  const [employeeId, setEmployeeId] = useState("");
  const [payrollData, setPayrollData] = useState({
    fullName: "",
    grossSalary: "",
    totalDeductions: "",
    netSalary: "",
  });

  // New state variables for manual input
  const [paymentMethod, setPaymentMethod] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [remarks, setRemarks] = useState("");

  const [employees, setEmployees] = useState([]);
  const location = useLocation();
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmployeeChange = async (selectedEmployeeId) => {
    setEmployeeId(selectedEmployeeId);
    const db = getFirestore();
    const userRef = doc(db, "users", selectedEmployeeId);

    const userDocSnap = await getDoc(userRef);
    if (userDocSnap.exists()) {
      const selectedEmployee = userDocSnap.data();
      setEmployeeId(selectedEmployee.employeeId);

      const payslipData = await fetchPayslipData(selectedEmployeeId, selectedEmployee);
      setPayrollData(payslipData);

      // Update manual input fields
      setPaymentMethod(""); // Add default value or fetch from somewhere
      setOvertimePay(""); // Add default value or fetch from somewhere
      setBonuses(""); // Add default value or fetch from somewhere
      setRemarks(""); // Add default value or fetch from somewhere
    }
  };

  // ... (existing fetchPayslipData function)

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleOvertimePayChange = (e) => {
    setOvertimePay(e.target.value);
  };

  const handleBonusesChange = (e) => {
    setBonuses(e.target.value);
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
  };

  const handleSubmit = async () => {
    if (!employeeId) {
      alert('Please select an employee');
      return;
    }
    setIsSubmitting(true); 
    const db = getFirestore();
    
    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
    const currentYear = currentDate.getFullYear();
    
    // Construct the document reference with the current month and year
    const documentPath = `payout/${employeeId}_${currentMonth}_${currentYear}`;
    const payoutDocRef = doc(db, documentPath);
  
    const payoutData = {
      employeeId: employeeId,
      fullName: payrollData.fullName,
      grossSalary: payrollData.grossSalary,
      totalDeductions: payrollData.totalDeductions,
      netSalary: payrollData.netSalary,
      paymentMethod,
      overtimePay,
      bonuses,
      remarks,
    };
  
    try {
      await setDoc(payoutDocRef, payoutData);
      alert('Data submitted successfully');
      setEmployeeId("");
      setPayrollData({
        fullName: "",
        grossSalary: "",
        totalDeductions: "",
        netSalary: "",
      });
      setPaymentMethod("");
      setOvertimePay("");
      setBonuses("");
      setRemarks("");
    } catch (error) {
      console.error('Error submitting data: ', error);
      alert('Failed to submit data');
    }finally {
      setIsSubmitting(false); // Set loading state to false after the submission process, whether successful or not
    }
  };
  
  
  const fetchPayslipData = async (selectedEmployeeId, selectedEmployee) => {
    const db = getFirestore();
    const payslipDocRef = doc(db, `payslips_${selectedEmployeeId}`, selectedEmployeeId);
  
    const payslipDocSnap = await getDoc(payslipDocRef);
  
    if (payslipDocSnap.exists()) {
      const payslipData = payslipDocSnap.data();
      if (payslipData.payslips && payslipData.payslips.length > 0) {
        const latestPayslip = payslipData.payslips[0];
  
        // Update property name to employeeName
        return {
          fullName: selectedEmployee.fullName || "", // Fetch full name from users collection
          grossSalary: latestPayslip.grossSalary || "",
          totalDeductions: latestPayslip.tds || "",
          netSalary: latestPayslip.netSalary || "",
        };
      } else {
        console.log("Payslip data not found for the selected employee.");
      }
    } else {
      console.log("Payslip document not found for the selected employee.");
    }
  
    return {
      fullName: "",
      grossSalary: "",
      totalDeductions: "",
      netSalary: "",
    };
  };


  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, "users"), where("assignedManagerUid", "==", loggedInEmployeeId));

    const fetchData = async () => {
      const querySnapshot = await getDocs(q);

      const fetchedEmployees = [];
      querySnapshot.forEach((doc) => {
        fetchedEmployees.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(fetchedEmployees);
    };

    fetchData();
  }, [loggedInEmployeeId]);

  return (
    <div className="container">
      <div className="row">
      <div className="col-md-4"></div>
      <div className="col-md-5">
      <div className="card">
              <div className="card-body">
      <div className="form-group">
        <label htmlFor="employeeId">Employee ID:</label>
        <select
          className="form-control"
          id="employeeId"
          value={employeeId}
          onChange={(e) => handleEmployeeChange(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.employeeId}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Full Name:</label>
        <input type="text" className="form-control" value={payrollData.fullName} readOnly />
      </div>

      <div className="form-group">
        <label>Gross Salary:</label>
        <input type="text" className="form-control" value={payrollData.grossSalary} readOnly />
      </div>

      <div className="form-group">
        <label>Total Deductions:</label>
        <input type="text" className="form-control" value={payrollData.totalDeductions} readOnly />
      </div>

      <div className="form-group">
        <label>Net Salary:</label>
        <input type="text" className="form-control" value={payrollData.netSalary} readOnly />
      </div>
      <div className="form-group">
        <label>Payment Method:</label>
        <input
          type="text"
          className="form-control"
          value={paymentMethod}
          onChange={handlePaymentMethodChange}
        />
      </div>

      <div className="form-group">
        <label>Overtime Pay:</label>
        <input
          type="text"
          className="form-control"
          value={overtimePay}
          onChange={handleOvertimePayChange}
        />
      </div>

      <div className="form-group">
        <label>Bonuses:</label>
        <input
          type="text"
          className="form-control"
          value={bonuses}
          onChange={handleBonusesChange}
        />
      </div>

      <div className="form-group">
        <label>Remarks:</label>
        <input
          type="text"
          className="form-control"
          value={remarks}
          onChange={handleRemarksChange}
        />
      </div>
      <div className="form-group">
      <center > <button
                    className="btn btn-primary mt-3"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button></center>
      </div>
      </div>
    </div>
    </div>
    </div>
    </div>
  );
}

export default Payout;
