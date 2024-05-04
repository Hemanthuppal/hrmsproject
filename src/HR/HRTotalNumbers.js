import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../App";


const HRTotalNumbers = ({ onPositionsClick,  onInternalSelectsClick,  onOnBoardingsClick }) => {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [positionsCount, setPositionsCount] = useState(0);
  const [selectedApplicantsCount, setSelectedApplicantsCount] = useState(0);
  const [negotiationCount, setNegotiationCount] = useState(0);

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

    fetchPositions();
    fetchSelectedApplicants();
    fetchNegotiations();
  }, [loggedInEmployeeId]);

  const cardStyle = {
    display: "inline-block",
    padding: "40px",
    margin: "10px",
    borderRadius: "10px",
    color: "white",
    fontSize: "1.5em",
    textAlign: "center",
    minWidth: "250px", // Adjust width as needed
  };

  const redStyle = { ...cardStyle, backgroundColor: "#f28b82" };
  const blueStyle = { ...cardStyle, backgroundColor: "#aecbfa" };
  const purpleStyle = { ...cardStyle, backgroundColor: "#d7aefb" };
  const greenStyle = { ...cardStyle, backgroundColor: "#ccff90" };
  return (
    <div>
      <div style={redStyle} onClick={onPositionsClick}>
       
        <div>Positions <br/> {positionsCount}
        
        </div>
       
      </div>
      <div style={blueStyle} onClick={onInternalSelectsClick} >
        <div>Internal Selects<br/>  {selectedApplicantsCount}</div>
      </div>
      <div style={purpleStyle} onClick={onOnBoardingsClick}>
        <div>Onboardings<br/> {negotiationCount}</div>
      </div>
    </div>
  );
};

export default HRTotalNumbers;
