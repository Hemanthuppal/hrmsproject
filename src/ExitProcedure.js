import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc,addDoc } from 'firebase/firestore';
import { db } from './App'; // Import your Firebase configuration

function ExitProcedure({ loggedInEmployeeId }) {
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [department, setDepartment] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [assignedManagerUid, setAssignedManagerUid] = useState('');
  const [reasonForDeparture, setReasonForDeparture] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState('');
  const [finalSettlementDetails, setFinalSettlementDetails] = useState('');
  const [exitChecklist, setExitChecklist] = useState([]);
  const [experienceCertificate, setExperienceCertificate] = useState('');
  const [exitProcessStatus, setExitProcessStatus] = useState('');
  const [employeeDetails, setEmployeeDetails] = useState({});
  

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const userRef = doc(db, 'users', loggedInEmployeeId);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          const data = userDoc.data();
          setEmployeeDetails(data);
          setEmployeeId(data.employeeId);
          setName(data.fullName);
          setDepartment(data.department);
          setAssignedManagerUid(data.assignedManagerUid); // Corrected here
          // Set other form fields accordingly
          console.log('Assigned Manager UID:', data.assignedManagerUid); // Log assignedManagerUid
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };
  
    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);
  

  // const handleExitChecklistChange = (option, isChecked) => {
  //   if (isChecked) {
  //     setExitChecklist([...exitChecklist, option]);
  //   } else {
  //     setExitChecklist(exitChecklist.filter((item) => item !== option));
  //   }
  // };

  const [isFormComplete, setIsFormComplete] = useState(false);

  useEffect(() => {
    // Check if all required fields are filled to enable the submit button
    const checkFormCompletion = () => {
      setIsFormComplete(
        name !== '' &&
        employeeId !== '' &&
        department !== '' &&
        departureDate !== '' &&
        reasonForDeparture !== '' &&
        noticePeriod !== '' &&
        finalSettlementDetails !== '' &&
        exitChecklist.length > 0 &&
        experienceCertificate !== ''
      );
    };

    checkFormCompletion();
  }, [
    name,
    employeeId,
    department,
    departureDate,
    reasonForDeparture,
    noticePeriod,
    finalSettlementDetails,
    exitChecklist,
    experienceCertificate,
  ]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const exitProcedureCollection = collection(db, 'exitProcedure'); // Assuming 'exitProcedure' is your collection name

      const exitProcedureData = {
        employeeId,
        name,
        department,
        departureDate,
        reasonForDeparture,
        noticePeriod,
        finalSettlementDetails,
        exitChecklist,
        experienceCertificate,
        assignedManagerUid: employeeDetails.assignedManagerUid, 
      };

      await addDoc(exitProcedureCollection, exitProcedureData);

      // Optionally, you can reset the form fields or perform any other actions after successful submission
      setEmployeeId('');
      setName('');
      setHireDate('');
      setDepartment('');
      setDepartureDate('');
      setReasonForDeparture('');
      setNoticePeriod('');
      setClearanceStatus('');
      setFinalSettlementDetails('');
      setExitChecklist('');
      setExperienceCertificate('');
      setExitProcessStatus('');

      console.log('Form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  

  return (
    <div className='container'>
      <h2>Exit Form</h2>
      <form onSubmit={handleSubmit}>
      <div className="row">
          <div className="col-md-6">
            <label>Name:</label>
            <input type="text" className="form-control" value={name} readOnly />
          </div>
          <div className="col-md-6">
            <label>Employee ID:</label>
            <input type="text" className="form-control" value={employeeId} readOnly />
          </div>
        </div>
        {/* <div className="col-md-6">
            <label>Hire Date:</label>
            <input type="text" className="form-control" value={hireDate} readOnly />
          </div> */}
        <div className="row">
        
        <div className="col-md-6">
    <label>Department:</label>
    <input type="text" className="form-control" value={department} readOnly />
  </div>
          <div className="col-md-6">
            <label>Departure Date: </label>
            <input type="date" className="form-control" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
          </div>
        </div>
        

        <div className="row">
        <div className="col-md-12">
  <label>Reason for Departure:</label>
  <textarea
    className="form-control"
    value={reasonForDeparture}
    onChange={(e) => setReasonForDeparture(e.target.value)}
  ></textarea>
</div>

          
        </div>

        <div className="row">
        <div className="col-md-6">
            <label>Notice Period: </label>
            <input type="text" className="form-control" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} />
          </div>
          <div className="col-md-6">
            <label>Final Settlement Details: </label>
            <input type="text" className="form-control" value={finalSettlementDetails} onChange={(e) => setFinalSettlementDetails(e.target.value)} />
          </div>
        </div>

        <div className="row">
        {/* <div className="col-md-6">
  <label>Exit Checklist:</label>
  <div style={{ marginTop: '10px' }}>
    <label style={{ marginRight: '10px' }}>
      <input
        type="radio"
        checked={exitChecklist.includes("Yes")}
        onChange={(e) => handleExitChecklistChange("Yes", e.target.checked)}
      />
      YES
    </label>
    <label>
      <input
        type="radio"
        checked={exitChecklist.includes("No")}
        onChange={(e) => handleExitChecklistChange("No", e.target.checked)}
      />
      NO
    </label>
    
  </div>
</div> */}

<div className="col-md-6">
  <label>Assets Submission:</label>
  <div style={{ marginTop: '10px' }}>
    <label>
      <input
        type="radio"
        value="Yes"
        checked={exitChecklist === "Yes"}
        onChange={(e) => setExitChecklist(e.target.value)}
      />
      Yes
    </label>
    <label style={{ marginLeft: '10px' }}>
      <input
        type="radio"
        value="No"
        checked={exitChecklist === "No"}
        onChange={(e) => setExitChecklist(e.target.value)}
      />
      No
    </label>
  </div>
</div>


          <div className="col-md-6">
  <label>Experience Certificate:</label>
  <div style={{ marginTop: '10px' }}>
    <label>
      <input
        type="radio"
        value="Required"
        checked={experienceCertificate === "Required"}
        onChange={(e) => setExperienceCertificate(e.target.value)}
      />
      Required
    </label>
    <label style={{ marginLeft: '10px' }}>
      <input
        type="radio"
        value="Not Required"
        checked={experienceCertificate === "Not Required"}
        onChange={(e) => setExperienceCertificate(e.target.value)}
      />
      Not Required
    </label>
  </div>
</div>


        </div>
        <div className="row mt-3">
          <div className="col-md-12 text-center">
          <button type="submit" className="btn btn-primary" disabled={!isFormComplete}>
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ExitProcedure;