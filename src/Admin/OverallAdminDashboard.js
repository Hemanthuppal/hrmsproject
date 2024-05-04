// OverallDashboard.js
import React, { useState, useEffect } from "react";
import { collection, getDocs,query,where } from 'firebase/firestore';
import { db } from '../App';

function OverallDashboard({ setActivePage }) {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [trainingBudgetList, setTrainingBudgetList] = useState([]);

  const [employeeCount, setEmployeeCount] = useState(0);

  const fetchEmployeeCount = async () => {
    try {
      // Create a query to get documents where the role is 'Employee'
      const employeeQuery = query(collection(db, 'users'), where('role', '==', 'Employee'));
      const employeeSnapshot = await getDocs(employeeQuery);

      // Set the employee count based on the number of documents in the snapshot
      setEmployeeCount(employeeSnapshot.size);

    } catch (error) {
      console.error('Error fetching employee count: ', error);
    }
  };

  useEffect(() => {
    fetchEmployeeCount();
  }, []);

  const fetchTrainingTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'trainingtype'));
      const typesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainingTypes(typesData);
    } catch (error) {
      console.error('Error fetching training types: ', error);
    }
  };

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  const fetchTrainingBudget = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'training_budget'));
      const budgetData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainingBudgetList(budgetData);

      // Calculate total budget amount
      const calculatedTotalBudget = budgetData.reduce((total, training) => total + training.numEmployees * training.budget, 0);
      setTotalBudget(calculatedTotalBudget); // Update the state with the calculated value

    } catch (error) {
      console.error('Error fetching training budget: ', error);
    }
  };

  useEffect(() => {
    fetchTrainingBudget();
  }, []);

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-md-4" onClick={() => setActivePage('applicants')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#182566',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Talent Acquisition
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {/* ${totalBudget} */}
              </span>
            </div>
          </div>
          <div className="col-md-4" onClick={() => setActivePage('annualbudget')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#9f9f9f',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                HR Operation
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {/* ${totalBudget} */}
              </span>
            </div>
          </div>
          <div className="col-md-4" onClick={() => setActivePage('employeedailyattendance')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#182566',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Leave and Attendance
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {/* ${totalBudget} */}
              </span>
            </div>
          </div>
          <div className="col-md-4" onClick={() => setActivePage('employeeexpenses')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#9f9f9f',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Payroll
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {/* ${totalBudget} */}
              </span>
            </div>
          </div>
          <div className="col-md-4" onClick={() => setActivePage('overallTandD')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#182566',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Training & Development
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
              {/* {trainingTypes.length} */}
              </span>
            </div>
          </div>
          
          
          <div className="col-md-4" onClick={() => setActivePage('metricslist')}>
            <div className="box" style={{
              
              padding: '30px',
              marginBottom: '20px',
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: '#9f9f9f',
              borderRadius: '20px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease',
            }}>
              <h4 style={{ marginBottom: '10px', fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
                Performance Management
              </h4>
              <span style={{ fontSize: '25px', fontWeight: 'bold', color: 'white' }}>
                {/* ${totalBudget} */}
              </span>
            </div>
          </div>
          
          
          
          
        </div>
      </div>
    </div>
  );
}

export default OverallDashboard;
