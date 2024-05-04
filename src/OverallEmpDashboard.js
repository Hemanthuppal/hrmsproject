import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs,orderBy,getFirestore,limit } from 'firebase/firestore';
import { db } from './App';

function Dashboard({ setActivePage }) {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [pendingLeaveDetails, setPendingLeaveDetails] = useState([]);
  const [pendingTrainingDetails, setPendingTrainingDetails] = useState([]);
  const [pendingExpenseDetails, setPendingExpenseDetails] = useState([]);
  const [pendingLoanAdvanceDetails, setPendingLoanAdvanceDetails] = useState([]);
  const [pendingSalaryAdvanceDetails, setPendingSalaryAdvanceDetails] = useState([]);
  const [pendingMetricsDetails, setPendingMetricsDetails] = useState([]);

  useEffect(() => {
    const fetchPendingLeaveDetails = async () => {
      try {
        // Fetch pending leave applications details
        const leaveCollectionRef = collection(db, `leave_${loggedInEmployeeId}`);
        const leaveQuery = query(leaveCollectionRef, where("status", "==", "pending"));
        const leaveQuerySnapshot = await getDocs(leaveQuery);

        // Extract details of each pending leave application
        const pendingLeaveDetails = leaveQuerySnapshot.docs.map((doc) => {
          const leaveData = doc.data();
          return {
            id: doc.id,
            fromDate: leaveData.fromDate,
            toDate: leaveData.toDate,
            leaveType: leaveData.leaveType,
          };
        });

        setPendingLeaveDetails(pendingLeaveDetails); // Set the state with the details
      } catch (error) {
        console.error("Error fetching pending leave details: ", error);
      }
    };

    const fetchPendingTrainingDetails = async () => {
      try {
        // Fetch pending training details
        const trainingCollectionRef = collection(db, 'traininglist');
        const trainingQuery = query(trainingCollectionRef, where("assignedToUid", "==", loggedInEmployeeId));
        const trainingQuerySnapshot = await getDocs(trainingQuery);

        // Extract details of each pending training request
        const pendingTrainingDetails = trainingQuerySnapshot.docs.map((doc) => {
          const trainingData = doc.data();
          return {
            id: doc.id,
            // Include other fields you want to retrieve
            trainingName: trainingData.trainingName,
            startDate: trainingData.startDate,
            endDate: trainingData.endDate,
            // Add more fields as needed
          };
        });

        setPendingTrainingDetails(pendingTrainingDetails); 
      } catch (error) {
        console.error("Error fetching pending training details: ", error);
      }
    };

    const fetchPendingExpenseDetails = async () => {
        try {
          // Fetch pending expense details
          const expenseCollectionRef = collection(db, `expenses_${loggedInEmployeeId}`);
          const expenseQuery = query(expenseCollectionRef, where("status", "==", "pending"));
          const expenseQuerySnapshot = await getDocs(expenseQuery);
  
          // Extract details of each pending expense
          const pendingExpenseDetails = expenseQuerySnapshot.docs.map((doc) => {
            const expenseData = doc.data();
            return {
              id: doc.id,
              // Include other fields you want to retrieve
              expenseName: expenseData.expenseName,
              amount: expenseData.amount,
              // Add more fields as needed
            };
          });
  
          setPendingExpenseDetails(pendingExpenseDetails); 
        } catch (error) {
          console.error("Error fetching pending expense details: ", error);
        }
      };

      const fetchPendingLoanAdvanceDetails = async () => {
        try {
          // Fetch pending loan advance details
          const loanAdvanceCollectionRef = collection(db, `loan_advance_requests_${loggedInEmployeeId}`);
          const loanAdvanceQuery = query(loanAdvanceCollectionRef, where("status", "==", "pending"));
          const loanAdvanceQuerySnapshot = await getDocs(loanAdvanceQuery);
  
          // Extract details of each pending loan advance request
          const pendingLoanAdvanceDetails = loanAdvanceQuerySnapshot.docs.map((doc) => {
            const loanAdvanceData = doc.data();
            return {
              id: doc.id,
              // Include other fields you want to retrieve
              loanAmount: loanAdvanceData.loanAmount,
              // Add more fields as needed
            };
          });
  
          setPendingLoanAdvanceDetails(pendingLoanAdvanceDetails);
        } catch (error) {
          console.error("Error fetching pending loan advance details: ", error);
        }
      };
  
      const fetchPendingSalaryAdvanceDetails = async () => {
        try {
          // Fetch pending salary advance details
          const salaryAdvanceCollectionRef = collection(db, `salary_advance_requests_${loggedInEmployeeId}`);
          const salaryAdvanceQuery = query(salaryAdvanceCollectionRef, where("status", "==", "pending"));
          const salaryAdvanceQuerySnapshot = await getDocs(salaryAdvanceQuery);
  
          // Extract details of each pending salary advance request
          const pendingSalaryAdvanceDetails = salaryAdvanceQuerySnapshot.docs.map((doc) => {
            const salaryAdvanceData = doc.data();
            return {
              id: doc.id,
              // Include other fields you want to retrieve
              advanceAmount: salaryAdvanceData.advanceAmount,
              // Add more fields as needed
            };
          });
  
          setPendingSalaryAdvanceDetails(pendingSalaryAdvanceDetails);
        } catch (error) {
          console.error("Error fetching pending salary advance details: ", error);
        }
      };

      const fetchPendingMetricsDetails = async () => {
        try {
          // Fetch pending metrics details
          const db = getFirestore(); // Ensure you have access to the Firestore instance
          const metricsCollectionRef = collection(db, `metrics-${loggedInEmployeeId}`); 
          // Ensure to order the documents by the date field in descending order and limit to 1 to get the most recent
          const metricsQuery = query(metricsCollectionRef, orderBy("date", "asc"), limit(1));
          const metricsQuerySnapshot = await getDocs(metricsQuery);
      
          // Extract details of the most recent metrics record
          const recentMetricsDetails = metricsQuerySnapshot.docs.map((doc) => {
            const metricsData = doc.data();
            return {
              id: doc.id,
              metricName: metricsData.metricName, // Adjust according to your document structure
              remarks: metricsData.remarks,
              date: metricsData.date // Assuming you have a date field to order by
            };
          });
      
          // Set the state with the details
          setPendingMetricsDetails(recentMetricsDetails);
          console.log("Most recent remarks=", recentMetricsDetails);
        } catch (error) {
          console.error("Error fetching most recent remarks: ", error);
        }
      };
      
      
    fetchPendingExpenseDetails();
    fetchPendingLeaveDetails();
    fetchPendingTrainingDetails();
    fetchPendingLoanAdvanceDetails();
    fetchPendingSalaryAdvanceDetails();
    fetchPendingMetricsDetails();
  }, [loggedInEmployeeId]);

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
              onClick={() => setActivePage('viewLeave')}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
              Leaves
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {pendingLeaveDetails.length}
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
                backgroundColor: '#9f9f9f',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={() => setActivePage('expensestable')}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
              Expenses
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {pendingExpenseDetails.length}
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
              onClick={() => setActivePage('loanstatus')}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
             Loans
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {pendingLoanAdvanceDetails.length}
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
                backgroundColor: '#9f9f9f',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={() => setActivePage('advancesalarystatus')}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
              Salary Advances
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {pendingSalaryAdvanceDetails.length}
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
    onClick={() => setActivePage('performancereport')}
  >
    <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
      Performance Report
    </h4>
    <div>
      {pendingMetricsDetails.map((metric, index) => (
        <div key={index}>
          <span style={{ fontSize: '25px', fontWeight: 'bold',color: 'white' }}>
          {metric.remarks}
          </span>
        </div>
      ))}
    </div>
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
                backgroundColor: '#9f9f9f',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.3s ease',
              }}
              onClick={() => setActivePage('traininglist')}
            >
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
              My Trainings
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {pendingTrainingDetails.length}
              </span>
            </div>
          </div>
          
          
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


