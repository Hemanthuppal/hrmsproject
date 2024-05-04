import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, addDoc, doc } from 'firebase/firestore';
import { db } from '../App';

function TrainingRequest({ loggedInEmployeeId, loggedInEmployeeName }) {
    const [requestedTrainings, setRequestedTrainings] = useState([]);
    const [selectedTrainingId, setSelectedTrainingId] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('Select');
    const [trainingTypes, setTrainingTypes] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = requestedTrainings.slice(firstIndex, lastIndex);
  const npage = Math.ceil(requestedTrainings.length / recordsPerPage);
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

    const fetchTrainingTypes = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'trainingtype'));
          const typesData = [];
          querySnapshot.forEach((doc) => {
            typesData.push({ id: doc.id, ...doc.data() });
          });
          setTrainingTypes(typesData);
          console.log("typesData=",typesData)
        } catch (error) {
          console.error('Error fetching training types: ', error);
        }
      };
    
      useEffect(() => {
        fetchTrainingTypes();
      }, []);

    const fetchRequestedTrainings = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, `requests_${loggedInEmployeeId}`));
            const requestedTrainingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequestedTrainings(requestedTrainingsData);
        } catch (error) {
            console.error('Error fetching requested trainings: ', error);
        }
    };

    useEffect(() => {
        fetchRequestedTrainings();
    }, [loggedInEmployeeId]);

    const handleActionChange = (requestId, selectedAction) => {
        setSelectedTrainingId(requestId);
        setSelectedStatus(selectedAction);
    };

    const handleSave = async () => {
        if (selectedTrainingId && selectedStatus !== 'Select') {
            try {
                await updateDoc(doc(db, `requests_${loggedInEmployeeId}`, selectedTrainingId), {
                    status: selectedStatus,
                });
    
                if (selectedStatus === 'Approved') {
                    const approvedTraining = requestedTrainings.find(training => training.id === selectedTrainingId);
    
                    if (approvedTraining) {
                        // Find the matching training type
                        const matchingType = trainingTypes.find(type => type.id === approvedTraining.trainingTypeId);
    
                        if (matchingType) {
                            // Add the approved training details to the traininglist collection
                            await addDoc(collection(db, 'traininglist'), {
                                trainingType: matchingType.type || '',
                                assignedBy: loggedInEmployeeName || '',
                                employee: approvedTraining.employeeName || '',
                                startDate: matchingType.startDate || '', // Use the start date from the matching type
                                endDate: matchingType.endDate || '', // Use the end date from the matching type
                                trainingconduction:matchingType.trainingConduction || '',
                                trainer:matchingType.trainer || '',
                                description: approvedTraining.trainingTypeDescription || '',
                                assignedToUid: approvedTraining.employeeId || '',
                                status: 'Open',
                            });
                        }
                    }
                }
    
                // Update the requestedTrainings state to reflect the changes
                setRequestedTrainings(prevTrainings =>
                    prevTrainings.map(training =>
                        training.id === selectedTrainingId ? { ...training, status: selectedStatus } : training
                    )
                );
    
                // Reset selected values
                setSelectedTrainingId(null);
                setSelectedStatus('Select');
            } catch (error) {
                console.error('Error updating status or adding approved training: ', error);
            }
        }
    };
    
    
    
    return (
        <div>
            <h3>Training Requests</h3>
            <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Employee Name</th>
                        <th>Training Title</th>
                        <th>Description</th>
                        <th>Requested Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((requestedTraining, index) => (
                        <tr key={requestedTraining.id} style={{ backgroundColor: requestedTraining.status === 'Approve' ? 'green' : 'inherit' }}>
                            <td>{index + 1}</td>
                            <td>{requestedTraining.employeeName}</td>
                            <td>{requestedTraining.trainingTypeTitle}</td>
                            <td>{requestedTraining.trainingTypeDescription}</td>
                            <td>{new Date(requestedTraining.requestedDate).toLocaleDateString('en-GB')}</td>
                            <td style={{ color: requestedTraining.status === 'Approved' ? 'green' : (requestedTraining.status === 'Rejected' ? 'red' : 'orange') }}><b>{requestedTraining.status}</b></td>
                            <td>
                                <select
                                    onChange={(e) => handleActionChange(requestedTraining.id, e.target.value)}
                                    value={selectedTrainingId === requestedTraining.id ? selectedStatus : 'Select'}
                                >
                                    <option value="Select">Select</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                {selectedStatus !== 'Select' && <button onClick={handleSave}>Save</button>}
                            </td>
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

export default TrainingRequest;
