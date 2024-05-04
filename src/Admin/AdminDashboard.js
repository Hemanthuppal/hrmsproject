import React, { useState,useEffect } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { useNavigate } from "react-router-dom";
import ManagerDisplay from "./ManagerDisplay";
import EmployeeDisplay from "./EmployeeDisplay";
import EmployeeRegistration from "./EmployeeRegistration";
import ManagerDailyAttendance from "./ManagerDailyAttendance";
import EmployeeDailyAttendance from "./EmployeeDailyAttendance";
import ManagerLeaveApplication from "./ManagerLeaveApplication";
import EmployeeLeaveApplication from "./EmployeeLeaveApplication";
import MetricsList from "./MetricsList";
import Payslips from "./Payslips";
import AddLeaveType from "./AddLeaveType";
import ManagerMonthlyAttendanceReport from "./ManagerMonthlyAttendanceReport";
import EmployeeMonthlyAttendanceReport from "./EmployeeMonthlyAttendanceReport";
import EmployeeExpenses from "./EmployeeExpenses";
import EmployeePayslips from "./EmployeePayslips";
import EmployeeLoan from "./EmployeeLoan";
import EmployeeFinalSettlement from "./EmployeeFinalSettlement";
import EmployeeSalaryAdvance from "./EmployeeSalaryAdvance";
import ManagerExpensesStatus from "./ManagerExpensesStatus";
import ManagerFinalSettlement from "./ManagerFinalSettlement";
import ManagerLoan from "./ManagerLoan";
import ManagerSalaryAdvance from "./ManagerSalaryAdvance";
import ManagerPayslip from "./ManagerPayslip";
import Applicants from "./Applicants";
import AdminSelectedCandidates from "./AdminSelectedCandidates";
import TrainingType from './TrainingType';
import TrainingEvaluation from './TrainingEvaluation';
import TrainingBudget from './TrainingBudget';
import TrainingConduction from './TrainingConduction';
import logo from "../Img/logohrms.png"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faSignOutAlt,faBars,faL,} from "@fortawesome/free-solid-svg-icons";
import LeavesDashboard from './LeavesDashboard';
import OverallAdminDashboard from "./OverallAdminDashboard";
import Policy from "./Policy";
import ExitProcedure from "./ExitProcedure";
import AnnualBudget from "./AnnualBudget";
import OverallTandDDashboard from "./OverallTandDDashboard";
import Holidays from "./Holidays";
import MonthlyReport from "./MonthlyReport";

function AdminDashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);
  const [showLeaveApplicationDropdown, setShowLeaveApplicationDropdown] =useState(false);
  const [showMonthlyAttendanceDropdown, setShowMonthlyAttendanceDropdown] =useState(false);
  const [showPayrollDropdown, setShowPayrollDropdown] = useState(false);
  const [showManagerPayrollDropdown, setShowManagerPayrollDropdown] =useState(false);
  const [showTrainingAndDevelopment, setShowTrainingAndDevelopment] =useState(false);
  const [showHROperation, setShowHROperation] =useState(false);
  const [showTalentAcquisition, setShowTalentAcquisition] =useState(false);
  const sidebarHeight = window.innerHeight - 60;

  const handlePayrollDropdown = () => {
    toggleDropdown(setShowPayrollDropdown,"employeepayslip");
  };

  const handleTrainingAndDevelopment = () => {
    toggleDropdown(setShowTrainingAndDevelopment,"overallTandD");
  };

  const handleTalentAcquisition = () => {
    toggleDropdown(setShowTalentAcquisition,"applicants");
  };

  const handleHROperation = () => {
    toggleDropdown(setShowHROperation,"annualbudget");
  };

  const toggleDropdown = (dropdownSetter, defaultPage) => {
    // Close the current dropdown if it's already open
    if (dropdownSetter === setShowAttendanceDropdown && showAttendanceDropdown) {
      setShowAttendanceDropdown(false);
    } else if (dropdownSetter === setShowLeaveApplicationDropdown && showLeaveApplicationDropdown) {
      setShowLeaveApplicationDropdown(false);
    } else if (dropdownSetter === setShowMonthlyAttendanceDropdown && showMonthlyAttendanceDropdown) {
      setShowMonthlyAttendanceDropdown(false);
    } else if (dropdownSetter === setShowPayrollDropdown && showPayrollDropdown) {
      setShowPayrollDropdown(false);
    } else if (dropdownSetter === setShowManagerPayrollDropdown && showManagerPayrollDropdown) {
      setShowManagerPayrollDropdown(false);
    } else if (dropdownSetter === setShowTrainingAndDevelopment && showTrainingAndDevelopment) {
      setShowTrainingAndDevelopment(false);
    } else if (dropdownSetter === setShowHROperation && showHROperation) {
      setShowHROperation(false);
    }  else if (dropdownSetter === setShowTalentAcquisition && showTalentAcquisition) {
      setShowTalentAcquisition(false);
    }else {
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
  
  const handlePageChange = (page) => {
    setActivePage(page);
    
    // Close all dropdowns initially
    resetAllDropdowns();
    
    // Add logic to open relevant dropdown based on the selected page
    if (page.includes("dailyattendance") || page === "employeemonthlyreport"|| page === "monthlyreport" || page === "employeedailyattendance"|| page === "employeeleaveapplication"|| page === "addleavetype"|| page === "holidays") {
      setShowAttendanceDropdown(true);
    } else if (page.includes("MonthlyAttendance") || page === "managermonthlyattendancereport" || page === "employeemonthlyreport") {
      setShowMonthlyAttendanceDropdown(true);
    } else if (page.includes("leaveapplication") || page === "managerleaveapplication" || page === "employeeleaveapplication") {
      setShowLeaveApplicationDropdown(true);
    } else if (page.includes("employee") && (page.includes("expenses") || page.includes("payslip") || page.includes("loan") || page.includes("advance") || page.includes("finalsettlement"))) {
      setShowPayrollDropdown(true);
    } else if (page.includes("manager") && (page.includes("expenses") || page.includes("payslip") || page.includes("loan") || page.includes("advance") || page.includes("finalsettlement"))) {
      setShowManagerPayrollDropdown(true);
    } else if (page.includes("TDDevelopment") || page.includes("overallTandD")|| page.includes("addtraining")|| page.includes("trainingbudget")|| page.includes("trainingevaluation")|| page.includes("trainingconduction")) {
      setShowTrainingAndDevelopment(true);
    }else if (page.includes("HROperation") || page.includes("policy")|| page.includes("exitprocedure")|| page.includes("annualbudget")) {
      setShowHROperation(true);
    }else if (page.includes("talentAcquisition") || page.includes("applicants")|| page.includes("adminselectedcandidates")) {
      setShowTalentAcquisition(true);
    }
    // Add conditions for other dropdowns as needed
  };

  // Function to close all dropdowns - reset their states
  const resetAllDropdowns = () => {
    setShowAttendanceDropdown(false);
    setShowLeaveApplicationDropdown(false);
    setShowMonthlyAttendanceDropdown(false);
    setShowPayrollDropdown(false);
    setShowManagerPayrollDropdown(false);
    setShowTrainingAndDevelopment(false);
    setShowHROperation(false);
    setShowTalentAcquisition(false);
    
  };
  

  const handleLogout = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItemStyle = (page) => ({
  padding: "10px", // Keep the padding for top, right, and bottom
  paddingLeft: isSidebarOpen ? "20px" : "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  width: '100%',
  fontWeight: (showPayrollDropdown && page === "payroll") || 
    (showManagerPayrollDropdown && page === "managerpayroll") || 
    (showTrainingAndDevelopment && page === "TDDevelopment")|| 
    (showLeaveApplicationDropdown && page === "leaveapplication") ||
    (showAttendanceDropdown && page === "attendance") ||
    (showMonthlyAttendanceDropdown && page === "MonthlyAttendance") ||
    (showTalentAcquisition && page === "talentAcquisition") ||
    (showHROperation && page === "HROperation") ? "bold" : activePage === page ? "bold" : "normal",
  backgroundColor: activePage === page ? "white" : ((showPayrollDropdown && page === "payroll") || 
    (showManagerPayrollDropdown && page === "managerpayroll") || 
    (showTrainingAndDevelopment && page === "TDDevelopment") || 
    (showLeaveApplicationDropdown && page === "leaveapplication") ||
    (showAttendanceDropdown && page === "attendance") ||
    (showMonthlyAttendanceDropdown && page === "MonthlyAttendance") ||
    (showTalentAcquisition && page === "talentAcquisition") ||
    (showHROperation && page === "HROperation") ? "lightgrey" : "transparent"),
  color: (showPayrollDropdown && page === "payroll") || 
    (showManagerPayrollDropdown && page === "managerpayroll") || 
    (showTrainingAndDevelopment && page === "TDDevelopment")|| 
    (showLeaveApplicationDropdown && page === "leaveapplication") ||
    (showAttendanceDropdown && page === "attendance") ||
    (showMonthlyAttendanceDropdown && page === "MonthlyAttendance") ||
    (showTalentAcquisition && page === "talentAcquisition") ||
    (showHROperation && page === "HROperation") ? "#182566" : (activePage === page ? "#182566" : "white"),
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

      <div style={{ display: "flex", paddingTop: "70px" ,}}>
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
          {isSidebarOpen && <h3 className="text-center">Admin</h3>}
          <li
              onClick={() => handlePageChange("dashboard")}
              style={menuItemStyle("dashboard")}
            >
              Dashboard
            </li>
          <li
            onClick={() => handlePageChange("addemployee")}
            style={menuItemStyle("addemployee")}
          >
            {isSidebarOpen && "Add Employee"}
          </li>
          
          <li
            onClick={() => handlePageChange("managers")}
            style={menuItemStyle("managers")}
          >
            {isSidebarOpen && "Managers"}
          </li>
          <li
            onClick={() => handlePageChange("employees")}
            style={menuItemStyle("employees")}
          >
            {isSidebarOpen && "Employees"}
          </li>
      
          <ul
  onClick={() => toggleDropdown(setShowAttendanceDropdown, "employeedailyattendance")}
  style={{
    ...menuItemStyle("attendance"),
    flexDirection: showAttendanceDropdown && isSidebarOpen ? "column" : "row",
    margin: 0, 
    
  }}
>
  <span>
    {isSidebarOpen && "Leave&Attendance"}&nbsp;&nbsp;
    {showAttendanceDropdown ? null : <span>&#9660;</span>}
  </span>
  {showAttendanceDropdown && isSidebarOpen && (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginTop:'10px' }}>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("employeedailyattendance"); }}
          style={{ ...menuItemStyle("employeedailyattendance"), color: activePage === "employeedailyattendance" ? "#182566" : "black", backgroundColor: activePage === "employeedailyattendance" ? "white" : "transparent" }}
        >
          DailyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("employeemonthlyreport"); }}
          style={{ ...menuItemStyle("employeemonthlyreport"), color: activePage === "employeemonthlyreport" ? "#182566" : "black", backgroundColor: activePage === "employeemonthlyreport" ? "white" : "transparent" }}
        >
          MonthlyAttendance
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("monthlyreport"); }}
          style={{ ...menuItemStyle("monthlyreport"), color: activePage === "monthlyreport" ? "#182566" : "black", backgroundColor: activePage === "monthlyreport" ? "white" : "transparent" }}
        >
          MonthlyReport
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("employeeleaveapplication"); }}
          style={{ ...menuItemStyle("employeeleaveapplication"), color: activePage === "employeeleaveapplication" ? "#182566" : "black", backgroundColor: activePage === "employeeleaveapplication" ? "white" : "transparent" }}
        >
          Leave Status
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("addleavetype"); }}
          style={{ ...menuItemStyle("addleavetype"), color: activePage === "addleavetype" ? "#182566" : "black", backgroundColor: activePage === "addleavetype" ? "white" : "transparent" }}
        >
          Leave Type
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("holidays"); }}
          style={{ ...menuItemStyle("holidays"), color: activePage === "holidays" ? "#182566" : "black", backgroundColor: activePage === "holidays" ? "white" : "transparent" }}
        >
          Holidays
        </li>
      </div>
    </div>
  )}
        </ul>
        <li
          onClick={() => handlePageChange("metricslist")}
          style={{
            ...menuItemStyle("metricslist"),
            
          }}
        >
          {isSidebarOpen && " PerformanceMetrics"}
        </li>

        <li
                      onClick={() => handlePageChange("payslips")}
                      style={menuItemStyle("payslips")}
                    >
                      Payslips
        </li>

          <ul
          onClick={handlePayrollDropdown}
          style={{
            ...menuItemStyle("payroll"),
            flexDirection: showPayrollDropdown && isSidebarOpen ? "column" : "row",
            margin: 0, // Remove any margin
          }}
        >
          <span>
            {isSidebarOpen && "Payroll"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {showAttendanceDropdown ? null : <span>&#9660;</span>}
          </span>
          {showPayrollDropdown && isSidebarOpen && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginTop:'10px',marginLeft: "5px", }}>
              <li
                  onClick={(e) => { e.stopPropagation(); handlePageChange("employeepayslip"); }}
                  style={{ ...menuItemStyle("employeepayslip"), color: activePage === "employeepayslip" ? "#182566" : "black", backgroundColor: activePage === "employeepayslip" ? "white" : "transparent" }}
                >
                  Payslip
                </li>
                <li
                  onClick={(e) => { e.stopPropagation(); handlePageChange("employeeexpenses"); }}
                  style={{ ...menuItemStyle("employeeexpenses"), color: activePage === "employeeexpenses" ? "#182566" : "black", backgroundColor: activePage === "employeeexpenses" ? "white" : "transparent" }}
                >
                  Expenses
                </li>
                
                <li
                  onClick={(e) => { e.stopPropagation(); handlePageChange("employeeloan"); }}
                  style={{ ...menuItemStyle("employeeloan"), color: activePage === "employeeloan" ? "#182566" : "black", backgroundColor: activePage === "employeeloan" ? "white" : "transparent" }}
                >
                  Loan
                </li>
                <li
                  onClick={(e) => { e.stopPropagation(); handlePageChange("employeeadvance"); }}
                  style={{ ...menuItemStyle("employeeadvance"), color: activePage === "employeeadvance" ? "#182566" : "black", backgroundColor: activePage === "employeeadvance" ? "white" : "transparent" }}
                >
                  AdvanceSalary
                </li>
                <li
                  onClick={(e) => { e.stopPropagation(); handlePageChange("employeefinalsettlement"); }}
                  style={{ ...menuItemStyle("employeefinalsettlement"), color: activePage === "employeefinalsettlement" ? "#182566" : "black", backgroundColor: activePage === "employeefinalsettlement" ? "white" : "transparent" }}
                >
                FinalSettlement
                </li>
              </div>
            </div>
          )}
        </ul>
              <li
                onClick={() => handlePageChange("managerpayslips")}
                style={menuItemStyle("managerpayslips")}
              >
                ManagerPayslip
           </li>
            <ul
            onClick={handleTalentAcquisition}
            style={{
              ...menuItemStyle("talentAcquisition"),
              flexDirection: showTalentAcquisition && isSidebarOpen ? "column" : "row",
              margin: 0, // Remove any margin
            }}
          >
            <span>
              {isSidebarOpen && "TalentAcquisition"}&nbsp;&nbsp;&nbsp;&nbsp;
              {showTalentAcquisition ? null : <span>&#9660;</span>}
            </span>
            {showTalentAcquisition && isSidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginLeft: "5px", marginTop:'10px' }}>
                  <li
                    onClick={(e) => { e.stopPropagation(); handlePageChange("applicants"); }}
                    style={{ ...menuItemStyle("applicants"), color: activePage === "applicants" ? "#182566" : "black", backgroundColor: activePage === "applicants" ? "white" : "transparent" }}
                  >
                    Internal Selects
                  </li>
                  <li
                    onClick={(e) => { e.stopPropagation(); handlePageChange("adminselectedcandidates"); }}
                    style={{ ...menuItemStyle("adminselectedcandidates"), color: activePage === "adminselectedcandidates" ? "#182566" : "black", backgroundColor: activePage === "adminselectedcandidates" ? "white" : "transparent" }}
                  >
                    SelectedCandidates
                  </li>
                  
                </div>
              </div>
            )}
          </ul>

            <ul
              onClick={handleTrainingAndDevelopment}
              style={{
                ...menuItemStyle("TDDevelopment"),
                flexDirection: showTrainingAndDevelopment && isSidebarOpen ? "column" : "row",
                margin: 0, // Remove any margin
              }}
            >
              <span>
                {isSidebarOpen && "T&D"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                {showTrainingAndDevelopment ? null : <span>&#9660;</span>}
              </span>
              {showTrainingAndDevelopment && isSidebarOpen && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginLeft: "5px", marginTop:'10px'  }}>
                  <li
                      onClick={(e) => { e.stopPropagation(); handlePageChange("overallTandD"); }}
                      style={{ ...menuItemStyle("overallTandD"), color: activePage === "overallTandD" ? "#182566" : "black", backgroundColor: activePage === "overallTandD" ? "white" : "transparent" }}
                    >
                      OverView
                    </li>
                    <li
                      onClick={(e) => { e.stopPropagation(); handlePageChange("addtraining"); }}
                      style={{ ...menuItemStyle("addtraining"), color: activePage === "addtraining" ? "#182566" : "black", backgroundColor: activePage === "addtraining" ? "white" : "transparent" }}
                    >
                      Trainings
                    </li>
                    <li
                      onClick={(e) => { e.stopPropagation(); handlePageChange("trainingbudget"); }}
                      style={{ ...menuItemStyle("trainingbudget"), color: activePage === "trainingbudget" ? "#182566" : "black", backgroundColor: activePage === "trainingbudget" ? "white" : "transparent" }}
                    >
                      Training Budget
                    </li>
                    <li
                      onClick={(e) => { e.stopPropagation(); handlePageChange("trainingevaluation"); }}
                      style={{ ...menuItemStyle("trainingevaluation"), color: activePage === "trainingevaluation" ? "#182566" : "black", backgroundColor: activePage === "trainingevaluation" ? "white" : "transparent" }}
                    >
                      TrainingEvaluation
                    </li>
                    <li
                      onClick={(e) => { e.stopPropagation(); handlePageChange("trainingconduction"); }}
                      style={{ ...menuItemStyle("trainingconduction"), color: activePage === "trainingconduction" ? "#182566" : "black", backgroundColor: activePage === "trainingconduction" ? "white" : "transparent" }}
                    >
                      TrainingConduction
                    </li>
                    
                  </div>
                </div>
              )}
            </ul>

          <ul
            onClick={handleHROperation}
            style={{
              ...menuItemStyle("HROperation"),
              flexDirection: showHROperation && isSidebarOpen ? "column" : "row",
            }}
          >
            <span>
              {isSidebarOpen && "HROperation"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {showHROperation ? null : <span>&#9660;</span>}
            </span>
            {showHROperation && isSidebarOpen && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginLeft: "5px", marginTop:'10px'  }}>
                  <li
                    onClick={(e) => { e.stopPropagation(); handlePageChange("annualbudget"); }}
                    style={{ ...menuItemStyle("annualbudget"), color: activePage === "v" ? "#182566" : "black", backgroundColor: activePage === "annualbudget" ? "white" : "transparent" }}
                  >
                    Annual Budget
                  </li>
                  <li
                    onClick={(e) => { e.stopPropagation(); handlePageChange("policy"); }}
                    style={{ ...menuItemStyle("policy"), color: activePage === "policy" ? "#182566" : "black", backgroundColor: activePage === "policy" ? "white" : "transparent" }}
                  >
                    Policy
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
          {activePage === "dashboard" && <OverallAdminDashboard setActivePage={handlePageChange}/>}
          {activePage === "managers" && <ManagerDisplay />}
          {activePage === "employees" && <EmployeeDisplay />}
          {activePage === "addemployee" && <EmployeeRegistration />}
          {activePage === "payslips" && <Payslips />}
          {activePage === "managerdailyattendance" && (
            <ManagerDailyAttendance />
          )}
          {activePage === "employeedailyattendance" && (
            <EmployeeDailyAttendance />
          )}
          
          {activePage === "addleavetype" && <AddLeaveType />}
          {activePage ==='holidays' && <Holidays/>}

          {/* {activePage === "leavedashboard" && (
            <LeavesDashboard  setActivePage={handlePageChange}/>
          )} */}
          {activePage === "managerleaveapplication" && (
            <ManagerLeaveApplication />
          )}
          {activePage === "employeeleaveapplication" && (
            <EmployeeLeaveApplication />
          )}
          {activePage === "managermonthlyattendancereport" && (
            <ManagerMonthlyAttendanceReport />
          )}
          
          {activePage === "metricslist" && <MetricsList />}
          {activePage === "employeemonthlyreport" && (
            <EmployeeMonthlyAttendanceReport />
          )}
          {activePage === "monthlyreport" && (
            <MonthlyReport />
          )}
          {activePage === "employeeexpenses" && <EmployeeExpenses />}

          {activePage === "employeepayslip" && <EmployeePayslips />}
          {activePage === "employeeloan" && <EmployeeLoan />}
          {activePage === "employeeadvance" && <EmployeeSalaryAdvance />}
          {activePage === "employeefinalsettlement" && (
            <EmployeeFinalSettlement />
          )}
          {activePage === "managerexpensesstatus" && <ManagerExpensesStatus />}
          {activePage === "managerfinalsettlement" && (
            <ManagerFinalSettlement />
          )}
          {activePage === "managerloan" && <ManagerLoan />}
          {activePage === "managersalaryadvance" && <ManagerSalaryAdvance />}
          {activePage === "managerpayslips" && <ManagerPayslip />}
          {activePage === "applicants" && <Applicants />}
          {activePage === "adminselectedcandidates" && (
            <AdminSelectedCandidates />
          )}
          {activePage === "overallTandD" &&  (
            <OverallTandDDashboard />
          )}
          {activePage === "addtraining" &&  (
            <TrainingType />
          )} {activePage === "trainingbudget" && (
            <TrainingBudget />
          )} {activePage === "trainingevaluation" && (
            <TrainingEvaluation />
          )} {activePage === "trainingconduction" && (
            <TrainingConduction />
          )}
          {activePage === "policy" && <Policy />}
          {activePage === "exitprocedure" && <ExitProcedure />}
          {activePage === "annualbudget" && <AnnualBudget />}
      </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
