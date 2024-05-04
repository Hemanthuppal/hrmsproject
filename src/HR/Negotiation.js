import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { db } from '../App';
import { addDoc, collection,getDocs, doc, getDoc } from 'firebase/firestore';


function Negotiation() {
    const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    positionBudget: '',
    offer: '',
    readyToAccept: ' ',
    LWD: ' ',
    DOJ: ' ',
  });

  const [positionNames, setPositionNames] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [assignedManagerUid, setAssignedManagerUid] = useState('');
  const [submitting, setSubmitting] = useState(false);



  const fetchMPRData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "MPR"));
        const positions = querySnapshot.docs.map(doc => ({
          name: doc.data().positionName,
          budget: doc.data().budget // Assuming 'budget' is the field name
        }));
    
      // console.log("Fetched positions:", positions); // Debug log
      setPositionNames(positions);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      // Optionally, update the state to indicate an error to the user
    }
  };

  const fetchSelectedCandidates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, `interviews-${loggedInEmployeeId}`));
      const candidates = querySnapshot.docs
        .map(doc => doc.data())
        .filter(candidate => candidate.r2Status === "Selected");
      setSelectedCandidates(candidates);
    } catch (error) {
      console.error("Error fetching selected candidates:", error);
    }
  };

  const fetchAssignedManagerUid = async () => {
    try {
      const docRef = doc(db, "users", loggedInEmployeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAssignedManagerUid(docSnap.data().assignedManagerUid);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching assigned manager UID:", error);
    }
  };

  useEffect(() => {
    fetchMPRData();
    fetchSelectedCandidates(); 
    fetchAssignedManagerUid();
  }, [loggedInEmployeeId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "jobTitle") {
      const selectedPosition = positionNames.find(position => position.name === value);
      const positionBudget = selectedPosition ? selectedPosition.budget : '';
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        positionBudget: positionBudget // Update salary offer here
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('Form Data:', formData);
  
    try {
      // Add formData to Firestore collection for logged-in employee
      await addDoc(collection(db, `negotiated-${loggedInEmployeeId}`), formData);
      // Also add formData to Firestore collection for the assigned manager
      if (assignedManagerUid) {
        await addDoc(collection(db, `negotiated-${assignedManagerUid}`), formData);
      }
      console.log("Data submitted successfully");
      alert("Data submitted successfully");
    } catch (error) {
      console.error("Error adding document: ", error);
    }finally {
      setSubmitting(false); // Reset submitting state whether the submission is successful or fails
  }
  };

  return (
    <form onSubmit={handleSubmit}>
        <div className='row'>
        <div className="col-6 form-group">
        <label>Candidate's Name:</label>
        <select
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-control"
        >
          <option value="">Select Candidate</option>
          {selectedCandidates.map((candidate, index) => (
            <option key={index} value={candidate.name}>{candidate.name}</option>
          ))}
        </select>
      </div>
      <div className="col-6 form-group">
                <label>Job Title/Position:</label>
                <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="form-control"
                >
                    <option value="">Select Position</option>
                    {positionNames.map((position, index) => (
                       <option key={index} value={position.name}>{position.name}</option>
                    ))}
                </select>
            </div>

      </div>
<div className='row mt-3'>
<div className="col-6 form-group">
  <label>Budget:</label>
  <input
    type="text"
    name="positionBudget"
    value={formData.positionBudget}
    onChange={handleChange}
    className="form-control"
    readOnly // Make this field read-only
  />
</div>


      <div className="col-6 form-group">
        <label>CTC Offered to Candidate:</label>
        <input
          type="text"
          name="offer"
          value={formData.offer}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      </div>
      <div className='row mt-3'>
      <div className="form-group col-6 ">
        <label>Ready to Accept the Offer:</label>
        <select
          name="readyToAccept"
          value={formData.readyToAccept}
          onChange={handleChange}
          className="form-control"
        >
           <option value="">Select</option> 
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div className="col-6 form-group">
        <label>Last Working Day(LWD):</label>
        <input
          type="date"
          name="LWD"
          value={formData.LWD}
          onChange={handleChange}
          className="form-control"
        />
      </div>

      <div className="col-6 form-group mt-3">
        <label>Date of Joining(DOJ):</label>
        <input
          type="date"
          name="DOJ"
          value={formData.DOJ}
          onChange={handleChange}
          className="form-control"
        />
      </div>


      </div>
      <div className='mt-3 text-center'>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </div>
    </form>
  );
}

export default Negotiation;
