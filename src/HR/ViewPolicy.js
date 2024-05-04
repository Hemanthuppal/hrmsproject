import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { app } from '../App'; // Ensure this is the correct import for your Firebase app instance
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for navigation
import { Modal, Button } from 'react-bootstrap';
import SubmitPolicy from './SumbitPolicy'; // Import SubmitPolicy component

function DisplayPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  useEffect(() => {
    const db = getFirestore(app);
    const policiesCollectionRef = collection(db, 'policies');
    const q = query(policiesCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const policiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolicies(policiesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleShowModal = () => setShowModal(true); // Function to show modal
  const handleCloseModal = () => setShowModal(false); // Function to hide modal


  useEffect(() => {
    const db = getFirestore(app);
    const policiesCollectionRef = collection(db, 'policies');
    const q = query(policiesCollectionRef); // You can specify queries to filter data

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const policiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolicies(policiesList);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // if (loading) {
  //   return <div>Loading policies...</div>;
  // }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Policy List</h2>
        <Button onClick={handleShowModal} className="btn btn-primary">Add Policy</Button>
      </div>
      {/* Modal for SubmitPolicy */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add a New Policy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SubmitPolicy />
        </Modal.Body>
      </Modal>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Policy Name</th>
            <th>Description</th>
            <th>Department</th>
            <th>Date Created</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.policyName}</td>
              <td>{policy.description}</td>
              <td>{policy.department}</td>
              <td>{policy.created.toDate().toLocaleDateString()}</td>
              <td>
                <a href={policy.policyDocumentUrl} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  );
}

export default DisplayPolicies;
