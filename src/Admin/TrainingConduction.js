import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, updateDoc,doc, setDoc,Timestamp  } from "firebase/firestore";
import { db } from "../App";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function PerformanceMetricsList() {
  const [trainingEvaluation, setTrainingEvaluation] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState({ parameter: "", description: "", show: false }); // State for edit modal

  const [parameter, setParameter] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate if KRA and KPI are not empty
    if (parameter.trim() === "" || description.trim() === "") {
      window.alert("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a new document reference within the "performancemetrics" collection
      const trainingEvaluationRef = doc(collection(db, "trainingConduction"));

      // Save the form data to the document reference
      await setDoc(trainingEvaluationRef, {
        parameter: parameter,
        description: description,
        timestamp: Timestamp.fromDate(new Date()),
      });

      window.alert("Training Conduction Saved Successfully.");

      // Clear form fields after successful save
      setParameter("");
      setDescription("");
      setShowModal(false);
      fetchTrainingEvaluation();
    } catch (error) {
      console.error("Error saving performance metrics:", error);
      window.alert("An error occurred. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
    const fetchTrainingEvaluation = async () => {
      try {
        const q = query(collection(db, "trainingConduction"), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);

        const evaluationData = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          sno: index + 1,
          ...doc.data(),
        }));

        setTrainingEvaluation(evaluationData);
      } catch (error) {
        console.error("Error fetching performance metrics:", error);
      }
    };
    useEffect(() => {
    fetchTrainingEvaluation();
  }, []);

  const handleEdit = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEditModal({ parameter: evaluation.parameter, description: evaluation.description, show: true }); // Set data in the modal and show it
  };

  const handleModalDataChange = (e) => {
    setShowEditModal({ ...showEditModal, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selectedEvaluation || !selectedEvaluation.id) {
      console.error("No evaluation selected for update");
      return;
    }
  
    try {
      // Reference to the document in Firestore
      const evaluationRef = doc(db, "trainingConduction", selectedEvaluation.id);
  
      // Data to be updated
      const updatedData = {
        parameter: showEditModal.parameter,
        description: showEditModal.description
      };
  
      // Update the document in Firestore
      await updateDoc(evaluationRef, updatedData);
  
      // Update the state
      setTrainingEvaluation((prevEvaluation) =>
        prevEvaluation.map((evaluation) =>
          evaluation.id === selectedEvaluation.id ? { ...evaluation, ...updatedData } : evaluation
        )
      );
      window.alert("Data Edited successfully");
      // Close the modal
      setShowEditModal({ ...showEditModal, show: false });
      fetchTrainingEvaluation();
      
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating training evaluation:", error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      // Display a confirmation prompt
      const userConfirmed = window.confirm("Are you sure you want to delete this training evaluation?");
      
      // Proceed with deletion if the user confirms
      if (userConfirmed) {
        // Delete the document with the specified ID
        await deleteDoc(doc(db, "trainingConduction", id));
        
        // Update the state to reflect the deletion
        window.alert("Data Deleted successfully");
        setTrainingEvaluation((prevEvaluation) => prevEvaluation.filter((evaluation) => evaluation.id !== id));
        
        // Fetch the updated training evaluation after deletion
        fetchTrainingEvaluation();
      }
    } catch (error) {
      console.error("Error deleting training evaluation:", error);
    }
  };
  

  const toggleEditModal = () => setShowEditModal({ ...showEditModal, show: !showEditModal.show });
  const toggleModal = () => setShowModal(!showModal);

  return (
    <div className="container">
        <Button onClick={toggleModal}><FontAwesomeIcon icon={faPlus} /> Add</Button> {/* Add Button */}
      <h2 className="text-center mb-4">Training Conduction</h2>
      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Training Conduction Mode</th>
            <th>Description</th>
            {/* <th>Action</th> */}
          </tr>
        </thead>
        <tbody>
          {trainingEvaluation.map((evaluation) => (
            <tr key={evaluation.id}>
              <td>{evaluation.sno}</td>
              <td>{evaluation.parameter}</td>
              <td>{evaluation.description}</td>
              {/* <td>
                <button onClick={() => handleEdit(evaluation)} className="btn btn-sm btn-primary">
                  Edit
                </button>
                &nbsp;
                <button onClick={() => handleDelete(evaluation.id)} className="btn btn-sm btn-danger ml-2">
                  Delete
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Training Conduction </Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form onSubmit={handleSubmit}>
            <div className=" ">
              <label htmlFor="parameter" className="form-label">
                Conduction Mode
              </label>
              <input
                type="text"
                className="form-control"
                id="parameter"
                value={parameter}
                onChange={(e) => setParameter(e.target.value)}
                // placeholder="Enter parameter"
                required
              />
            </div>
            <div className=" ">
              <label htmlFor="description" className="form-label">
               Description
              </label>
              <input
                type="text"
                className="form-control"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                // placeholder="Enter description"
                required
              />
            </div>
            <div className="text-center mt-2">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
            
            </Modal.Footer>
      </Modal>

 {/* Modal for editing */}
 <Modal show={showEditModal.show} onHide={toggleEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Training Evaluation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Parameter</Form.Label>
              <Form.Control 
                type="text" 
                name="parameter" 
                value={showEditModal.parameter} 
                onChange={handleModalDataChange} 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control 
                type="text" 
                name="description" 
                value={showEditModal.description} 
                onChange={handleModalDataChange} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={toggleEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
}

export default PerformanceMetricsList;
