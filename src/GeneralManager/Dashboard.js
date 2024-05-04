import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import ManagerDisplay from "./ManagerDisplay";
// import EmployeeDisplay from "./EmployeeDisplay";
// import EmployeeRegistration from "./EmployeeRegistration";
// import ManagerDailyAttendance from "./ManagerDailyAttendance";
// import EmployeeDailyAttendance from "./EmployeeDailyAttendance";
// import ManagerLeaveApplication from "./ManagerLeaveApplication";
// import EmployeeLeaveApplication from "./EmployeeLeaveApplication";
// import MetricsList from "./MetricsList";
// import Payslips from "./Payslips";
// import AddLeaveType from "./AddLeaveType";
// import ManagerMonthlyAttendanceReport from "./ManagerMonthlyAttendanceReport";
// import EmployeeMonthlyAttendanceReport from "./EmployeeMonthlyAttendanceReport";
// import EmployeeExpenses from "./EmployeeExpenses";
// import EmployeePayslips from "./EmployeePayslips";
// import EmployeeLoan from "./EmployeeLoan";
// import EmployeeFinalSettlement from "./EmployeeFinalSettlement";
// import EmployeeSalaryAdvance from "./EmployeeSalaryAdvance";
import MExpenses from "./MExpenses";
import MFinalSettlement from "./MFinalSettlement";
import MLoan from "./MLoan";
import MSalaryAdvance from "./MSalaryAdvance";
import MPayout from "./MPayout";
import MPayslips from "./MPayslips";
// import ManagerPayslip from "./ManagerPayslip";
// import ManagerFinalSettlementStatus from "./ManagerFinalSettlementStatus";
// import ManagerLoanStatus from "./Manager";
import logo from "../Img/logo.jpeg"; // Update the path according to your project structure
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus, // For Add Employee
  faUsers, // For Managers
  faUserTie, // For Employees
  faSignOutAlt,
  faTachometerAlt, // For Dashboard
  faBars, 
  faCaretDown,// For Sidebar Toggle
} from "@fortawesome/free-solid-svg-icons";

function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [showAttendanceDropdown, setShowAttendanceDropdown] = useState(false);

  const [showLeaveApplicationDropdown, setShowLeaveApplicationDropdown] =
    useState(false);
  const [showMonthlyAttendanceDropdown, setShowMonthlyAttendanceDropdown] =
    useState(false);
  const [showPayrollDropdown, setShowPayrollDropdown] = useState(false);

  const [showManagerPayrollDropdown, setShowManagerPayrollDropdown] =
    useState(false);

  const sidebarHeight = window.innerHeight - 70;
  const handlePayrollDropdown = () => {
    toggleDropdown(setShowPayrollDropdown);
  };

  const toggleDropdown = (dropdownSetter) => {
    dropdownSetter((prevState) => !prevState);
  };
  const dropdownIconStyle = {
    marginLeft: "auto",
    transition: "transform 0.3s",
  };

  // Function to handle dropdown icon rotation
  const getDropdownIconRotation = (isDropdownOpen) => {
    return { transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)" };
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const handleLogout = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItemStyle = (page) => ({
    padding: "10px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    backgroundColor: activePage === page ? "#4CAF50" : "transparent", // Updated color
    color: activePage === page ? "white" : "#333", // Text color changes on active
    transition: "background-color 0.1s, color 0.1s", // Smooth transition for background and text color
    border: "none",
  });

  return (
    <div>
      {/* Fixed Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          padding: "10px 20px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <button
          onClick={toggleSidebar}
          style={{ background: "none", border: "none", fontSize: "20px" }}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "50px", width: "175px", marginLeft: "10px" }}
        />
        <div style={{ marginLeft: "auto" }}>
          <button onClick={handleLogout} className="logoutButton">
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", paddingTop: "70px" }}>
        <div
          style={{
            width: isSidebarOpen ? "230px" : "60px",
            backgroundColor: "#f0f0f0",
            padding: isSidebarOpen ? "20px" : "5px",
            height: `${sidebarHeight}px`, 
            overflowY: "auto", 
            position: "fixed",
            top: "70px",
            zIndex: 1001,
            transition: "width 0.3s",
          }}
        >
          {isSidebarOpen && <h3 className="text-center">Manager</h3>}
          <button
            onClick={() => handlePageChange("dashboard")}
            style={menuItemStyle("dashboard")}
          >
            {isSidebarOpen && "Dashboard"}
          </button>
          {/* <button
            onClick={() => handlePageChange("addemployee")}
            style={menuItemStyle("addemployee")}
          >
            {isSidebarOpen && "Add Employee"}
          </button> */}
          {/* <button
            onClick={() => handlePageChange("payslips")}
            style={menuItemStyle("payslips")}
          >
            {isSidebarOpen && "Payslip"}
          </button> */}
          {/* <button
            onClick={() => handlePageChange("managers")}
            style={menuItemStyle("managers")}
          >
            {isSidebarOpen && "Managers"}
          </button>
          <button
            onClick={() => handlePageChange("employees")}
            style={menuItemStyle("employees")}
          >
            {isSidebarOpen && "Employees"}
          </button> */}

          {/* Manager Attendance Dropdown */}
          {/* <button
            onClick={() => toggleDropdown(setShowAttendanceDropdown)}
            style={menuItemStyle("attendance")}
          >
            {isSidebarOpen && " Daily Attendance"}
          </button>
          {showAttendanceDropdown && isSidebarOpen && (
            <div style={{ marginLeft: "30px" }}>
              <button
                onClick={() => handlePageChange("managerdailyattendance")}
                style={menuItemStyle("managerdailyattendance")}
              >
                Manager
              </button>
              <button
                onClick={() => handlePageChange("employeedailyattendance")}
                style={menuItemStyle("employeedailyattendance")}
              >
                Employee
              </button>

             
            </div>
          )} */}

          {/* Leave Application Dropdown */}
          {/* <button
            onClick={() => toggleDropdown(setShowMonthlyAttendanceDropdown)}
            style={menuItemStyle("MonthlyAttendance")}
          >
            {isSidebarOpen && "MonthlyAttendance"}
          </button>
          {showMonthlyAttendanceDropdown && isSidebarOpen && (
            <div style={{ marginLeft: "30px" }}>
              <button
                onClick={() =>
                  handlePageChange("managermonthlyattendancereport")
                }
                style={menuItemStyle("managermonthlyattendancereport")}
              >
                Manager
              </button>
              <button
                onClick={() => handlePageChange("employeemonthlyreport")}
                style={menuItemStyle("employeemonthlyreport")}
              >
                Employee
              </button>
            </div>
          )} */}

          {/* Leave Application Dropdown */}
          {/* <button
            onClick={() => toggleDropdown(setShowLeaveApplicationDropdown)}
            style={menuItemStyle("leaveapplication")}
          >
            {isSidebarOpen && "Leave Status"}
          </button>
          {showLeaveApplicationDropdown && isSidebarOpen && (
            <div style={{ marginLeft: "30px" }}>
              <button
                onClick={() => handlePageChange("managerleaveapplication")}
                style={menuItemStyle("managerleaveapplication")}
              >
                Manager
              </button>
              <button
                onClick={() => handlePageChange("employeeleaveapplication")}
                style={menuItemStyle("employeeleaveapplication")}
              >
                Employee
              </button>
            </div>
          )}

          <button
            onClick={() => handlePageChange("addleavetype")}
            style={menuItemStyle("addleavetype")}
          >
            {isSidebarOpen && "Leave Type"}
          </button>

          <button
            onClick={() => handlePageChange("metricslist")}
            style={menuItemStyle("metricslist")}
          >
            {isSidebarOpen && " PerformanceMetrics"}
          </button>
          <button
            onClick={handlePayrollDropdown}
            style={menuItemStyle("payroll")}
          >
            {isSidebarOpen && "EmployeePayroll"}
          </button>
          {showPayrollDropdown && isSidebarOpen && (
            <div style={{ marginLeft: "30px" }}>
              <button
                onClick={() => handlePageChange("payslips")}
                style={menuItemStyle("payslips")}
              >
                Payslips
              </button>
              <button
                onClick={() => handlePageChange("employeeexpenses")}
                style={menuItemStyle("employeeexpenses")}
              >
                Expenses
              </button>
              <button
                onClick={() => handlePageChange("employeepayslip")}
                style={menuItemStyle("employeepayslip")}
              >
                Payslip
              </button>
              <button
                onClick={() => handlePageChange("employeeloan")}
                style={menuItemStyle("employeeloan")}
              >
                Loan
              </button>
              <button
                onClick={() => handlePageChange("employeeadvance")}
                style={menuItemStyle("employeeadvance")}
              >
                AdvanceSalary
              </button>
              <button
                onClick={() => handlePageChange("employeefinalsettlement")}
                style={menuItemStyle("employeefinalsettlement")}
              >
                FinalSettlement
              </button>
            </div>
          )} */}
          {/* <button
                onClick={() => handlePageChange("managerexpensesstatus")}
                style={menuItemStyle("managerexpensesstatus")}
              >
                 ManagerExpenses
              </button>
              <button
                onClick={() => handlePageChange("managerfinalsettlement")}
                style={menuItemStyle("managerfinalsettlement")}
              >
                 ManagerFinal
              </button>
              <button
                onClick={() => handlePageChange("managerloan")}
                style={menuItemStyle("managerloan")}
              >
                 ManagerLoan
              </button>
              <button
                onClick={() => handlePageChange("managersalaryadvance")}
                style={menuItemStyle("managersalaryadvance")}
              >
                 ManagerSalaryAdvance
              </button> */}
        <button
            onClick={() => toggleDropdown(setShowManagerPayrollDropdown)}
            style={menuItemStyle("managerpayroll")}
          >
            {isSidebarOpen && "Manager Payroll"}
            <FontAwesomeIcon
              icon={faCaretDown}
              style={{ ...dropdownIconStyle, ...getDropdownIconRotation(showManagerPayrollDropdown) }}
            />
          </button>
          {showManagerPayrollDropdown && isSidebarOpen && (
            <div style={{ marginLeft: "30px", backgroundColor: "#e0e0e0" }}> {/* Updated background color */}
         
              <button
                onClick={() => handlePageChange("managerpayslip")}
                style={menuItemStyle("managerpayslip")}
              >
                Payslip
              </button>
              <button
                onClick={() => handlePageChange("managerexpensesstatus")}
                style={menuItemStyle("managerexpensesstatus")}
              >
                Expenses
              </button>
              <button
                onClick={() => handlePageChange("managerfinalsettlement")}
                style={menuItemStyle("managerfinalsettlement")}
              >
                FinalSettlement
              </button>
              <button
                onClick={() => handlePageChange("managerloan")}
                style={menuItemStyle("managerloan")}
              >
                Loan
              </button>
              <button
                onClick={() => handlePageChange("managersalaryadvance")}
                style={menuItemStyle("managersalaryadvance")}
              >
                SalaryAdvance
              </button>
              <button
                onClick={() => handlePageChange("mpayout")}
                style={menuItemStyle("mpayout")}
              >
                Payout
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            marginLeft: isSidebarOpen ? "230px" : "60px",
            transition: "margin-left 0.3s",
          }}
        >
          {activePage === "dashboard" && <div>Dashboard Content Here</div>}
          {/* {activePage === "managers" && <ManagerDisplay />}
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
          {activePage === "employeeexpenses" && <EmployeeExpenses />}

          {activePage === "employeepayslip" && <EmployeePayslips />}
          {activePage === "employeeloan" && <EmployeeLoan />}
          {activePage === "employeeadvance" && <EmployeeSalaryAdvance />}
          {activePage === "employeefinalsettlement" && (
            <EmployeeFinalSettlement />
          )} */}
           {activePage === "managerpayslip" && <MPayslips />}
          {activePage === "managerexpensesstatus" && <MExpenses />}
          {activePage === "managerfinalsettlement" && (
            <MFinalSettlement />
          )}
          {activePage === "managerloan" && <MLoan />}
          {activePage === "managersalaryadvance" && <MSalaryAdvance />}
          {activePage === "mpayout" && <MPayout />}
          {/* {activePage === "managerpayslips" && <ManagerPayslip />} */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
