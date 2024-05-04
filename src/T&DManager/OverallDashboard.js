import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../App';
import { useLocation, useNavigate } from "react-router-dom";

function OverallDashboard({ setActivePage }) {
  const location = useLocation();
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState("");
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [employeeCount, setEmployeeCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [trainingList, setTrainingList] = useState([]);
  const [trainingRequestsCount, setTrainingRequestsCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [salaryAdvanceCount, setSalaryAdvanceCount] = useState(0);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=", employeeData.fullName);
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  const fetchEmployeeCount = async () => {
    try {
      const employeeQuery = query(
        collection(db, 'users'),
        where('assignedManagerUid', '==', loggedInEmployeeId),
        where('role', '==', 'Employee')
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      setEmployeeCount(employeeSnapshot.size);
    } catch (error) {
      console.error('Error fetching employee count: ', error);
    }
  };

  const fetchPendingLeavesCount = async () => {
    try {
      const leavesQuery = query(
        collection(db, `leave_${loggedInEmployeeId}`),
        where('status', '==', 'pending')
      );
      const leavesSnapshot = await getDocs(leavesQuery);
  
      setLeaveCount(leavesSnapshot.size);
    } catch (error) {
      console.error('Error fetching pending leaves count: ', error);
    }
  };
  
  const fetchTrainingList = async () => {
    try {
      const trainingListQuery = query(
        collection(db, 'traininglist'),
        where('trainer', '==', loggedInEmployeeName)
        // Add any additional filters if needed
      );
      const trainingListSnapshot = await getDocs(trainingListQuery);

      // Extract the actual training documents
      const trainingListData = trainingListSnapshot.docs.map(doc => doc.data());

      // Set the trainingList state
      setTrainingList(trainingListData);
      console.log("trainingListData=",trainingListData)
    } catch (error) {
      console.error('Error fetching training list: ', error);
    }
  };
  
  const fetchTrainingRequestsCount = async () => {
    try {
      const trainingRequestsQuery = query(
        collection(db,`requests_${loggedInEmployeeId}`),
        where('status', '==', 'Requested')
        // Add any additional filters if needed
      );
      const trainingRequestsSnapshot = await getDocs(trainingRequestsQuery);
  
      // Set the count of training requests
      setTrainingRequestsCount(trainingRequestsSnapshot.size);
    } catch (error) {
      console.error('Error fetching training requests count: ', error);
    }
  };

  const fetchLoanCount = async () => {
    try {
      const loanQuery = query(
        collection(db, `managerloan_${loggedInEmployeeId}`),
        where('status', '==', 'pending')
      );
      const loanSnapshot = await getDocs(loanQuery);
  
      // Set the loan count state
      setLoanCount(loanSnapshot.size);
    } catch (error) {
      console.error('Error fetching loan count: ', error);
    }
  };
  
  const fetchSalaryAdvanceCount = async () => {
    try {
      const salaryAdvanceQuery = query(
        collection(db, `managersalaryadvance__${loggedInEmployeeId}`),
        where('status', '==', 'pending')
      );
      const salaryAdvanceSnapshot = await getDocs(salaryAdvanceQuery);
  
      // Set the salary advance count state
      setSalaryAdvanceCount(salaryAdvanceSnapshot.size);
    } catch (error) {
      console.error('Error fetching salary advance count: ', error);
    }
  };
  
  
  useEffect(() => {
    fetchEmployeeCount();
    fetchPendingLeavesCount();
    fetchTrainingList();
    fetchTrainingRequestsCount();
    fetchLoanCount();
    fetchSalaryAdvanceCount(); // Add this line
  }, [loggedInEmployeeId]);
  
  
  

  const handleLeavesClick = () => {
    setActivePage("leaveApplication");
  };

  const handleEmployeessClick = () => {
    setActivePage("employees");
  };

  const handleLTrainingsClick = () => {
    setActivePage("managertraininglist");
  };

  const handleLRequestsClick = () => {
    setActivePage("trainingrequest");
  };

  const handleLoansClick = () => {
    setActivePage("loanstatus");
  };

  const handleLSalaryAdvancesClick = () => {
    setActivePage("salaryadvancestatus");
  };

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: '#182566',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleEmployeessClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Employees
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {employeeCount}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleLeavesClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: '#182566' }}>
                EmployeeLeaves
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#182566' }}>
                {leaveCount}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: '#182566',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleLTrainingsClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Trainings
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {trainingList.length}
              </span>
            </div>
          </div>
          {/* <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleLRequestsClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: '#182566' }}>
              Requested Trainings
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#182566' }}>
              {trainingRequestsCount}
              </span>
            </div>
          </div> */}
          <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleLoansClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: '#182566' }}>
                Loans
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#182566' }}>
              {loanCount}
              </span>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="box"
              style={{
                
                padding: '30px',
                marginBottom: '20px',
                cursor: 'pointer',
                textAlign: 'center',
                backgroundColor: '#182566',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={handleLSalaryAdvancesClick}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Salary Advance
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {salaryAdvanceCount}
              </span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default OverallDashboard;