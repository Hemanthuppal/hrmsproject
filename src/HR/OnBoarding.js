import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db, storage } from "../App";
import { collection, getDocs } from "firebase/firestore";


function OnBoarding() {
  const location = useLocation();
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [negotiations, setNegotiations] = useState([]);
  

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, `negotiated-${loggedInEmployeeId}`)
        );
        const fetchedNegotiations = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((negotiation) => negotiation.readyToAccept === "yes"); // Add this line to filter

        setNegotiations(fetchedNegotiations);
      } catch (error) {
        console.error("Error fetching negotiations:", error);
      }
    };

    fetchNegotiations();
  }, [loggedInEmployeeId]);

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };


  return (
    <div>
      <h2>Onboardings</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Job Title</th>
            <th>DOJ</th>
            
           
          </tr>
        </thead>
        <tbody>
          {negotiations.map((negotiation, index) => (
            <tr key={negotiation.id}>
              <td>{index + 1}</td>
              <td>{negotiation.name}</td>
              <td>{negotiation.jobTitle}</td>
              <td>{formatDate(negotiation.DOJ)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OnBoarding;
