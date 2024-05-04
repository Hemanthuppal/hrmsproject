import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../App';
import { Modal, Button } from 'react-bootstrap';

function TrainingBudget() {
  const [showModal, setShowModal] = useState(false);
  const [trainingTitleId, setTrainingTitleId] = useState('');
  const [numEmployees, setNumEmployees] = useState('');
  const [budget, setBudget] = useState('');
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [trainingBudgetList, setTrainingBudgetList] = useState([]);

  
    const fetchTrainingBudget = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'training_budget'));
        const budgetData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setTrainingBudgetList(budgetData);
      } catch (error) {
        console.error('Error fetching training budget: ', error);
      }
    };

    const fetchTrainingTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trainingtype'));
        const typesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrainingTypes(typesData);
      } catch (error) {
        console.error('Error fetching training types: ', error);
      }
    };
    

  useEffect(() => {
    fetchTrainingBudget();
    fetchTrainingTypes();
  }, []);

  const handleAddTraining = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTrainingTitleId('');
    setNumEmployees('');
    setBudget('');
  };

  const handleSaveTraining = async () => {
    try {
      const selectedTrainingType = trainingTypes.find(type => type.id === trainingTitleId);
      const docRef = await addDoc(collection(db, 'training_budget'), {
        trainingTitle: selectedTrainingType?.type || '', // Use the name instead of Id
        numEmployees,
        budget,
      });

      console.log('Training added with ID: ', docRef.id);
      window.alert('Budget added Successfully');
      fetchTrainingBudget();
      handleCloseModal();
    } catch (error) {
      console.error('Error adding training: ', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Training Budget</h3>
        <div>
          <button className="btn btn-primary" onClick={handleAddTraining} style={{ marginRight: '10px' }}>+ Add</button>
        </div>
      </div>

      <table className='styled-table' border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
  <thead>
    <tr>
      <th>S.No</th>
      <th>Training Title</th>
      <th>No. of Employees</th>
      <th>Budget</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    {trainingBudgetList.map((training, index) => (
      <tr key={training.id}>
        <td>{index + 1}</td>
        <td>{training.trainingTitle}</td>
        <td>{training.numEmployees}</td>
        <td>{training.budget}</td>
        <td><b>{training.numEmployees * training.budget}</b></td>
      </tr>
    ))}
  </tbody>
  <tfoot>
    <tr>
      <td colSpan="4" style={{ textAlign: 'right' }}><b>Grand Total</b></td>
      <td><b>
        {trainingBudgetList.reduce((total, training) => total + (training.numEmployees * training.budget), 0)}
        </b></td>
    </tr>
  </tfoot>
</table>



      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Training</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="trainingTitleId" className="form-label">Training Title</label>
              <select
                className="form-select"
                id="trainingTitleId"
                value={trainingTitleId}
                onChange={(e) => setTrainingTitleId(e.target.value)}
              >
                <option value="" disabled>Select Training Title</option>
                {trainingTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.type}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="numEmployees" className="form-label">No. of Employees</label>
              <input type="number" className="form-control" id="numEmployees" value={numEmployees} onChange={(e) => setNumEmployees(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="budget" className="form-label">Budget</label>
              <input type="number" className="form-control" id="budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            {/* Add more form fields as needed */}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveTraining}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TrainingBudget;