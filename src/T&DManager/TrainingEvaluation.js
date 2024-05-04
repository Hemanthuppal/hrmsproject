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
import { db, auth } from "../App";

function PerformanceReview({ loggedInEmployeeName }) {
  const location = useLocation();
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [employees, setEmployees] = useState([]);
  const [trainingEvaluation, setTrainingEvaluation] = useState([]);
  const [trainingType, setTrainingType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [trainer, setTrainer] = useState(""); 

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, "users"),
      where("role", "==", 'Employee')
    );
  
    getDocs(q).then((querySnapshot) => {
      const fetchedEmployees = [];
      querySnapshot.forEach((doc) => {
        const employeeData = { id: doc.id, ...doc.data() };
        fetchedEmployees.push(employeeData);
      });
      setEmployees(fetchedEmployees);
  
      // Log assignedManager for each employee
      fetchedEmployees.forEach((employee) => {
        console.log(`Employee ID: ${employee.id}, Assigned Manager: ${employee.assignedManager}`);
      });
    });
  }, [loggedInEmployeeId]);
  

  useEffect(() => {
    const db = getFirestore();
    const evaluationQuery = query(
      collection(db, "trainingevaluation"),
      orderBy("timestamp", "asc")
    );

    getDocs(evaluationQuery).then((querySnapshot) => {
      const fetchedEvaluation = [];
      querySnapshot.forEach((doc) => {
        fetchedEvaluation.push({ id: doc.id, ...doc.data() });
      });
      setTrainingEvaluation(fetchedEvaluation);
    });
  }, [location.state]);

 

  const [trainingList, setTrainingList] = useState([]);

  const fetchTrainingList = async (selectedEmployeeId) => {
    try {
      const trainingListRef = collection(db, 'traininglist');
      const trainingListQuery = query(trainingListRef, orderBy('startDate', 'asc'));
      const querySnapshot = await getDocs(trainingListQuery);

      const listData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(training => training.employee === selectedEmployeeId);

      setTrainingList(listData);
    } catch (error) {
      console.error('Error fetching training list: ', error);
    }
  };

  useEffect(() => {
    fetchTrainingList(employeeId);
  }, [employeeId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
  
    try {
      const selectedEmployee = employees.find((employee) => employee.fullName === fullName);
  
      if (!selectedEmployee) {
        console.error("Selected employee not found");
        return;
      }
  
      const submittedData = {
        employeeId,
        role,
        fullName,
        date,
        trainingType,
        trainer: loggedInEmployeeName, // Set trainer to loggedInEmployeeName
        assignedManager: selectedEmployee.assignedManager, // Set assignedManager to selected employee's assignedManager
        totalPoints: calculateTotalPoints(),
        averagePoints: calculateAveragePoints(),
        remarks: getRemarks(),
      };
  
      const db = getFirestore();
      const newDocRef = doc(collection(db, "evaluation"));
  
      // Store in evaluation-loggedInManagerUid collection
      await setDoc(doc(db, `TrainingEvaluationPoints`, newDocRef.id), submittedData);
  
      // ... (existing code)
  
      alert("Data stored successfully");
  
      // Clear form fields
      setDate("");
      setEmployeeId("");
      setRole("");
      setFullName("");
      setTrainingType("");
      setTrainer(""); // Clear trainer field
  
      // Clear points scored fields
      const clearedEvaluation = trainingEvaluation.map((evaluation) => ({
        ...evaluation,
        pointsScored: "",
      }));
      setTrainingEvaluation(clearedEvaluation);
    } catch (error) {
      console.error("Error storing data: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handlePointsChange = (index, value) => {
    const points = parseInt(value, 10);

    if (points >= 0 && points <= 5) {
      const updatedEvaluation = [...trainingEvaluation];
      updatedEvaluation[index].pointsScored = points;
      setTrainingEvaluation(updatedEvaluation);
    } else {
      alert("Points should be between 0 and 5");
    }
  };

  const calculateTotalPoints = () => {
    const totalPoints = trainingEvaluation.reduce(
      (sum, evaluation) => sum + parseInt(evaluation.pointsScored || 0, 10),
      0
    );
    return totalPoints;
  };

  const calculateAveragePoints = () => {
    const totalPoints = calculateTotalPoints();
    const averagePoints = totalPoints / trainingEvaluation.length || 0;
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
        <h3>Training Evaluation:</h3>
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
            <label htmlFor="fullName">Full Name:</label>
            <select
              className="form-select"
              id="fullName"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                const selectedEmployee = employees.find(employee => employee.fullName === e.target.value);
                if (selectedEmployee) {
                  setEmployeeId(selectedEmployee.fullName);
                  fetchTrainingList(selectedEmployee.fullName);
                }
              }}
            >
              <option value="">Select Full Name</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.fullName}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="trainingType">Training</label>
            <select
              className="form-select"
              id="trainingType"
              value={trainingType}
              onChange={(e) => setTrainingType(e.target.value)}
            >
              <option value="">Select a training type</option>
              {trainingList.map((training) => (
                <option key={training.id} value={training.trainingType}>
                  {training.trainingType}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
      <div className="mt-3">
        <table className="table table-bordered border-dark">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Parameter</th>
              <th>Description</th>
              <th>Points Scored</th>
            </tr>
          </thead>
          <tbody>
            {trainingEvaluation.map((evaluation, index) => (
              <tr key={evaluation.id}>
                <td>{index + 1}</td>
                <td>{evaluation.parameter}</td>
                <td>{evaluation.description}</td>

                <td>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={evaluation.pointsScored}
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
  type="button"
  className="btn btn-secondary ml-2"
  style={{ marginRight: '10px' }}
  onClick={() => {
    // Clear form fields
    setDate("");
    setEmployeeId("");
    setRole("");
    setFullName("");
    setTrainingType("");
  
    // Clear points scored fields
    const clearedEvaluation = trainingEvaluation.map(evaluation => ({ ...evaluation, pointsScored: "" }));
    setTrainingEvaluation(clearedEvaluation);
  }}
>
  CLEAR
</button>

  <button
    type="submit"
    className="btn btn-primary ml-2"  // Add margin-left here
    disabled={isSubmitting}
    onClick={handleSubmit}
  >
    {isSubmitting ? 'Submitting...' : 'SUBMIT'}
  </button>
</div>

      </div>
    </div>
  );
}

export default PerformanceReview;
