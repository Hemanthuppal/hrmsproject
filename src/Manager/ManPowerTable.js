import React, { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from '../App';
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faPlus, faTimes  } from "@fortawesome/free-solid-svg-icons";
import ManPowerRequest from "./ManPowerRequest";

const ManPowerTable = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [jobDescModalShow, setJobDescModalShow] = useState(false);
  const [selectedJobDescription, setSelectedJobDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
            // Create a query against the collection, ordering by timestamp in descending order
            const q = query(collection(db, "MPR"), orderBy("timestamp", "desc"));
    
            // Execute the query
            const querySnapshot = await getDocs(q);
    
            // Map the documents to an array
            const fetchedData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
    
            // Update the state with the fetched data
            setData(fetchedData);
    
        } catch (error) {
            console.error("Error fetching documents: ", error);
        }
    };
    
    // Call the function to fetch data
    fetchData();
    
}, []);


  const handleShowModal = () => setShowModal(!showModal);


  const handleJobDescModal = (description) => {
    setSelectedJobDescription(description); // Set the selected job description
    setJobDescModalShow(true); // Show the modal
  };

  // Function to close the job description modal
  const handleCloseJobDescModal = () => setJobDescModalShow(false);

  
  const scrollableTableStyle = {
    overflowY: "scroll", // Enable vertical scrolling
    // maxHeight: "500px", // Adjust this value based on your needs
    maxWidth: "80%",
  };
  

  return (
    <div>
      
        <Button variant="primary" onClick={handleShowModal}>
        <FontAwesomeIcon icon={faPlus} /> Request New Position
      </Button>

      <Modal show={showModal} onHide={handleShowModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Manpower Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ManPowerRequest />
        </Modal.Body>
      </Modal>

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

      <div > 
    <table className="styled-table">
        
      <thead>
        <tr>
            <th>S.No</th>
          <th>Position Name</th>
          <th>Department</th>
          <th>Position Count</th>
          <th>Budget</th>
          <th>Min Experience</th>
          <th>Max Experience</th>
          <th>Min Qualification</th>
          <th>Max Qualification</th>
          <th>Job Description</th>
          <th>Location</th>
          <th>Manager</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{index+1}</td>
            <td>{item.positionName}</td>
            <td>{item.department}</td>
            <td>{item.positionCount}</td>
            <td>{item.budget}</td>
            <td>{item.minExperience}</td>
            <td>{item.maxExperience}</td>
            <td>{item.minQualification}</td>
            <td>{item.maxQualification}</td>
           <td>
                  <Button variant="link" onClick={() => handleJobDescModal(item.jobDescription)}>Description</Button>
                </td>
            <td>{item.location}</td>
            <td>{item.manager}</td>
            <td>{item.action || 'Pending'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    </div>
  );
};

export default ManPowerTable;
