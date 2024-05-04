import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Import Firestore instead of Firebase Realtime Database
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app } from '../App'; // Import your firebase app configuration
const PayslipForm = () => {
  const [selectedLevel, setSelectedLevel] = useState("1");

    const [selectedDate, setSelectedDate] = useState(null);
    const [employeeID, setEmployeeID] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [employeeMail, setEmployeeMail] = useState("");
    const [employeeDesignation, setemployeeDesignation] = useState("");
    const [pan, setpan] = useState("");
    const [bankAc, setbankAc] = useState("");
    const [bankName, setbankName] = useState("");
  
    const [basicSalary, setBasicSalary] = useState("");
    const [houseRentAllowance, setHouseRentAllowance] = useState("");
    const [dearnessAllowances, setdearnessAllowances] = useState("");
    const [conveyanceAllowances, setconveyanceAllowances] = useState("");
    const [medicalAllowances, setMedicalAllowances] = useState("");
    const [leavetravelAllowances, setLeavetravelAllowances] = useState("");
    const [performanceBonus, setPerformanceBonus] = useState("");
    const [grossSalary, setGrossSalary] = useState("");
    const [netSalary, setNetSalary] = useState("");
    const [tds, settds] = useState("");
    const [professionalTax, setprofessionalTax] = useState("");
    const [epf, setepf] = useState("");
    const [otherDeductions, setotherDeductions] = useState("");
    const [totalDeductions, setTotalDeductions] = useState("");
  
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    useEffect(() => {
        // Fetch data from Firestore
        const fetchData = async () => {
          const db = getFirestore(app);
          const querySnapshot = await getDocs(collection(db, "payslips"));
          querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
          });
        };
    
        fetchData().catch(console.error);
        const grossSum =
        parseFloat(basicSalary) +
        parseFloat(houseRentAllowance) +
        parseFloat(dearnessAllowances) +
        parseFloat(conveyanceAllowances) +
        parseFloat(medicalAllowances) +
        parseFloat(leavetravelAllowances) +
        parseFloat(performanceBonus);
  
      setGrossSalary(isNaN(grossSum) ? "" : grossSum.toString());
  
      // Calculate the sum of all deduction values for Total Deductions
      const deductionSum =
        parseFloat(professionalTax) +
        parseFloat(tds) +
        parseFloat(epf) +
        parseFloat(otherDeductions);
  
      setTotalDeductions(isNaN(deductionSum) ? "" : deductionSum.toString());
  
      // Calculate the net salary as the difference between grossSalary and totalDeductions
      const netSum = grossSum - deductionSum;
      setNetSalary(isNaN(netSum) ? "" : netSum.toString());
    }, [
      basicSalary,
      houseRentAllowance,
      dearnessAllowances,
      conveyanceAllowances,
      medicalAllowances,
      leavetravelAllowances,
      performanceBonus,
      professionalTax,
      tds,
      epf,
      otherDeductions,
    ]);
  
    // Function to get the current timestamp in the specified format
    const getCurrentTimestamp = () => {
      const now = new Date();
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
        timeZone: "Asia/Kolkata", // Set the timezone to Indian Standard Time
      };
  
      return now.toLocaleString("en-US", options);
    };
  
    // Function to format the selected date as "MMMM yyyy"
    const formatSelectedDate = (date) => {
      if (!date) return "";
      const options = {
        year: "numeric",
        month: "long",
      };
      return date.toLocaleString("en-US", options);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
         // Function to format the value with commas as thousands separators and ".00" at the end
    const formatAmount = (value) => {
        if (!isNaN(value)) {
          const formattedValue = parseFloat(value).toFixed(2); // Add ".00" at the end
          return formattedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        return value; // Return the original value if it's not a valid number
      };
  
      // Get the timestamp in the desired format
      const timestamp = getCurrentTimestamp();
  
      // Format the selected date as "MMMM yyyy"
      const formattedDate = formatSelectedDate(selectedDate);
  
      const payslipData = {
        // selectedDate: formattedDate,
        // employeeID,
        // employeeName,
        // employeeMail,
        // employeeDesignation,
        // pan,
        // bankAc,
        // bankName,
        basicSalary: formatAmount(basicSalary),
        houseRentAllowance: formatAmount(houseRentAllowance),
        dearnessAllowances: formatAmount(dearnessAllowances),
        conveyanceAllowances: formatAmount(conveyanceAllowances),
        medicalAllowances: formatAmount(medicalAllowances),
        leavetravelAllowances: formatAmount(leavetravelAllowances),
        performanceBonus: formatAmount(performanceBonus),
        professionalTax: formatAmount(professionalTax),
        grossSalary: formatAmount(grossSalary),
        netSalary: formatAmount(netSalary),
        tds: formatAmount(tds),
        epf: formatAmount(epf),
        otherDeductions: formatAmount(otherDeductions),
        totalDeductions: formatAmount(totalDeductions),
        timestamp: getCurrentTimestamp(), // Store the timestamp in the desired format
      };
      const payslipCollection = `payslips${selectedLevel}`; // Determine the collection name based on selected level

        try {
            const db = getFirestore(app);
            const docRef = await addDoc(collection(db, payslipCollection), payslipData); // Use the dynamic collection name
            console.log("Document written with ID: ", docRef.id);  
        setEmployeeID("");
        setEmployeeName("");
        setEmployeeMail("");
        setemployeeDesignation("");
        setpan("");
        setbankAc("");
        setbankName("");
        setBasicSalary("");
        setHouseRentAllowance("");
        setdearnessAllowances("");
        setconveyanceAllowances("");
        setLeavetravelAllowances("");
        setMedicalAllowances("");
        setPerformanceBonus("");
        setprofessionalTax("");
        setGrossSalary("");
        setNetSalary("");
        settds("");
        setepf("");
        setotherDeductions("");
        setTotalDeductions("");
        setSelectedDate(null);
        setShowSuccessModal(true);
      } catch (error) {
          console.error("Error adding document: ", error);
      }
  };
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="container">
      <h2 className="mt-4 mb-2">Payslip Form</h2>

      <form onSubmit={handleSubmit}>
           {/* Dropdown for selecting level */}
           <div className="mb-3">
                    <label htmlFor="levelSelect" className="form-label">Select Level</label>
                    <select
                        className="form-select"
                        id="levelSelect"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                    </select>
                </div>
      
        <div className="row">
          <div className="col-md-6">
            <h4>Income/Earnings</h4>
            <div className="mb-2">
              <label htmlFor="basicSalary" className="form-label">
                BASIC:
              </label>
              <input
                type="text"
                className="form-control"
                id="basicSalary"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="houseRentAllowance" className="form-label">
                House Rent Allowance:
              </label>
              <input
                type="text"
                className="form-control"
                id="houseRentAllowance"
                value={houseRentAllowance}
                onChange={(e) => setHouseRentAllowance(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="dearnessAllowances" className="form-label">
                Dearness Allowances:
              </label>
              <input
                type="text"
                className="form-control"
                id="dearnessAllowances"
                value={dearnessAllowances}
                onChange={(e) => setdearnessAllowances(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="conveyanceAllowances" className="form-label">
                Conveyance Allowances:
              </label>
              <input
                type="text"
                className="form-control"
                id="conveyanceAllowances"
                value={conveyanceAllowances}
                onChange={(e) => setconveyanceAllowances(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="medicalAllowances" className="form-label">
                Medical Allowances:
              </label>
              <input
                type="text"
                className="form-control"
                id="medicalAllowances"
                value={medicalAllowances}
                onChange={(e) => setMedicalAllowances(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="leavetravelAllowances" className="form-label">
                Leave Travel Allowances:
              </label>
              <input
                type="text"
                className="form-control"
                id="leavetravelAllowances"
                value={leavetravelAllowances}
                onChange={(e) => setLeavetravelAllowances(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="performanceBonus" className="form-label">
                Performance Bonus:
              </label>
              <input
                type="text"
                className="form-control"
                id="performanceBonus"
                value={performanceBonus}
                onChange={(e) => setPerformanceBonus(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="grossSalary" className="form-label">
                Gross Salary:
              </label>
              <input
                type="text"
                className="form-control"
                id="grossSalary"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="netSalary" className="form-label">
                Net Salary:
              </label>
              <input
                type="text"
                className="form-control"
                id="netSalary"
                value={netSalary}
                onChange={(e) => setNetSalary(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <h4>Deductions</h4>
            <div className="mb-2">
              <label htmlFor="professionalTax" className="form-label">
                Professional Tax:
              </label>
              <input
                type="text"
                className="form-control"
                id="professionalTax"
                value={professionalTax}
                onChange={(e) => setprofessionalTax(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="tds" className="form-label">
                Tax Deducted at Source(TDS) :
              </label>
              <input
                type="text"
                className="form-control"
                id="tds"
                value={tds}
                onChange={(e) => settds(e.target.value)}
                required
              />
            </div>

            <div className="mb-2">
              <label htmlFor="epf" className="form-label">
                Employee Provident Fund(PF):
              </label>
              <input
                type="text"
                className="form-control"
                id="epf"
                value={epf}
                onChange={(e) => setepf(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="otherDeductions" className="form-label">
                Other Deductions :
              </label>
              <input
                type="text"
                className="form-control"
                id="otherDeductions"
                value={otherDeductions}
                onChange={(e) => setotherDeductions(e.target.value)}
                required
              />
            </div>
            <div className="mb-2">
              <label htmlFor="totalDeductions" className="form-label">
                Total Deductions :
              </label>
              <input
                type="text"
                className="form-control"
                id="totalDeductions"
                value={totalDeductions}
                onChange={(e) => setTotalDeductions(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>

      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>Data submitted successfully!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuccessModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PayslipForm;
