import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { Modal, Button, Form, Row,  Col } from 'react-bootstrap';
import { getFirestore, doc, setDoc, updateDoc} from "firebase/firestore";


function EditReviewModal({ isOpen, onClose, data, onSave }) {
    const location = useLocation();
    const [editedData, setEditedData] = useState(data || {});

    useEffect(() => {
        setEditedData(data || {});
    }, [data]);
    const loggedInEmployeeId = location.state.loggedInEmployeeId;

    const handleChange = (index, key, value) => {
        const updatedMetrics = [...editedData.performanceMetrics];
        updatedMetrics[index] = { ...updatedMetrics[index], [key]: value };
        setEditedData({ ...editedData, performanceMetrics: updatedMetrics });
    };

const calculateRemarks = (averagePoints) => {
  if (averagePoints < 2) {
    return "Poor";
  } else if (averagePoints >= 2 && averagePoints < 3) {
    return "Can Improve";
  } else if (averagePoints >= 3 && averagePoints < 4) {
    return "Good";
  } else if (averagePoints >= 4 && averagePoints <= 5) {
    return "Excellent";
  } else {
    return "No Remarks"; // You might want to handle the case when averagePoints is greater than 5, if it's possible
  }
};

const handleSave = async () => {
  try {
    const db = getFirestore();
    const docRef = doc(db, `metrics-${loggedInEmployeeId}`, data.id);
    
    // Calculate total and average points
    const totalPoints = editedData.performanceMetrics.reduce((acc, curr) => acc + Number(curr.pointsScored), 0);
    const averagePoints = totalPoints / editedData.performanceMetrics.length;

    // Use the calculateRemarks function to determine the remarks based on the average points
    const remarks = calculateRemarks(averagePoints);

    await updateDoc(docRef, {
      ...editedData,
      totalPoints,
      averagePoints: averagePoints.toFixed(2), // Format to two decimal places
      remarks, // Update remarks based on the new average
    });

    // Update the local state if necessary, or trigger a re-fetch of the data
    onSave({
      ...editedData,
      totalPoints,
      averagePoints: averagePoints.toFixed(2),
      remarks,
    });

    onClose(); // Close the modal
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};
    

    return (
        <Modal size='lg' show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Performance Data</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editedData.fullName || ''}
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Employee Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editedData.employeeId || ''}
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {editedData.performanceMetrics?.reduce((acc, metric, index, array) => {
                        if(index % 2 === 0) {
                            const nextMetric = array[index + 1];
                            acc.push(
                                <Row key={index}>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>{metric.kra}</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={metric.pointsScored || ''}
                                                onChange={(e) => handleChange(index, 'pointsScored', e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    {nextMetric ? (
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>{nextMetric.kra}</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={nextMetric.pointsScored || ''}
                                                    onChange={(e) => handleChange(index + 1, 'pointsScored', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    ) : null}
                                </Row>
                            );
                        }
                        return acc;
                    }, [])}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditReviewModal;
