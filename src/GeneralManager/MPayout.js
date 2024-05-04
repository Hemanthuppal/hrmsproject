import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc ,setDoc } from "firebase/firestore";

const PayoutDisbursements = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollData, setPayrollData] = useState({});
  const [loading, setLoading] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [bonuses, setBonuses] = useState("");
  const [remarks, setRemarks] = useState("");

  
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

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const db = getFirestore();
        const usersRef = collection(db, "users");
        const managersQuery = query(usersRef, where("role", "==", "Manager"));
        const querySnapshot = await getDocs(managersQuery);

        const fetchedEmployees = querySnapshot.docs.map(doc => ({
          docId: doc.id,
          employeeId: doc.data().employeeId,
          fullName: doc.data().fullName
        }));
        setEmployees(fetchedEmployees);
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
      setLoading(false);
    };

    fetchManagers();
  }, []);

  const fetchPayslipData = async (employeeDocId) => {
    try {
      const db = getFirestore();
      const payslipDocRef = doc(db, `payslip_${employeeDocId}`, employeeDocId);
      const payslipDocSnap = await getDoc(payslipDocRef);
  
      if (payslipDocSnap.exists()) {
        const payslipData = payslipDocSnap.data();
        if (payslipData.payslips && payslipData.payslips.length > 0) {
          const latestPayslip = payslipData.payslips[0];
  
          // Fetch only the required fields
          setPayrollData({
            grossSalary: latestPayslip.grossSalary || "",
            totalDeductions: latestPayslip.tds || "",
            netSalary: latestPayslip.netSalary || "",
          });
        } else {
          console.log("Payslip data not found for the selected employee.");
        }
      } else {
        console.log("Payslip document not found for the selected employee.");
      }
    } catch (error) {
      console.error("Error fetching payslip data:", error);
    }
  };
  

  const handleSelectChange = (event) => {
    const selectedDocId = event.target.value;
    const selectedEmp = employees.find(employee => employee.docId === selectedDocId);
    setSelectedEmployee(selectedEmp);

    if (selectedEmp) {
      fetchPayslipData(selectedDocId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedEmployee.employeeId) {
      alert('Please select an employee');
      return;
    }
    const db = getFirestore();
    
    // Get the current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
    const currentYear = currentDate.getFullYear();
    
    // Construct the document reference with the current month and year
    const documentPath = `payout/${selectedEmployee.employeeId}_${currentMonth}_${currentYear}`;
    const payoutDocRef = doc(db, documentPath);
  
    const payoutData = {
      employeeId: selectedEmployee.employeeId,
      fullName: selectedEmployee.fullName,  // Use selectedEmployee.fullName here
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
    } catch (error) {
      console.error('Error submitting data: ', error);
      alert('Failed to submit data');
    }
  };
  

  if (loading) {
    return <div>Loading manager data...</div>;
  }
  return (
    <div>
      <h2>Select Manager</h2>
      <select value={selectedEmployee ? selectedEmployee.docId : ''} onChange={handleSelectChange}>
        <option value="">Select an Employee</option>
        {employees.map(employee => (
          <option key={employee.docId} value={employee.docId}>{employee.employeeId}</option>
        ))}
      </select>

      {/* Additional code to display payroll data */}
      <div className="form-group">
        <label>Full Name:</label>
        <input type="text" className="form-control" value={selectedEmployee ? selectedEmployee.fullName : ''} readOnly />
      </div>
      {/* Display other payroll data as needed */}
      <div className="form-group">
        <label>Gross Salary:</label>
        <input type="text" className="form-control" value={payrollData.grossSalary || ""} readOnly />
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
        <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default PayoutDisbursements;
