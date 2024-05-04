import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  addDoc,
  doc,
  setDoc,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { auth } from "../App";

function PerformanceReview() {
  const location = useLocation();
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  
  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, "users"),
      where("assignedManagerUid", "==", loggedInEmployeeId)
    );

    getDocs(q).then((querySnapshot) => {
      const fetchedEmployees = [];
      querySnapshot.forEach((doc) => {
        fetchedEmployees.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(fetchedEmployees);
    });
  }, [loggedInEmployeeId]); // Dependency array ensures useEffect runs when loggedInManagerId changes

  useEffect(() => {
    const db = getFirestore();
    const metricsQuery = query(
      collection(db, "performancemetrics"),
      orderBy("timestamp", "asc")
    );

    getDocs(metricsQuery).then((querySnapshot) => {
      const fetchedMetrics = [];
      querySnapshot.forEach((doc) => {
        fetchedMetrics.push({ id: doc.id, ...doc.data() });
      });
      setPerformanceMetrics(fetchedMetrics);
    });
  }, [location.state]);

  const handleEmployeeChange = (selectedEmployeeId) => {
    const selectedEmployee = employees.find(
      (employee) => employee.employeeId === selectedEmployeeId
    );
    if (selectedEmployee) {
      setRole(selectedEmployee.role);
      setFullName(selectedEmployee.fullName);
    }
  };

  const getSalesExecutiveUid = async (employeeId) => {
    const db = getFirestore();
    const q = query(
      collection(db, "users"),
      where("employeeId", "==", employeeId)
    );
    const querySnapshot = await getDocs(q);
    let uid = null;
    querySnapshot.forEach((doc) => {
      // Assuming employeeId is unique, so taking the first match
      uid = doc.id;
    });
    return uid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const selectedSalesExecutiveId = await getSalesExecutiveUid(employeeId);
      if (!selectedSalesExecutiveId) {
        console.error("Selected sales executive UID not found");
        return;
      }

      const submittedData = {
        employeeId,
        role,
        fullName,
        date,
        // performanceMetrics,
        totalPoints: calculateTotalPoints(),
        averagePoints: calculateAveragePoints(),
        remarks: getRemarks(),
      };

      const db = getFirestore();
      const newDocRef = doc(collection(db, "metrics"));

      // Store in metrics-loggedInManagerUid collection
      await setDoc(
        doc(db, `metrics-${loggedInEmployeeId}`, newDocRef.id),
        submittedData
      );

      // Store in metrics-selectedSalesExecutiveUid collection
      await setDoc(
        doc(db, `metrics-${selectedSalesExecutiveId}`, newDocRef.id),
        submittedData
      );
      alert("Data stored successfully");

      setDate("");
      setEmployeeId("");
      setRole("");
      setFullName("");
      console.log(
        "Data stored successfully in both collections with the same document ID"
      );
    } catch (error) {
      console.error("Error storing data: ", error);
    }
  };

  const handlePointsChange = (index, value) => {
    const updatedMetrics = [...performanceMetrics];
    updatedMetrics[index].pointsScored = value;
    setPerformanceMetrics(updatedMetrics);
  };

  const calculateTotalPoints = () => {
    const totalPoints = performanceMetrics.reduce(
      (sum, metric) => sum + parseInt(metric.pointsScored || 0, 10),
      0
    );
    return totalPoints;
  };

  const calculateAveragePoints = () => {
    const totalPoints = calculateTotalPoints();
    const averagePoints = totalPoints / performanceMetrics.length || 0;
    return averagePoints.toFixed(2);
  };

  const getRemarks = () => {
    const averagePoints = parseFloat(calculateAveragePoints());

    if (averagePoints < 2) {
      return "Poor";
    } else if (averagePoints >= 2 && averagePoints <= 3) {
      return "Can Improve";
    } else if (averagePoints >= 3 && averagePoints <= 4) {
      return "Good";
    } else if (averagePoints > 4 && averagePoints <= 5) {
      return "Excellent";
    } else {
      return "No Remarks";
    }
  };

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
              {employees.map((employee) => (
                <option key={employee.id} value={employee.employeeId}>
                  {employee.employeeId}
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
      </form>
      <div className="mt-3">
        <table className="styled-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Key Result Area(KRA)</th>
              <th>Key Performance Indicator(KPI)</th>
              <th>Points Scored</th>
            </tr>
          </thead>
          <tbody>
            {performanceMetrics.map((metric, index) => (
              <tr key={metric.id}>
                <td>{index + 1}</td>
                <td>{metric.kra}</td>
                <td>{metric.kpi}</td>

                <td>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={metric.pointsScored}
                    onChange={(e) => handlePointsChange(index, e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                Total Points:
              </td>
              <td>{calculateTotalPoints()}</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ textAlign: "right" }}>
                Average Points:
              </td>
              <td>{calculateAveragePoints()}</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Remarks: {getRemarks()}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="text-center mt-2">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default PerformanceReview;
