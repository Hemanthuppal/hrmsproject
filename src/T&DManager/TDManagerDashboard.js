import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import DailyAttendance from "../Manager/DailyAttendance"; // Ensure this component is created
import MonthlyAttendanceReport from "../Manager/MonthlyAttendanceReport";
import LeaveApplication from "../Manager/LeaveApplication";
import ManagerAttendance from "../Manager/ManagerAttendance";
import ManagerViewLeave from "../Manager/ManagerViewLeave";
import PerformanceReport from "../Manager/PerformanceReport";
import ExpensesApproval from "../Manager/ExpensesApproval";
import PayoutDisbursements from "../Manager/PayoutDisbursements";
import LoanApproval from "../Manager/LoanApproval";
import AdvanceSalaryApplication from "../Manager/AdvanceSalaryApplication";
import FinalSettlement from "../Manager/FinalSettlement";
import Payslip from "../Manager/Payslip";
import ManagerExpensesStatus from "../Manager/ManagerExpensesStatus";
import ManagerFinalSettlementStatus from "../Manager/ManagerFinalSettlementStatus";
import ManagerSalaryAdvanceStatus from "../Manager/ManagerSalaryAdvanceStatus";
import ManagerLoanStatus from "../Manager/ManagerLoanStatus";
import ManagerPayslip from "../Manager/ManagerPayslip";
import ManagerPayout from "../Manager/ManagerPayout";
import ManPowerTable from "../Manager/ManPowerTable";
import TDManagerTrainingList from './TDManagerTrainingList';
import TrainingEvaluation from './TrainingEvaluation';
import TrainingEvaluationReport from './TrainingEvaluationReport';
import ReviewReportFromEmployee from './ReviewReportFromEmployee';
import ManagerCommunication from '../Manager/ManagerCommunication';
import EmployeeProfile from '../EmployeeProfile';
import logo from "../Img/logohrms.png";
import ExitProcedure from "../Manager/ExitProcedure";
import OverallDashboard from "./OverallDashboard";
import EmployeesList from "../Manager/EmployeesList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt,faBars,faL} from "@fortawesome/free-solid-svg-icons";
import ManagerMonthlyAttendance from "../Manager/ManagerMonthlyAttendance";
import ManagerMonthlyReport from "../Manager/ManagerMonthlyReport";
import EmpMonthlyAttendanceReport from "../Manager/EmpMonthlyAttendanceReport";

function ManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("overalldashboard");
  const sidebarHeight = window.innerHeight - 70;

  const [showAttendance, setShowAttendance] =useState(false);
  const [showTrainingAndDevelopment, setShowTrainingAndDevelopment] =useState(false);
  const [showEmployeePayroll, setShowEmployeePayroll] =useState(false);
  const [showManagerPayroll, setShowManagerPayroll] =useState(false);
  const [showHROperation, setShowHROperation] =useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=",employeeData.fullName)
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  const toggleDropdown = (dropdownSetter, defaultPage) => {
    // Close the current dropdown if it's already open
    if (dropdownSetter === setShowAttendance && showAttendance) {
      setShowAttendance(false);
    } else if (dropdownSetter === setShowTrainingAndDevelopment && showTrainingAndDevelopment) {
      setShowTrainingAndDevelopment(false);
    }else if (dropdownSetter === setShowEmployeePayroll && showEmployeePayroll) {
      setShowEmployeePayroll(false);
    }else if (dropdownSetter === setShowManagerPayroll && showManagerPayroll) {
      setShowManagerPayroll(false);
    } else if (dropdownSetter === setShowHROperation && showHROperation) {
      setShowHROperation(false);
    } else {
      // Close all other dropdowns and non-dropdown elements
      resetAllDropdowns();
      // Toggle the current dropdown
      dropdownSetter((prevState) => !prevState);
      // Set the active page to the default page if provided
      if (defaultPage) {
        setActivePage(defaultPage);
      }
    }
  };

  const handleAttendanceAndLeave = () => {
    toggleDropdown(setShowAttendance,"managerattendance");
  };

  const handleTrainingandDevelopment = () => {
    toggleDropdown(setShowTrainingAndDevelopment,"managertraininglist");
  };

  const handleEmployeePayroll = () => {
    toggleDropdown(setShowEmployeePayroll,"payslip");
  };

  const handleManagerPayroll = () => {
    toggleDropdown(setShowManagerPayroll,"managerpayslip");
  };

  const handleHROperation = () => {
    toggleDropdown(setShowHROperation,"managercommunication");
  };


  const handleLogout = () => {
    navigate("/");
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    
    resetAllDropdowns();
    
    if ( page.includes("Attendance&Leave") || page === "managerattendance" || page === "managermonthlyattendance" || page === "managermonthlyreport"|| page === "dailyattendance" || page === "monthlyattendancereport" || page === "empmonthlyattendacereport" || page === "managerattendance" || page === "managerviewleave" || page === "leaveApplication") {
      setShowAttendance(true);
    } else if (page.includes("EmployeePayroll") || page === "payslip" || page === "expensesapproval" || page === "payoutdisbursements" || page === "loanapproval" || page === "finalsettlement" || page === "advancesalaryapplication") {
      setShowEmployeePayroll(true);
    } 
    else if (page.includes("ManagerPayroll") || page === "managerpayslip" || page === "expensesstatus" || page === "loanstatus" || page === "finalsettlementstatus" || page === "salaryadvancestatus" ) {
      setShowManagerPayroll(true);
    } 
    else if (page.includes("T&D") || page === "managertraininglist" || page === "trainingrequest" || page === "trainingevaluationreport" || page === "reviewreportfromemployee" ) {
      setShowTrainingAndDevelopment(true);
    } else if (page.includes("HROperation") || page.includes("managercommunication")|| page.includes("exitprocedure")) {
      setShowHROperation(true);
    }
   
  };

  const resetAllDropdowns = () => {  
    setShowAttendance(false);  
    setShowTrainingAndDevelopment(false);
    setShowManagerPayroll(false);
    setShowEmployeePayroll(false);
    setShowHROperation(false);
  };

  const menuItemStyle = (page) => ({
    padding: "10px", // Keep the padding for top, right, and bottom
    paddingLeft: isSidebarOpen ? "20px" : "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    width: '100%',
    fontWeight: (showTrainingAndDevelopment && page === "T&D") || 
    (showEmployeePayroll && page === "EmployeePayroll") ||
    (showManagerPayroll && page === "ManagerPayroll") ||
    (showHROperation && page === "HROperation") ||
    (showAttendance && page === "Attendance&Leave")  ? "bold" : activePage === page ? "bold" : "normal",
    backgroundColor: activePage === page ? "white" : ((showAttendance && page === "Attendance&Leave") || 
    (showEmployeePayroll && page === "EmployeePayroll") ||
    (showManagerPayroll && page === "ManagerPayroll") ||
    (showHROperation && page === "HROperation") ||
    (showTrainingAndDevelopment && page === "T&D") ? "lightgrey" : "transparent"),
    color:(showAttendance && page === "Attendance&Leave") || 
    (showEmployeePayroll && page === "EmployeePayroll") ||
    (showManagerPayroll && page === "ManagerPayroll") ||
    (showHROperation && page === "HROperation") ||
    (showTrainingAndDevelopment && page === "T&D") ? "#182566" : (activePage === page ? "#182566" : "white"),
    transition: "background-color 0.1s, color 0.1s",
    border: "none",
    borderRadius: '20px'
  });

  
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#182566",
          padding: "10px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{ background: "none", border: "none", fontSize: "20px",color:'white' }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "50px", width: "130px", marginLeft: "20px" }}
        />
        <div style={{ marginLeft: "auto" }}>
        <span onClick={handleLogout} className="logoutButton" style={{ color: "white",background:'#182566', }}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </span>
      </div>
      </div>
      <div style={{ display: "flex", paddingTop: "70px" }}>
      <div 
  style={{
    width: isSidebarOpen ? "250px" : "60px",
    backgroundColor: "#182566",
    color: 'white',
    paddingTop: '10px',
    height: `${sidebarHeight}px`, 
    overflowY: "auto", 
    position: "fixed",
    top: "70px",
    zIndex: 1001,
    transition: "width 0.3s",
    paddingRight: isSidebarOpen ? "15px" : "0px", 
    paddingLeft: isSidebarOpen ? "25px" : "0px", 
  }}
>
          {isSidebarOpen && <h3 className="text-center">{loggedInEmployeeName}</h3>}
          <li
            onClick={() => handlePageChange("overalldashboard")}
            style={menuItemStyle("overalldashboard")}
          >
            {isSidebarOpen && "Dashboard"}
          </li>
          <li
            onClick={() => handlePageChange("employeeprofile")}
            style={menuItemStyle("employeeprofile")}
          >
            {isSidebarOpen && "Profile"}
          </li>
          <li
            onClick={() => handlePageChange("employees")}
            style={menuItemStyle("employees")}
          >
            {isSidebarOpen && "Employees"}
          </li>
          <ul onClick={handleAttendanceAndLeave} 
          style={{
            ...menuItemStyle("Attendance&Leave"),
            flexDirection: showAttendance && isSidebarOpen ? "column" : "row",
            margin: 0, 
    
          }}
    >
      <span>
        {isSidebarOpen && "Leave&Attendance"}&nbsp;&nbsp;
        {showAttendance ? null : <span>&#9660;</span>}
        </span>
      {showAttendance && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px' }}>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managerattendance"); }}
          style={{ ...menuItemStyle("managerattendance"), color: activePage === "managerattendance" ? "#182566" : "black", backgroundColor: activePage === "managerattendance" ? "white" : "transparent" }}
        >
          My Attendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managermonthlyattendance"); }}
          style={{ ...menuItemStyle("managermonthlyattendance"), color: activePage === "managermonthlyattendance" ? "#182566" : "black", backgroundColor: activePage === "managermonthlyattendance" ? "white" : "transparent" }}
        >
          My Monthly Attendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managermonthlyreport"); }}
          style={{ ...menuItemStyle("managermonthlyreport"), color: activePage === "managermonthlyreport" ? "#182566" : "black", backgroundColor: activePage === "managermonthlyreport" ? "white" : "transparent" }}
        >
          My Monthly Report
        </li>

          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("dailyattendance"); }}
          style={{ ...menuItemStyle("dailyattendance"), color: activePage === "dailyattendance" ? "#182566" : "black", backgroundColor: activePage === "dailyattendance" ? "white" : "transparent" }}
        >
          Employee DailyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("monthlyattendancereport"); }}
          style={{ ...menuItemStyle("monthlyattendancereport"), color: activePage === "monthlyattendancereport" ? "#182566" : "black", backgroundColor: activePage === "monthlyattendancereport" ? "white" : "transparent" }}
        >
          Employee MonthlyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("empmonthlyattendacereport"); }}
          style={{ ...menuItemStyle("empmonthlyattendacereport"), color: activePage === "empmonthlyattendacereport" ? "#182566" : "black", backgroundColor: activePage === "empmonthlyattendacereport" ? "white" : "transparent" }}
        >
          Employee MonthlyAttendance Report
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managerviewleave"); }}
          style={{ ...menuItemStyle("managerviewleave"), color: activePage === "managerviewleave" ? "#182566" : "black", backgroundColor: activePage === "managerviewleave" ? "white" : "transparent" }}
        >
         My Leaves
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("leaveApplication"); }}
          style={{ ...menuItemStyle("leaveApplication"), color: activePage === "leaveApplication" ? "#182566" : "black", backgroundColor: activePage === "leaveApplication" ? "white" : "transparent" }}
        >
          Employee Leaves
        </li>
        </div>
    </div>
  )}
          </ul>
      
          <li
            onClick={() => handlePageChange("performancereport")}
            style={{
              ...menuItemStyle("performancereport"),
              
            }}
          >
            {isSidebarOpen && "Performance Report"}
          </li>
          <ul onClick={handleEmployeePayroll} 
          style={{
            ...menuItemStyle("EmployeePayroll"),
            flexDirection: showEmployeePayroll && isSidebarOpen ? "column" : "row",
            margin: 0, // Remove any margin
          }}
          >
            <span>
        {isSidebarOpen && 'EmployeePayroll'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showEmployeePayroll ? null : <span>&#9660;</span>}
        </span>
      {showEmployeePayroll && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px',marginLeft: "5px", }}>
          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("payslip"); }}
          style={{ ...menuItemStyle("payslip"), color: activePage === "payslip" ? "#182566" : "black", backgroundColor: activePage === "payslip" ? "white" : "transparent" }}
        >
          Payslip
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("expensesapproval"); }}
          style={{ ...menuItemStyle("expensesapproval"), color: activePage === "expensesapproval" ? "#182566" : "black", backgroundColor: activePage === "expensesapproval" ? "white" : "transparent" }}
        >
           Expenses
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("payoutdisbursements"); }}
          style={{ ...menuItemStyle("payoutdisbursements"), color: activePage === "payoutdisbursements" ? "#182566" : "black", backgroundColor: activePage === "payoutdisbursements" ? "white" : "transparent" }}
        >
          Payout
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("loanapproval"); }}
          style={{ ...menuItemStyle("loanapproval"), color: activePage === "loanapproval" ? "#182566" : "black", backgroundColor: activePage === "loanapproval" ? "white" : "transparent" }}
        >
          Loan
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("finalsettlement"); }}
          style={{ ...menuItemStyle("finalsettlement"), color: activePage === "finalsettlement" ? "#182566" : "black", backgroundColor: activePage === "finalsettlement" ? "white" : "transparent" }}
        >
         FinalSettlement
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("advancesalaryapplication"); }}
          style={{ ...menuItemStyle("advancesalaryapplication"), color: activePage === "advancesalaryapplication" ? "#182566" : "black", backgroundColor: activePage === "advancesalaryapplication" ? "white" : "transparent" }}
        >
         SalaryAdvance
        </li>
          </div>
    </div>
  )}
          </ul>

          <ul onClick={handleManagerPayroll} 
        style={{
          ...menuItemStyle("ManagerPayroll"),
          flexDirection: showManagerPayroll && isSidebarOpen ? "column" : "row",
          margin: 0, // Remove any margin
        }}
        >
        <span>
        {isSidebarOpen && 'ManagerPayroll'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showManagerPayroll ? null : <span>&#9660;</span>}
        </span>
      {showManagerPayroll && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px',marginLeft: "5px", }}>
          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managerpayslip"); }}
          style={{ ...menuItemStyle("managerpayslip"), color: activePage === "managerpayslip" ? "#182566" : "black", backgroundColor: activePage === "managerpayslip" ? "white" : "transparent" }}
        >
          Payslip
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("expensesstatus"); }}
          style={{ ...menuItemStyle("expensesstatus"), color: activePage === "expensesstatus" ? "#182566" : "black", backgroundColor: activePage === "expensesstatus" ? "white" : "transparent" }}
        >
           Expenses
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("loanstatus"); }}
          style={{ ...menuItemStyle("loanstatus"), color: activePage === "loanstatus" ? "#182566" : "black", backgroundColor: activePage === "loanstatus" ? "white" : "transparent" }}
        >
          Loan
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("finalsettlementstatus"); }}
          style={{ ...menuItemStyle("finalsettlementstatus"), color: activePage === "finalsettlementstatus" ? "#182566" : "black", backgroundColor: activePage === "finalsettlementstatus" ? "white" : "transparent" }}
        >
          FinalSettlement
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("salaryadvancestatus"); }}
          style={{ ...menuItemStyle("salaryadvancestatus"), color: activePage === "salaryadvancestatus" ? "#182566" : "black", backgroundColor: activePage === "salaryadvancestatus" ? "white" : "transparent" }}
        >
          SalaryAdvance
        </li>
          </div>
    </div>
  )}
          </ul>

          <li
            onClick={() => handlePageChange("manpowertable")}
            style={menuItemStyle("manpowertable")}
          >
            {isSidebarOpen && "ManPowerRequest"}
          </li>
          <ul onClick={handleTrainingandDevelopment} 
          style={{
            ...menuItemStyle("T&D"),
            flexDirection: showTrainingAndDevelopment && isSidebarOpen ? "column" : "row",
            margin: 0, // Remove any margin
          }}
          >
            <span>
        {isSidebarOpen && 'T&D'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showTrainingAndDevelopment ? null : <span>&#9660;</span>}
        </span>
      {showTrainingAndDevelopment && isSidebarOpen && (
       <div style={{ display: 'flex', flexDirection: 'column' }}>
       <div style={{ marginTop:'10px',marginLeft: "5px", }}>
          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managertraininglist"); }}
          style={{ ...menuItemStyle("managertraininglist"), color: activePage === "managertraininglist" ? "#182566" : "black", backgroundColor: activePage === "managertraininglist" ? "white" : "transparent" }}
        >
          Training List
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("trainingrequest"); }}
          style={{ ...menuItemStyle("trainingrequest"), color: activePage === "trainingrequest" ? "#182566" : "black", backgroundColor: activePage === "trainingrequest" ? "white" : "transparent" }}
        >
           Training Evaluation
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("trainingevaluationreport"); }}
          style={{ ...menuItemStyle("trainingevaluationreport"), color: activePage === "trainingevaluationreport" ? "#182566" : "black", backgroundColor: activePage === "trainingevaluationreport" ? "white" : "transparent" }}
        >
          Evaluation Report
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("reviewreportfromemployee"); }}
          style={{ ...menuItemStyle("reviewreportfromemployee"), color: activePage === "reviewreportfromemployee" ? "#182566" : "black", backgroundColor: activePage === "reviewreportfromemployee" ? "white" : "transparent" }}
        >
          Employee Feeback
        </li> 
          </div>
    </div>
  )}
        </ul>
      <ul onClick={handleHROperation} 
      style={{
        ...menuItemStyle("HROperation"),
        flexDirection: showHROperation && isSidebarOpen ? "column" : "row",
        margin: 0, // Remove any margin
      }}
      >
      <span>
        {isSidebarOpen && 'HROperation'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showHROperation ? null : <span>&#9660;</span>}
      </span>
      {showHROperation && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px',marginLeft: "5px", }}>
          

          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("managercommunication"); }}
          style={{ ...menuItemStyle("managercommunication"), color: activePage === "managercommunication" ? "#182566" : "black", backgroundColor: activePage === "managercommunication" ? "white" : "transparent" }}
        >
          Communication
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("exitprocedure"); }}
          style={{ ...menuItemStyle("exitprocedure"), color: activePage === "exitprocedure" ? "#182566" : "black", backgroundColor: activePage === "exitprocedure" ? "white" : "transparent" }}
        >
         Exit details
        </li>
          </div>
    </div>
  )}
      </ul>
          </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            marginLeft: isSidebarOpen ? "240px" : "60px",
            transition: "margin-left 0.3s",
            // position: "fixed",
            width: '84%'
          }}
        >
          
          {activePage === "overalldashboard" && <OverallDashboard setActivePage={handlePageChange}/>}
          {activePage === "employeeprofile" && <EmployeeProfile />}
          {activePage === "employees" && <EmployeesList loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName} />}
          {activePage === "managerattendance" && <ManagerAttendance />}
          {activePage === "managermonthlyattendance" && <ManagerMonthlyAttendance />}
          {activePage === "managerviewleave" && <ManagerViewLeave />}
          {activePage === "dailyattendance" && <DailyAttendance />}
          {activePage === "managermonthlyreport" && <ManagerMonthlyReport />}
          {activePage === "monthlyattendancereport" && <MonthlyAttendanceReport />}
          {activePage === "empmonthlyattendacereport" && <EmpMonthlyAttendanceReport />}
          {activePage === "leaveApplication" && <LeaveApplication />}
          {activePage === "performancereport" && <PerformanceReport />}
          {activePage === "manpowertable" && <ManPowerTable />}
          {activePage === "managertraininglist" && <TDManagerTrainingList loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
          {activePage === "trainingrequest" && <TrainingEvaluation loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
          {activePage === "trainingevaluationreport" && <TrainingEvaluationReport  loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName}/>}
          {activePage === "reviewreportfromemployee" && <ReviewReportFromEmployee loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName} />}
          {activePage === "managercommunication" && <ManagerCommunication loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName} />} 
          {activePage === "exitprocedure" && <ExitProcedure loggedInEmployeeId={loggedInEmployeeId} loggedInEmployeeName={loggedInEmployeeName} />}
          {activePage === "payslip" && <Payslip />}
          {activePage === "expensesapproval" && <ExpensesApproval />}
          {activePage === "payoutdisbursements" && <PayoutDisbursements />}
          {activePage === "loanapproval" && <LoanApproval />}
          {activePage === "advancesalaryapplication" && <AdvanceSalaryApplication />}
          {activePage === "finalsettlement" && <FinalSettlement />}
          {activePage === "expensesstatus" && <ManagerExpensesStatus />}
          {activePage === "finalsettlementstatus" && <ManagerFinalSettlementStatus />}
          {activePage === "salaryadvancestatus" && <ManagerSalaryAdvanceStatus />}
          {activePage === "loanstatus" && <ManagerLoanStatus />}
          {activePage === "managerpayslip" && <ManagerPayslip />}
        </div>
     
      </div>
    </div>
  );
}

export default ManagerDashboard;
