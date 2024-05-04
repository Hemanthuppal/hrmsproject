import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../App";
import { doc, getDoc } from "firebase/firestore";

function Payslip() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (loggedInEmployeeId) {
        const employeeDocRef = doc(
          db,
          `payslip_${loggedInEmployeeId}`,
          loggedInEmployeeId
        );
        try {
          const docSnap = await getDoc(employeeDocRef);
          if (docSnap.exists()) {
            console.log(docSnap.data()); // Log the entire data object
            setEmployeeData(docSnap.data());
          } else {
            console.log("No payslip found for this employee.");
          }
        } catch (error) {
          console.error("Error fetching payslip:", error);
        }
      } else {
        console.log("Employee ID not found.");
      }
    };

    fetchEmployeeData();
  }, [loggedInEmployeeId]);

  return (
    <div className="container">
      <h2>Payslip Data</h2>
      {employeeData && (
        <>
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
              {employeeData.payslips && employeeData.payslips.length > 0 ? (
                employeeData.payslips.map((payslip, index) => (
                  <tr key={payslip.id || index}>
                    <td>{employeeData.employeeId}</td>
                    <td>{employeeData.fullName}</td>
                    <td>{employeeData.role}</td>
                    <td>{employeeData.date}</td>
                    <td>{payslip.grossSalary}</td>
                    <td>{payslip.netSalary}</td>
                    <td>{payslip.totalDeductions}</td>
                    <td>
                      {employeeData.pdfUrl && (
                        <a
                          href={employeeData.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No payslip data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default Payslip;
