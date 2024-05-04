import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc, updateDoc  } from "firebase/firestore";
import { db } from "../App";
import { Modal, Button, Form } from "react-bootstrap";
import PerformanceMetrics from "./PerformanceMetrics";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function PerformanceMetricsList() {
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showModal, setShowModal] = useState(false); 
  const [showEditModal, setShowEditModal] = useState({ kra: "", kpi: "", show: false }); // State for edit modal

 

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const q = query(collection(db, "performancemetrics"), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);

        const metricsData = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          sno: index + 1,
          ...doc.data(),
        }));

        setPerformanceMetrics(metricsData);
      } catch (error) {
        console.error("Error fetching performance metrics:", error);
      }
    };

    fetchPerformanceMetrics();
  }, []);

  const handleEdit = (metric) => {
    setSelectedMetric(metric);
    setShowEditModal({ kra: metric.kra, kpi: metric.kpi, show: true }); // Set data in the modal and show it
  };

  const handleModalDataChange = (e) => {
    setShowEditModal({ ...showEditModal, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selectedMetric || !selectedMetric.id) {
      console.error("No metric selected for update");
      return;
    }
  
    try {
      // Reference to the document in Firestore
      const metricRef = doc(db, "performancemetrics", selectedMetric.id);
  
      // Data to be updated
      const updatedData = {
        kra: showEditModal.kra,
        kpi: showEditModal.kpi
      };
  
      // Update the document in Firestore
      await updateDoc(metricRef, updatedData);
  
      // Update the state
      setPerformanceMetrics((prevMetrics) =>
        prevMetrics.map((metric) =>
          metric.id === selectedMetric.id ? { ...metric, ...updatedData } : metric
        )
      );
  
      // Close the modal
      setShowEditModal({ ...showEditModal, show: false });
  
      console.log("Data updated successfully");
    } catch (error) {
      console.error("Error updating performance metric:", error);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      // Delete the document with the specified ID
      await deleteDoc(doc(db, "performancemetrics", id));
      // Update the state to reflect the deletion
      window.alert("Data Deleted successfully");
      setPerformanceMetrics((prevMetrics) => prevMetrics.filter((metric) => metric.id !== id));
    } catch (error) {
      console.error("Error deleting performance metric:", error);
      
    }
  };

  const toggleEditModal = () => setShowEditModal({ ...showEditModal, show: !showEditModal.show });
  const toggleModal = () => setShowModal(!showModal);

  return (
    <div className="container mt-5">
        <Button onClick={toggleModal} className="mb-3"><FontAwesomeIcon icon={faPlus} /> Add</Button> {/* Add Button */}
      <h2 className="text-center mb-4">Professional Excellence</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Key Result Area (KRA)</th>
            <th>Key Performance Indicator (KPI)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {performanceMetrics.map((metric) => (
            <tr key={metric.id}>
              <td>{metric.sno}</td>
              <td>{metric.kra}</td>
              <td>{metric.kpi}</td>
              <td>
                <button onClick={() => handleEdit(metric)} className="btn btn-sm btn-primary">
                  Edit
                </button>
                &nbsp;
                <button onClick={() => handleDelete(metric.id)} className="btn btn-sm btn-danger ml-2">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Performance Metrics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PerformanceMetrics />
        </Modal.Body>
      </Modal>

 {/* Modal for editing */}
 <Modal show={showEditModal.show} onHide={toggleEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Performance Metric</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>KRA</Form.Label>
              <Form.Control 
                type="text" 
                name="kra" 
                value={showEditModal.kra} 
                onChange={handleModalDataChange} 
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>KPI</Form.Label>
              <Form.Control 
                type="text" 
                name="kpi" 
                value={showEditModal.kpi} 
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
