// OverallDashboard.js
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../App";

function OverallDashboard({ setActivePage }) {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [trainingBudgetList, setTrainingBudgetList] = useState([]);

  const [employeeCount, setEmployeeCount] = useState(0);

  const fetchEmployeeCount = async () => {
    try {
      // Create a query to get documents where the role is 'Employee'
      const employeeQuery = query(
        collection(db, "users"),
        where("role", "==", "Employee")
      );
      const employeeSnapshot = await getDocs(employeeQuery);

      // Set the employee count based on the number of documents in the snapshot
      setEmployeeCount(employeeSnapshot.size);
    } catch (error) {
      console.error("Error fetching employee count: ", error);
    }
  };

  useEffect(() => {
    fetchEmployeeCount();
  }, []);

  const fetchTrainingTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "trainingtype"));
      const typesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainingTypes(typesData);
    } catch (error) {
      console.error("Error fetching training types: ", error);
    }
  };

  useEffect(() => {
    fetchTrainingTypes();
  }, []);

  const fetchTrainingBudget = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "training_budget"));
      const budgetData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrainingBudgetList(budgetData);

      // Calculate total budget amount
      const calculatedTotalBudget = budgetData.reduce(
        (total, training) => total + training.numEmployees * training.budget,
        0
      );
      setTotalBudget(calculatedTotalBudget); // Update the state with the calculated value
    } catch (error) {
      console.error("Error fetching training budget: ", error);
    }
  };

  useEffect(() => {
    fetchTrainingBudget();
  }, []);

  return (
    <div>
      <div className="container">
        <div className="row">
          <div
            className="col-md-3"
            onClick={() => setActivePage("addtraining")}
          >
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "lightgreen",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Trainings
              </h4>
              <span
                style={{ fontSize: "25px", fontWeight: "bold", color: "black" }}
              >
                {trainingTypes.length}
              </span>
            </div>
          </div>

          <div
            className="col-md-3"
            onClick={() => setActivePage("trainingbudget")}
          >
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "lightpink",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Training Budget
              </h4>
              <span
                style={{ fontSize: "25px", fontWeight: "bold", color: "black" }}
              >
                ${totalBudget}
              </span>
            </div>
          </div>
          <div className="col-md-3" onClick={() => setActivePage("employees")}>
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "lightblue",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Employee Count
              </h4>
              <span
                style={{ fontSize: "25px", fontWeight: "bold", color: "black" }}
              >
                {employeeCount}
              </span>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "#BB8FCE",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Loans
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setActivePage("managerloan")} // Assuming 'managerloan' is the manager's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Manager
                </button>
                <button
                  onClick={() => setActivePage("employeeloan")} // Assuming 'employeeloan' is the employee's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Employee
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "#F5CBA7 ",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Advance Salary
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setActivePage("managersalaryadvance")} // Assuming 'managerloan' is the manager's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Manager
                </button>
                <button
                  onClick={() => setActivePage("employeeadvance")} // Assuming 'employeeloan' is the employee's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Employee
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "#A3E4D7 ",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Daily Attendance
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setActivePage("managerdailyattendance")} // Assuming 'managerloan' is the manager's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Manager
                </button>
                <button
                  onClick={() => setActivePage("employeedailyattendance")} // Assuming 'employeeloan' is the employee's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Employee
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="box"
              style={{
                border: "1px solid #ddd",
                padding: "30px",
                marginBottom: "20px",
                cursor: "pointer",
                textAlign: "center",
                backgroundColor: "#D7DBDD",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Leave Status
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setActivePage("managerleaveapplication")} // Assuming 'managerloan' is the manager's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Manager
                </button>
                <button
                  onClick={() => setActivePage("employeeleaveapplication")} // Assuming 'employeeloan' is the employee's page
                  style={{
                    fontSize: "15px",
                    fontWeight: "bold",
                    color: "black",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                >
                  Employee
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverallDashboard;
