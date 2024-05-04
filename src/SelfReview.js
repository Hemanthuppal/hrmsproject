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
  getDoc,
  serverTimestamp ,
} from "firebase/firestore";
import { auth } from "./App";

function SelfReview() {
  const location = useLocation();
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [assignedManagerUid, setAssignedManagerUid] = useState("");

  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  useEffect(() => {
    const fetchLoggedInEmployeeInfo = async () => {
      const db = getFirestore();
      const docRef = doc(db, "users", loggedInEmployeeId); // Using loggedInEmployeeId as the document ID

      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const loggedInEmployeeInfo = docSnap.data();
            setEmployeeId(loggedInEmployeeInfo.employeeId); 
            setFullName(loggedInEmployeeInfo.fullName);
            setRole(loggedInEmployeeInfo.role);
            setAssignedManagerUid(loggedInEmployeeInfo.assignedManagerUid);  
          } else {
            console.log("No such document!");
          }
        })
        .catch((error) => {
          console.error("Error fetching document: ", error);
        });
    };

    fetchLoggedInEmployeeInfo();
  }, [loggedInEmployeeId]);

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



  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      const submittedData = {
        employeeId,
        role,
        fullName,
        uid: loggedInEmployeeId,
        date,
        performanceMetrics: performanceMetrics.map((metric) => ({
          kra: metric.kra,
          kpi: metric.kpi,
          pointsScored: metric.pointsScored,
        })),
        totalPoints: calculateTotalPoints(),
        averagePoints: calculateAveragePoints(),
        remarks: getRemarks(),
        createdAt: serverTimestamp(),
      };
  
      const db = getFirestore();
      const newDocRef = doc(collection(db, "metrics"));
  
      // Store only in metrics-loggedInManagerUid collection
      const loggedInManagerDocRef = doc(
        db,
        `metrics-${loggedInEmployeeId}`,
        newDocRef.id
      );
      await setDoc(loggedInManagerDocRef, { ...submittedData, docId: newDocRef.id });
  
      // Also store in metrics-assignedManagerUid collection if assignedManagerUid exists
      if (assignedManagerUid) {
        const assignedManagerDocRef = doc(
          db,
          `metrics-${assignedManagerUid}`,
          newDocRef.id
        );
        await setDoc(assignedManagerDocRef, { ...submittedData, docId: newDocRef.id });
      }
  
      // Alert with the document ID
      alert(`Data stored successfully!!!`);
  
      // Reset the form fields
      setDate("");
      setEmployeeId("");
      setRole("");
      setFullName("");
      console.log(
        "Data stored successfully in metrics collection for loggedInManagerUid"
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
            <input
              type="text"
              className="form-control"
              id="employeeId"
              value={employeeId}
              readOnly
            />
          </div>

          <div className="col-6">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              value={fullName}
              readOnly
            />
          </div>
          <div className="col-6">
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              className="form-control"
              id="role"
              value={role}
              readOnly
            />
          </div>
        </div>
      </form>
      <div className="mt-3">
        <table className="table table-bordered border-dark">
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

export default SelfReview;
