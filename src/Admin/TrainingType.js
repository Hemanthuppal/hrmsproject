import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../App';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen, faPlus } from "@fortawesome/free-solid-svg-icons";

function TrainingType() {
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trainingEvaluation, setTrainingEvaluation] = useState([]);
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [selectedTrainingConduction, setSelectedTrainingConduction] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = trainingTypes.slice(firstIndex, lastIndex);
  const npage = Math.ceil(trainingTypes.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleCloseAddRoleModal = () => {
    setShowAddRoleModal(false);
    setType('');
    setDescription('');
    setStatus('');
    setDuration('');
    setStartDate('');
    setEndDate('');
  }

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
  
  const handleOpenAddRoleModal = () => setShowAddRoleModal(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Fetch the selected training conduction data
      const selectedTrainingConductionData = trainingEvaluation.find(
        (evaluation) => evaluation.id === selectedTrainingConduction
      );
  
      // Fetch the selected trainer's data
      const selectedTrainerData = trainers.find(
        (trainer) => trainer.id === selectedTrainer
      );
  
      // Add the training type data to Firestore
      const docRef = await addDoc(collection(db, 'trainingtype'), {
        type,
        description,
        status,
        duration,
        startDate,
        endDate,
        trainingConduction: selectedTrainingConductionData?.parameter || '',
        trainer: selectedTrainerData?.fullName || '', // Include the selected trainer's name
      });
  
      console.log('Training Type added with ID: ', docRef.id);
  
      setType('');
      setDescription('');
      setStatus('');
      setDuration('');
      setStartDate('');
      setEndDate('');
      setSelectedTrainingConduction('');
      setSelectedTrainer('');
      handleCloseAddRoleModal();
      fetchTrainingTypes();
      window.alert('Training added Successfully');
    } catch (error) {
      console.error('Error adding training type: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchTrainingTypes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'trainingtype'));
      const typesData = [];
      querySnapshot.forEach((doc) => {
        typesData.push({ id: doc.id, ...doc.data() });
      });
      setTrainingTypes(typesData);
    } catch (error) {
      console.error('Error fetching training types: ', error);
    }
  };

  useEffect(() => {
    fetchTrainingTypes();
  }, [formatDate]);

  useEffect(() => {
    const fetchManagersInDevelopment = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs
          .map(doc => {
            const userData = { id: doc.id, ...doc.data() };
            console.log('User ID:', userData.id); // Log user ID to the console
            return userData;
          })
          .filter(user => user.department === 'Training and Development');

          setTrainers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };
  
    fetchManagersInDevelopment();
  }, []);

  return (
    <div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3>Training Type</h3>
        <div>
          <button className="btn btn-primary" onClick={handleOpenAddRoleModal} style={{ marginRight: '10px' }}>+ Add</button>
        </div>
      </div>

      <Modal show={showAddRoleModal} onHide={handleCloseAddRoleModal} size="lg">
        <Modal.Header closeButton>
          {/* <Modal.Title>Add Role</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <h4 className='text-center'> Add Training Type</h4>
            <div className="mb-3">
              <label htmlFor="type" className="form-label">Training Title</label>
              <input
                type="text"
                className="form-control"
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className='row mb-3'>
              <div className="col">
                <label htmlFor="trainer" className="form-label">Trainer</label>
                <select
                  className="form-select"
                  id="trainer"
                  name="trainer"
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Trainer</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label htmlFor="trainingConduction" className="form-label">Training Conduction</label>
                <select
                  className="form-select"
                  id="trainingConduction"
                  name="trainingConduction"
                  value={selectedTrainingConduction}
                  onChange={(e) => setSelectedTrainingConduction(e.target.value)}
                  required
                >
                  <option value="" disabled>Select </option>
                  {trainingEvaluation.map((evaluation) => (
                    <option key={evaluation.id} value={evaluation.id}>
                      {evaluation.parameter}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className='row mb-3'>
              <div className="col">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="endDate" className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="duration" className="form-label">Training Duration</label>
              <input
                type="text"
                className="form-control"
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="text-center">
              <Button variant="danger" onClick={handleCloseAddRoleModal} style={{ marginRight: '2px' }}>Close</Button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>

      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Training Title</th>
            <th>Description</th>
            <th>Trainer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Training Duration</th>
            <th>Training Conduction</th>
          </tr>
        </thead>
        <tbody>
          {records.map((trainingType, index) => (
            <tr key={trainingType.id}>
              <td>{index + 1}</td>
              <td>{trainingType.type}</td>
              <td>{trainingType.description}</td>
              <td>{trainingType.trainer}</td>
              <td>{formatDate(trainingType.startDate)}</td>
              <td>{formatDate(trainingType.endDate)}</td>
              <td>{trainingType.duration}</td>
              <td>{trainingType.trainingConduction}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav aria-label="Page navigation example" style={{ position: "sticky", bottom: "5px", right: "10px", cursor: "pointer" }}>
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Previous" onClick={prePage}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {numbers.map((n, i) => (
            <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
              <a className="page-link" onClick={() => changeCPage(n)}>
                {n}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === npage ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Next" onClick={nextPage}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default TrainingType;
