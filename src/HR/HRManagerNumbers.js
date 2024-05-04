import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../App";


const HRTotalNumbers = ({onInternalSelectsclick, onPositionsclick, onOnBoardingclick }) => {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [positionsCount, setPositionsCount] = useState(0);
  const [selectedApplicantsCount, setSelectedApplicantsCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [employees, setEmployees] = useState([]); 

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const q = query(
            collection(db, "MPR"), 
            where("action", "==", "Approved")
          );
        const querySnapshot = await getDocs(q);
        setPositionsCount(querySnapshot.docs.length);
      } catch (error) {
        console.error("Error fetching positions: ", error);
      }
    };

    const fetchSelectedApplicants = async () => {
      try {
        const q = query(
          collection(db, "Applicants"),
          where("r2Status", "==", "Selected")
        );
        const querySnapshot = await getDocs(q);
        setSelectedApplicantsCount(querySnapshot.docs.length);
      } catch (error) {
        console.error("Error fetching selected applicants: ", error);
      }
    };

    const fetchNegotiations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, `negotiated-${loggedInEmployeeId}`)
        );
        const count = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((negotiation) => negotiation.readyToAccept === "yes").length;

        setNegotiationCount(count);
      } catch (error) {
        console.error("Error fetching negotiations:", error);
      }
    };
    const fetchEmployees = async () => {
        try {
          const q = query(
            collection(db, "users"),
            where("assignedManagerUid", "==", loggedInEmployeeId)
          );
          const querySnapshot = await getDocs(q);
          const employeeData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id // Optionally store document ID if needed
          }));
          setEmployees(employeeData); // Set employee data
          const employeeCount = querySnapshot.size;
          setEmployeeCount(employeeCount);
          console.log("employeeData=",employeeData)
        } catch (error) {
          console.error("Error fetching employees:", error);
        }
      };
      
    fetchPositions();
    fetchSelectedApplicants();
    fetchNegotiations();
    fetchEmployees();
  }, [loggedInEmployeeId]);

  const cardStyle = {
    display: "inline-block",
    padding: "40px",
    margin: "10px",
    borderRadius: "10px",
    color: "white",
    fontSize: "1.5em",
    textAlign: "center",
    minWidth: "275px", // Adjust width as needed
  };

  const redStyle = { ...cardStyle, backgroundColor: "#182566" };
  const blueStyle = { ...cardStyle, backgroundColor: "#182566" };
  const purpleStyle = { ...cardStyle, backgroundColor: "#182566" };
  const greenStyle = { ...cardStyle, backgroundColor: "#182566" };
  return (
    <div>
      <div style={redStyle}  onClick={onPositionsclick}>
        <div>Positions <br/> {positionsCount}
        
        </div>
      </div>
      <div style={blueStyle} onClick={onInternalSelectsclick}>
        <div>Internal Selects<br/>  {selectedApplicantsCount}</div>
      </div>
      <div style={purpleStyle}  onClick={onOnBoardingclick}>
        <div>Onboardings<br/> {negotiationCount}</div>
      </div>
      <div style={greenStyle}>
        <div>My Team<br/> {employeeCount}</div> 
      </div>
      <div>
        <h3>Employee Details</h3>
        <table className="styled-table">
          <thead>
            <tr>
                <th>S.No</th>
              <th>Employee ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th>Mobile</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index+1}</td>
                <td>{employee.employeeId}</td>
                <td>{employee.fullName}</td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.role}</td>
                <td>{employee.mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HRTotalNumbers;
