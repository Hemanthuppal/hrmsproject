import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../App";

function Payslip() {
  const [payslipData, setPayslipData] = useState([]);

  useEffect(() => {
    const fetchPayslipDataForManagers = async () => {
      try {
        // Fetch users who are managers
        const usersRef = collection(db, "users");
        const managersQuery = query(usersRef, where("role", "==", "Manager"));
        const managersSnapshot = await getDocs(managersQuery);
        const managerIds = managersSnapshot.docs.map((doc) => doc.id);

        // Fetch payslip data for each manager and aggregate
        let aggregatedPayslipData = [];
        for (const managerId of managerIds) {
          const payslipCollectionRef = collection(db, `payslip_${managerId}`);
          const payslipDocs = await getDocs(payslipCollectionRef);
          const payslipData = payslipDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          aggregatedPayslipData = [
            ...aggregatedPayslipData,
            ...payslipData.map((p) => ({
              ...p,
              ...p.payslips[0], // Accessing the first payslip in the array
            })),
          ];
        }

        setPayslipData(aggregatedPayslipData);
        console.log("Aggregated Payslip Data:", aggregatedPayslipData);
      } catch (error) {
        console.error("Error fetching payslip data for managers:", error);
      }
    };

    fetchPayslipDataForManagers();
  }, []);

  return (
    <div className="container">
      <h2>Payslip Data</h2>
      {payslipData.length > 0 ? (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Date</th>
              <th>Gross Salary</th>
              <th>Net Salary</th>
              <th>Total Deductions</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {payslipData.map((payslip, index) => (
              <tr key={payslip.id || index}>
                <td>{payslip.employeeId}</td>
                <td>{payslip.fullName}</td>
                <td>{payslip.role}</td>
                <td>{payslip.date}</td>
                <td>{payslip.grossSalary}</td>
                <td>{payslip.netSalary}</td>
                <td>{payslip.totalDeductions}</td>
                <td>
                  {payslip.pdfUrl && (
                    <a
                      href={payslip.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Link
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>No payslip data available</div>
      )}
    </div>
  );
}

export default Payslip;
