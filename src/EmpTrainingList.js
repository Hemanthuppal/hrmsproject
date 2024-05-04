import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './App';
import { useLocation } from 'react-router-dom';
function EmployeeTrainingList({}) {
    const location = useLocation();  // Use useLocation hook
    const loggedInEmployeeId = location.state.loggedInEmployeeId;
    const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
      const [trainingList, setTrainingList] = useState([]);
      const [selectedStatus, setSelectedStatus] = useState('Select');

      const [currentPage, setCurrentPage] = useState(1);
      const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
      const lastIndex = currentPage * recordsPerPage;
      const firstIndex = lastIndex - recordsPerPage;
      const records = trainingList.slice(firstIndex, lastIndex);
      const npage = Math.ceil(trainingList.length / recordsPerPage);
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
  
      useEffect(() => {
          const fetchEmployeeDetails = async () => {
            try {
              const employeesRef = collection(db, 'users');
              const querySnapshot = await getDocs(employeesRef);
              querySnapshot.forEach((doc) => {
                const employeeData = doc.data();
                if (doc.id === loggedInEmployeeId) {
                  setLoggedInEmployeeName(employeeData.fullName);
                  console.log("Name=",employeeData.fullName)
                }
              });
            } catch (error) {
              console.error('Error fetching employee details:', error);
            }
          };
      
          fetchEmployeeDetails();
        }, [loggedInEmployeeId]);
  
      const formatDate = (dateString) => {
          const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
          return new Date(dateString).toLocaleDateString(undefined, options);
        };
      
  
      useEffect(() => {
          const fetchTrainingList = async () => {
              try {
                  const querySnapshot = await getDocs(query(collection(db, 'traininglist'), where('assignedToUid', '==', loggedInEmployeeId)));
  
                  const listData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                  setTrainingList(listData);
              } catch (error) {
                  console.error('Error fetching training list: ', error);
              }
          };
  
          fetchTrainingList();
      }, [loggedInEmployeeId]); // Add loggedInEmployeeId as a dependency
  
      const handleStatusChange = (e) => {
          setSelectedStatus(e.target.value);
      };
  
      const handleSave = async (trainingId) => {
          try {
              if (selectedStatus === 'Select') {
                  // Display an error message or handle accordingly
                  console.error('Please select a valid status before saving.');
                  return;
              }
  
              // Update the status in the Firestore document based on the selected status
              await updateDoc(doc(db, 'traininglist', trainingId), {
                  status: selectedStatus,
              });
  
              // Update the trainingList state to reflect the changes
              setTrainingList(prevTrainings =>
                  prevTrainings.map(training =>
                      training.id === trainingId ? { ...training, status: selectedStatus } : training
                  )
              );
  
              // Reset selectedStatus to 'Select'
              setSelectedStatus('Select');
          } catch (error) {
              console.error('Error updating status: ', error);
          }
      };

    return (
        <div>
            <h3 className="text-center">My Trainings</h3>
            <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Training Type</th>
                        <th>Trainer</th>
                        <th>Assigned By</th>
                        <th>Employee</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Description</th>
                        <th>Training Conduction</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((training, index) => (
                        <tr key={training.id}>
                            <td>{index + 1}</td>
                            <td>{training.trainingType}</td>
                            <td>{training.trainer}</td>
                            <td>{training.assignedBy}</td>
                            <td>{training.employee}</td>
                            <td>{formatDate(training.startDate)}</td>
                            <td>{formatDate(training.endDate)}</td>
                            <td>{training.description}</td>
                            <td>{training.trainingconduction}</td>
                            <td style={{ color: training.status === 'Completed' ? 'green' : (training.status === 'Rejected' ? 'red' : (training.status === 'In Progress' ? 'orange' : 'blue')) }}><b>{training.status}</b></td>
                            <td>
                                <select
                                    value={selectedStatus}
                                    onChange={handleStatusChange}
                                >
                                    <option value="Select">Select</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                {selectedStatus !== 'Select' &&  <button onClick={() => handleSave(training.id)}>Save</button>}
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

export default EmployeeTrainingList;
