// Import necessary components
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import logo from '../Img/logohrms.png';
import MarkAttendance from '../MarkAttendance';
import ViewLeave from '../ViewLeave'; // Add this line
import EmployeeReport from '../EmployeeReport'; 
import EmployeeProfile from '../EmployeeProfile';
import PerformanceReview from '../SelfReview';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt,faBars,faL} from "@fortawesome/free-solid-svg-icons";
import EmployeeMonthlyAttendance from '../EmployeeMonthlyAttendance';
import Sourcing from "./Sourcing";
import SourcedProfiles from "./SourcedProfiles";
import Interviews from "./Interviews";
import SelectedCandidates from "./SelectedCandidates";
import EmployeePositions from "./EmployeePositions";
import OnBoarding from "./OnBoarding";
import ViewNegotiations from "./ViewNegotiations";
import InternalApplicants from './InternalApplicants';
import HRTotalNumbers from './HRTotalNumbers' ;
import Expenses from '../Expenses';


import EmployeePayslip from '../EmployeePayslip';
import ExpensesTable from '../ExpensesTable';
import SalaryAdvance from '../SalaryAdvance';
import Loan from '../Loan';
import LoanStatus from '../LoanStatus';
import AdvanceSalaryStatus from '../AdvanceSalaryStatus';
import FinalSettlement from '../FinalSettlement';
import FinalSettlementStatus from '../FinalSettlementStatus';
import Payout from '../Payout';

import VacantPositions from '../VacantPositions';
import EmpTrainingList from '../EmpTrainingList';
import EmployeeTrainingTypes from '../EmployeeTrainingTypes';
import EvaluationReport from '../EvaluationReport';
import ReviewOnTrainer from '../ReviewOnTrainer';
import ReviewReportOnTrainer from '../ReviewReportOnTrainer';
import EmployeeCommunication from '../EmployeeCommunication';
import ExitProcedure from '../ExitProcedure';


function EmployeeDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [employeeData, setEmployeeData] = useState(null);
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [activePage, setActivePage] = useState("overalldashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarHeight = window.innerHeight - 70;
  const [showEmployeePayroll, setShowEmployeePayroll] =useState(false);
  const [showTrainingAndDevelopment, setShowTrainingAndDevelopment] =useState(false);
  const [showHROperation, setShowHROperation] =useState(false);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const fetchedEmployeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(fetchedEmployeeData.fullName);
            setEmployeeData(fetchedEmployeeData); // Set employeeData in state
            console.log("Name=", fetchedEmployeeData.fullName);
            console.log("assignedManagerUid=", fetchedEmployeeData.assignedManagerUid);
            console.log("employeeData=", fetchedEmployeeData);
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

 
  const handleTrainingandDevelopment = () => {
    toggleDropdown(setShowTrainingAndDevelopment,"traininglist");
  };
  
  const handleEmployeePayroll = () => {
    toggleDropdown(setShowEmployeePayroll,"employeepayslip");
  };

  const handleHROperation = () => {
    toggleDropdown(setShowHROperation,"employeecommunication");
  };

  const toggleDropdown = (dropdownSetter, defaultPage) => {
    if (dropdownSetter === setShowTrainingAndDevelopment && showTrainingAndDevelopment) {
      setShowTrainingAndDevelopment(false);
    }else if (dropdownSetter === setShowEmployeePayroll && showEmployeePayroll) {
      setShowEmployeePayroll(false);
    }else if (dropdownSetter === setShowHROperation && showHROperation) {
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

  const handlePageChange = (page) => {
    setActivePage(page);
    resetAllDropdowns();
    if (page.includes("T&D") || page === "traininglist" || page === "exploretraining" || page === "evaluationreport" || page === "reviewontraining"|| page === "reviewreport" ) {
      setShowTrainingAndDevelopment(true);
    } else if (page.includes("EmployeePayroll") || page === "employeepayslip" || page === "expensestable" || page === "loanstatus" || page === "finalstatus" || page === "advancesalarystatus" || page === "payout") {
      setShowEmployeePayroll(true);
    } else if (page.includes("HROperation") || page.includes("employeecommunication")|| page.includes("exitprocedure")) {
      setShowHROperation(true);
    }
  };
  

  const resetAllDropdowns = () => {  
    setShowTrainingAndDevelopment(false);
    setShowEmployeePayroll(false);
    setShowHROperation(false);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItemStyle = (page) => ({
    padding: "10px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    width: '100%',
    fontWeight: (showEmployeePayroll && page === "EmployeePayroll") ||
    (showHROperation && page === "HROperation") ||
    (showTrainingAndDevelopment && page === "T&D") ? "bold" : activePage === page ? "bold" : "normal",
    backgroundColor: activePage === page ? "white" : ((showEmployeePayroll && page === "EmployeePayroll") ||
      (showHROperation && page === "HROperation") ||
      (showTrainingAndDevelopment && page === "T&D") ? "lightgrey" : "transparent"),
    color: (showEmployeePayroll && page === "EmployeePayroll") ||
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
            onClick={() => handlePageChange("positions")}
            style={menuItemStyle("positions")}
          >
            {isSidebarOpen && "Open Positions"}
          </li>
          <li
            onClick={() => handlePageChange("InternalApplies")}
            style={menuItemStyle("InternalApplies")}
          >
            {isSidebarOpen && "Internal Applies"}
          </li>
          <li
            onClick={() => handlePageChange("TalentSourcing")}
            style={menuItemStyle("TalentSourcing")}
          >
            {isSidebarOpen && "Talent Sourcing"}
          </li>
          <li
            onClick={() => handlePageChange("SourcedProfiles")}
            style={menuItemStyle("SourcedProfiles")}
          >
            {isSidebarOpen && "Sourced Profiles"}
          </li>
          <li
            onClick={() => handlePageChange("interview")}
            style={menuItemStyle("interview")}
          >
            {isSidebarOpen && "Interview"}
          </li>
          <li
            onClick={() => handlePageChange("SelectedProfiles")}
            style={menuItemStyle("SelectedProfiles")}
          >
            {isSidebarOpen && "Selected Profiles"}
          </li>
          <li
            onClick={() => handlePageChange("Negotiation")}
            style={menuItemStyle("Negotiation")}
          >
            {isSidebarOpen && "Negotiation"}
          </li>
          <li
            onClick={() => handlePageChange("OnBoarding")}
            style={menuItemStyle("OnBoarding")}
          >
            {isSidebarOpen && "OnBoarding"}
          </li>
          <li
            onClick={() => handlePageChange("profile")}
            style={menuItemStyle("profile")}
          >
            {isSidebarOpen && "Profile"}
          </li>
          <li
            onClick={() => handlePageChange("markAttendance")}
            style={menuItemStyle("markAttendance")}
          >
            {isSidebarOpen && "Attendance"}
          </li>
          <li
            onClick={() => handlePageChange("monthlyAttendance")}
            style={menuItemStyle("monthlyAttendance")}
          >
            {isSidebarOpen && "Monthly Attendance"}
          </li>
          <li
            onClick={() => handlePageChange("viewLeave")}
            style={menuItemStyle("viewLeave")}
          >
            {isSidebarOpen && "Leave"}
          </li>
          <li
            onClick={() => handlePageChange("performancereview")}
            style={menuItemStyle("performancereview")}
          >
            {isSidebarOpen && "PerformanceReview"}
          </li>
          <li
            onClick={() => handlePageChange("performancereport")}
            style={menuItemStyle("performancereport")}
          >
            {isSidebarOpen && "PerformanceReport"}
          </li>
          <ul onClick={handleEmployeePayroll} 
        style={{
          ...menuItemStyle("EmployeePayroll"),
          flexDirection: showEmployeePayroll && isSidebarOpen ? "column" : "row",
          margin: 0, // Remove any margin
        }}
      >
      <span>
        {isSidebarOpen && 'Payroll'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showEmployeePayroll ? null : <span>&#9660;</span>}
      </span>
      {showEmployeePayroll && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px',marginLeft: "5px", }}>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("employeepayslip"); }}
          style={{ ...menuItemStyle("employeepayslip"), color: activePage === "employeepayslip" ? "#182566" : "black", backgroundColor: activePage === "employeepayslip" ? "white" : "transparent" }}
        >
         Payslip
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("expensestable"); }}
          style={{ ...menuItemStyle("expensestable"), color: activePage === "expensestable" ? "#182566" : "black", backgroundColor: activePage === "expensestable" ? "white" : "transparent" }}
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
          onClick={(e) => { e.stopPropagation(); handlePageChange("finalstatus"); }}
          style={{ ...menuItemStyle("finalstatus"), color: activePage === "finalstatus" ? "#182566" : "black", backgroundColor: activePage === "finalstatus" ? "white" : "transparent" }}
        >
         FinalSettlement
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("advancesalarystatus"); }}
          style={{ ...menuItemStyle("advancesalarystatus"), color: activePage === "advancesalarystatus" ? "#182566" : "black", backgroundColor: activePage === "advancesalarystatus" ? "white" : "transparent" }}
        >
         Advance Salary
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("payout"); }}
          style={{ ...menuItemStyle("payout"), color: activePage === "payout" ? "#182566" : "black", backgroundColor: activePage === "payout" ? "white" : "transparent" }}
        >
         Payout
        </li>
          </div>
    </div>
  )}
          </ul>
          <li
            onClick={() => handlePageChange("vacant")}
            style={menuItemStyle("vacant")}
          >
            {isSidebarOpen && "VacantPositions"}
          </li>
          <ul onClick={handleTrainingandDevelopment}
           style={{
            ...menuItemStyle("T&D"),
            flexDirection: showTrainingAndDevelopment && isSidebarOpen ? "column" : "row",
            margin: 0, 
          }}
        >
          <span>
        {isSidebarOpen && 'T&D'}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {showTrainingAndDevelopment ? <span>&#9660;</span> : <span>&#9660;</span>}
        </span>
      {showTrainingAndDevelopment && isSidebarOpen && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop:'10px',marginLeft: "5px", }}>
          <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("traininglist"); }}
          style={{ ...menuItemStyle("traininglist"), color: activePage === "traininglist" ? "#182566" : "black", backgroundColor: activePage === "traininglist" ? "white" : "transparent" }}
        >
          My Trainings
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("exploretraining"); }}
          style={{ ...menuItemStyle("exploretraining"), color: activePage === "exploretraining" ? "#182566" : "black", backgroundColor: activePage === "exploretraining" ? "white" : "transparent" }}
        >
           Explore
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("evaluationreport"); }}
          style={{ ...menuItemStyle("evaluationreport"), color: activePage === "evaluationreport" ? "#182566" : "black", backgroundColor: activePage === "evaluationreport" ? "white" : "transparent" }}
        >
          Evaluation
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("reviewontraining"); }}
          style={{ ...menuItemStyle("reviewontraining"), color: activePage === "reviewontraining" ? "#182566" : "black", backgroundColor: activePage === "reviewontraining" ? "white" : "transparent" }}
        >
          Review
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("reviewreport"); }}
          style={{ ...menuItemStyle("reviewreport"), color: activePage === "reviewreport" ? "#182566" : "black", backgroundColor: activePage === "reviewreport" ? "white" : "transparent" }}
        >
         ReviewReport
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
          onClick={(e) => { e.stopPropagation(); handlePageChange("employeecommunication"); }}
          style={{ ...menuItemStyle("employeecommunication"), color: activePage === "employeecommunication" ? "#182566" : "black", backgroundColor: activePage === "employeecommunication" ? "white" : "transparent" }}
        >
         Communication
        </li>
        <li
          onClick={(e) => { e.stopPropagation(); handlePageChange("exitprocedure"); }}
          style={{ ...menuItemStyle("exitprocedure"), color: activePage === "exitprocedure" ? "#182566" : "black", backgroundColor: activePage === "exitprocedure" ? "white" : "transparent" }}
        >
         Exit Form
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
    
  }}
>
          
          {activePage === "overalldashboard" && <HRTotalNumbers
          // onInternalSelectsclick={handleInternalApplicantsClick}
          // onPositionsclick={handlePositionsClick}
          // onOnBoardingclick={handleOnboardingsClick}
          />}
          {activePage === 'positions' && <EmployeePositions />}
          {activePage === 'InternalApplies' && <InternalApplicants />}
          {activePage === 'TalentSourcing' && <Sourcing />}
          {activePage === 'SourcedProfiles' && <SourcedProfiles />}
          {activePage === 'interview' && <Interviews />}
          {activePage === 'SelectedProfiles' && <SelectedCandidates />}
          {activePage === 'Negotiation' && <ViewNegotiations />}
          {activePage === 'OnBoarding' && <OnBoarding />}

          {activePage === 'profile' && <EmployeeProfile />}
          {activePage === 'markAttendance' && <MarkAttendance />}
          {activePage === 'monthlyAttendance' && <EmployeeMonthlyAttendance />}
          {activePage === 'viewLeave' && <ViewLeave />}
          {activePage === 'performancereview' && <PerformanceReview />}
          {activePage === 'performancereport' && <EmployeeReport />}
          {activePage === 'employeepayslip' && <EmployeePayslip />}  {/* Add this line */}
          {activePage === 'expenses' && <Expenses />}
          {activePage === 'loan' && <Loan />} 
          {activePage === 'expensestable' && <ExpensesTable />}
          {activePage === 'salaryadvance' && <SalaryAdvance />}
          {activePage === 'loanstatus' && <LoanStatus />}
          {activePage === 'advancesalarystatus' && <AdvanceSalaryStatus />} 
          {activePage === 'finalsettlement' && <FinalSettlement />}
          {activePage === 'finalstatus' && <FinalSettlementStatus />}{/* Add this line */}
          {activePage === 'payout' && <Payout />}{/* Add this line */}
          {activePage === 'vacant' && <VacantPositions />}
          {activePage === 'traininglist' && <EmpTrainingList  loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData} />}
          {activePage === 'exploretraining' && <EmployeeTrainingTypes  loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData} />}
          {activePage === 'evaluationreport' && <EvaluationReport  loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData}/>}
          {activePage === 'reviewontraining' && <ReviewOnTrainer   loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData}/>}
          {activePage === 'reviewreport' && <ReviewReportOnTrainer  loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData} />}
          {activePage === 'employeecommunication' && <EmployeeCommunication loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData} />}
          {activePage === 'exitprocedure' && <ExitProcedure  loggedInEmployeeName={loggedInEmployeeName} loggedInEmployeeId={loggedInEmployeeId} employeeData={employeeData} />}
         
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
