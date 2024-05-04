import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Modal, Button } from "react-bootstrap";
import { db } from "../App";

const EmployeePositions = () => {
  const location = useLocation();
  const loggedInEmployeeName = location.state?.loggedInEmployeeName;
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loggedInEmployeeData, setLoggedInEmployeeData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescModalShow, setJobDescModalShow] = useState(false);
  const [selectedJobDescription, setSelectedJobDescription] = useState('');

  useEffect(() => {
    console.log(
      "Logged-in Employee Name: ",
      loggedInEmployeeName,
      "Logged-in Employeeid: ",
      loggedInEmployeeId
    );
    const fetchData = async () => {
      try {
        const q = query(collection(db, "MPR"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, [loggedInEmployeeId]);

  useEffect(() => {
   
    fetchData();
  }, [loggedInEmployeeId]);

  const fetchData = async () => {
    try {
      console.log("Fetching approved positions...");
      const q = query(collection(db, "MPR"), where("action", "==", "Approved"));
      const querySnapshot = await getDocs(q);

      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Approved positions fetched:", fetchedData.length);
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching approved positions: ", error);
    }
  };
  const handleJobDescModal = (description) => {
    setSelectedJobDescription(description); // Set the selected job description
    setJobDescModalShow(true); // Show the modal
  };

  // Function to close the job description modal
  const handleCloseJobDescModal = () => setJobDescModalShow(false);



  return (
    <div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Position Name</th>
            <th>Department</th>
            <th>Position Count</th>
            <th>Min Experience</th>
            <th>Max Experience</th>
            <th>Min Qualification</th>
            <th>Max Qualification</th>
            <th>Budget</th>
            <th>Job Description</th>
            <th>Location</th>
            <th>Status</th>
            
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.positionName}</td>
              <td>{item.department}</td>
              <td>{item.positionCount}</td>
              <td>{item.minExperience}</td>
              <td>{item.maxExperience}</td>
              <td>{item.minQualification}</td>
              <td>{item.maxQualification}</td>
              <td>{item.budget}</td>
              <td>
                  <Button variant="link" onClick={() => handleJobDescModal(item.jobDescription)}>Description</Button>
                </td>
              <td>{item.location}</td>
              <td>{item.action}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
{/* Job Description Modal */}
<Modal show={jobDescModalShow} onHide={handleCloseJobDescModal}>
        <Modal.Header closeButton>
          <Modal.Title>Job Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJobDescription}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseJobDescModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
};

export default EmployeePositions;
