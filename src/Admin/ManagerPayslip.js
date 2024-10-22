import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  where,
  doc,
  setDoc,orderBy,limit
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function ManagerPayslip() {
  const [uid, setUid] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [payslipData, setPayslipData] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Select");
  const [managerUid, setManagerUid] = useState("");
  const location = useLocation();
  const [users, setUsers] = useState([]);

  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(
          collection(db, "users"),
          where("role", "==", "Manager")
        );
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [db]);

  const handleEmployeeChange = async (selectedEmployeeId) => {
    const q = query(
      collection(db, "users"),
      where("employeeId", "==", selectedEmployeeId)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const selectedEmployee = querySnapshot.docs[0].data();
      setUid(querySnapshot.docs[0].id);
      setRole(selectedEmployee.role);
      setFullName(selectedEmployee.fullName);
    } else {
      console.error("No data found for the selected employee.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!uid) {
        console.error("No employee selected");
        return;
    }

    const payslip = {
        date,
        employeeId,
        fullName,
        role,
        basicSalary: payslipData[0]?.basicSalary || "N/A",
        professionalTax: payslipData[0]?.professionalTax || "N/A",
        dearnessAllowances: payslipData[0]?.dearnessAllowances || "N/A",
        houseRentAllowance: payslipData[0]?.houseRentAllowance || "N/A",
        conveyanceAllowances: payslipData[0]?.conveyanceAllowances || "N/A",
        medicalAllowances: payslipData[0]?.medicalAllowances || "N/A",
        leavetravelAllowances: payslipData[0]?.leavetravelAllowances || "N/A",
        performanceBonus: payslipData[0]?.performanceBonus || "N/A",
        grossSalary: payslipData[0]?.grossSalary || "N/A",
        totalDeductions: payslipData[0]?.totalDeductions || "N/A",
        netSalary: payslipData[0]?.netSalary || "N/A",
        tds: payslipData[0]?.tds || "N/A",
        epf: payslipData[0]?.epf || "N/A",
        otherDeductions: payslipData[0]?.otherDeductions || "N/A",
    };

    try {
        const downloadURL = await generatePDF(payslip);
        console.log("PDF generated, URL:", downloadURL);
        const payslipPath = `payslip_${uid}/${uid}`;
        const payslipRef = doc(db, payslipPath);

        await setDoc(payslipRef, { ...payslip, pdfUrl: downloadURL });
        console.log("Payslip submitted successfully for employee:", uid);
        alert("Payslip submitted successfully!");
    } catch (error) {
        console.error("Error in the process:", error);
    }
};


  useEffect(() => {
    const fetchPayslipData = async () => {
      try {
        const payslipsCollectionRef = collection(db, `payslips${selectedLevel}`);
        const querySnapshot = await query(
          payslipsCollectionRef,
          orderBy('timestamp', 'desc'), // replace 'timestampField' with your actual timestamp field name
          // limit(0)
        );
  
        if (!querySnapshot.empty) {
          const payslips = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPayslipData(payslips);
        } else {
          console.log("No documents found!");
        }
      } catch (error) {
        console.error("Error fetching payslip data:", error);
      }
    };
  
    fetchPayslipData();
  }, [db, selectedLevel]);
  

  const generatePDF = async (payslip) => {
    const currentMonthYear = new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
    });
    let tableBody = [["Earnings", "Amount", "Deductions", "Amount"]];

    // Map the payslip data to the table body
    tableBody.push(["Basic Salary", payslip.basicSalary || "N/A", "Professional Tax", payslip.professionalTax || "N/A"]);
    tableBody.push(["Dearness Allowances", payslip.dearnessAllowances || "N/A", "Tax Deducted at Source (TDS)", payslip.tds || "N/A"]);
    tableBody.push(["House Rent Allowance (HRA)", payslip.houseRentAllowance || "N/A", "Employee Provident Fund (EPF)", payslip.epf || "N/A"]);
    tableBody.push(["Conveyance Allowance", payslip.conveyanceAllowances || "N/A", "Other Deductions", payslip.otherDeductions || "N/A"]);
    tableBody.push(["Medical Allowance", payslip.medicalAllowances || "N/A", "", ""]);
    tableBody.push(["Leave Travel Allowance (LTA)", payslip.leavetravelAllowances || "N/A", "", ""]);
    tableBody.push(["Performance Bonus", payslip.performanceBonus || "N/A", "", ""]);
    tableBody.push(["Gross Salary", payslip.grossSalary || "N/A", "Total Deductions", payslip.totalDeductions || "N/A"]);
    tableBody.push(["Net Salary", payslip.netSalary || "N/A", "", ""]);

    const docDefinition = {
        content: [
            { text: `Payslip - ${currentMonthYear}`, style: "header" },
            {
                columns: [
                    { text: `Employee ID: ${payslip.employeeId}`, style: "subheader" },
                    { text: `Full Name: ${payslip.fullName}`, style: "subheader" },
                ],
                columnGap: 10,
            },
            {
                columns: [
                    { text: `Date: ${payslip.date}`, style: "subheader" },
                    { text: `Role: ${payslip.role}`, style: "subheader" },
                ],
                columnGap: 10,
            },
            {
                style: "tableExample",
                table: {
                    body: tableBody,
                },
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
                alignment: "center",
            },
            subheader: {
                fontSize: 14,
                margin: [0, 10, 0, 5],
            },
            tableExample: {
                margin: [0, 5, 0, 15],
            },
        },
    };

    const pdf = pdfMake.createPdf(docDefinition);
    return new Promise((resolve, reject) => {
        pdf.getBlob(async (blob) => {
            try {
                const downloadURL = await storePDF(blob, `${payslip.employeeId}-${payslip.date}.pdf`);
                resolve(downloadURL);
            } catch (error) {
                reject(error);
            }
        });
    });
};

const storePDF = async (blob, fileName) => {
  const storage = getStorage();
  const storageRef = ref(storage, `payslips/${fileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("PDF uploaded to Firebase Storage, URL:", downloadURL);

    // Save this URL to Firestore
    await savePDFUrlToFirestore(downloadURL);
    return downloadURL; // Return the download URL
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};

const savePDFUrlToFirestore = async (pdfUrl) => {
  const employeeUid = await getEmployeeUid(employeeId);

  // Check for employeeUid validity
  if (!employeeUid) {
    console.error("Employee UID not found");
    return;
  }

  const payslipDoc = {
    date,
    employeeId,
    fullName,
    role,
    payslips: payslipData,
    pdfUrl,
  };

  // Store in payslips-employeeUid collection
  await setDoc(doc(db, `payslips_${employeeUid}`, employeeUid), payslipDoc);
  console.log("Payslip data and PDF URL stored successfully in Firestore");
};

const getEmployeeUid = async (employeeId) => {
  const q = query(collection(db, "users"), where("employeeId", "==", employeeId));
  const querySnapshot = await getDocs(q);
  let uid = null;
  querySnapshot.forEach((doc) => {
    uid = doc.id;
  });
  return uid;
};

  useEffect(() => {
    const fetchPayslipData = async () => {
      try {
        const payslipsCollectionRef = collection(
          db,
          `payslips${selectedLevel}`
        );
        const querySnapshot = await getDocs(payslipsCollectionRef);

        if (!querySnapshot.empty) {
          const payslips = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPayslipData(payslips); // Store the array of payslips
        } else {
          console.log("No documents found!");
        }
      } catch (error) {
        console.error("Error fetching payslip data:", error);
      }
    };

    fetchPayslipData();
  }, [selectedLevel]);

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-6">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              className="form-control"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label htmlFor="employeeId">Employee ID:</label>
            <select
              className="form-control"
              id="employeeId"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                handleEmployeeChange(e.target.value);
              }}
            >
              <option value="">Select Employee</option>
              {users.map((user) => (
                <option key={user.id} value={user.employeeId}>
                  {user.employeeId}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              className="form-control"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
        <div className="text-center mt-2">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
      <div className="mt-3">
        {/* Dropdown to select payslip level */}
        <div className="mb-3">
          <label htmlFor="levelSelect" className="form-label">
            Select Level
          </label>
          <select
            className="form-select"
            id="levelSelect"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="Select" disabled>Select</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
          </select>
        </div>
        {payslipData.length > 0 ? (
          payslipData.map((payslip, index) => (
            <table className="styled-table" key={index}>
              <thead>
                <tr>
                  <th>Earnings</th>
                  <th>Amount</th>
                  <th>Deductions</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Salary:</td>
                  <td>{payslip.basicSalary}</td>
                  <td>Professional Tax:</td>
                  <td>{payslip.professionalTax}</td>
                </tr>
                <tr>
                  <td>Dearness Allowances:</td>
                  <td>{payslip.dearnessAllowances}</td>
                  <td>Tax Deducted at Source (TDS):</td>
                  <td>{payslip.tds}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA):</td>
                  <td>{payslip.houseRentAllowance}</td>
                  <td>Employee Provident Fund (EPF):</td>
                  <td>{payslip.epf}</td>
                </tr>
                <tr>
                  <td>Conveyance Allowance:</td>
                  <td>{payslip.conveyanceAllowances}</td>
                  <td>Other Deductions:</td>
                  <td>{payslip.otherDeductions}</td>
                </tr>
                <tr>
                  <td>Medical Allowance:</td>
                  <td>{payslip.medicalAllowances}</td>
                  {/* Empty cells for alignment */}
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Leave Travel Allowance (LTA):</td>
                  <td>{payslip.leavetravelAllowances}</td>
                  {/* Empty cells for alignment */}
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Performance Bonus:</td>
                  <td>{payslip.performanceBonus}</td>
                  {/* Empty cells for alignment */}
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>Gross Salary:</td>
                  <td>{payslip.grossSalary}</td>
                  <td>Total Deductions:</td>
                  <td>{payslip.totalDeductions}</td>
                </tr>
                <tr>
                  <td>Net Salary:</td>
                  <td>{payslip.netSalary}</td>
                  {/* Empty cells for alignment */}
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          ))
        ) : (
          <p>No payslip data available.</p>
        )}
      </div>
    </div>
  );
}

export default ManagerPayslip;
