import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../App';

function TrainingList({}) {
  
  const location = useLocation();  
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [trainingType, setTrainingType] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [employee, setEmployee] = useState('');
  const [description, setDescription] = useState('');
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [trainingList, setTrainingList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedEmployeeOption, setSelectedEmployeeOption] = useState(''); // Track the selected employee option

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

  const handleCloseAddRoleModal = () => {
    setShowAddRoleModal(false);
    setTrainingType('');
    setAssignedBy('');
    setEmployee('');
    // setStartDate('');
    // setEndDate('');
    setDescription('');
  }
   
  const handleOpenAddRoleModal = () => setShowAddRoleModal(true);

  const fetchTrainingTypes = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'trainingtype')));
      const typesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrainingTypes(typesData);

      console.log("Training Types Data:");
      typesData.forEach(trainingType => {
       
      });
    } catch (error) {
      console.error('Error fetching training types: ', error);
    }
  };

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
  
  const fetchEmployees = async (loggedInEmployeeName) => {
    try {
      if (!loggedInEmployeeName) {
        console.error('Error: loggedInEmployeeName is undefined or null.');
        return;
      }

      const querySnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'Employee'), where('assignedManager', '==', loggedInEmployeeName)));
      const employeesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setEmployees(employeesData);
      console.log("employeesData=", employeesData);
    } catch (error) {
      console.error('Error fetching employees: ', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const managersData = querySnapshot.docs
        .filter(doc => doc.data().role === 'Manager') // Assuming 'Manager' is the role of managers
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setManagers(managersData);
    } catch (error) {
      console.error('Error fetching managers: ', error);
    }
  };

  const fetchTrainingList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'traininglist'));
      const trainingListData = querySnapshot.docs
        .filter(doc => doc.data().assignedBy === loggedInEmployeeName)
        .map(doc => ({ id: doc.id, ...doc.data() }));
  
      setTrainingList(trainingListData);
    } catch (error) {
      console.error('Error fetching training list: ', error);
    }
  };
  
  useEffect(() => {
    fetchTrainingTypes();
    fetchEmployees(loggedInEmployeeName, setEmployees);
    fetchManagers();
    fetchTrainingList();
  }, [loggedInEmployeeName]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEmployeeSelection = (e) => {
    const selectedValue = e.target.value;
    setEmployee(selectedValue);
    setSelectedEmployeeOption(selectedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const selectedTrainingType = trainingTypes.find(type => type.id === trainingType);

      console.log('Selected Training Type:', selectedTrainingType);
      console.log('Logged In Employee Name:', loggedInEmployeeName);
      console.log('Selected Employee:', selectedEmployeeOption);
      if (employee === 'All') {
        // Assign training to all employees
        const employeesData = await getDocs(query(collection(db, 'users'), where('role', '==', 'Employee'), where('assignedManager', '==', loggedInEmployeeName)));
        const employeesToAssign = employeesData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
        for (const selectedEmployee of employeesToAssign) {
          await addDoc(collection(db, 'traininglist'), {
            trainingType: selectedTrainingType.type,
            assignedBy: loggedInEmployeeName,
            employee: selectedEmployee.fullName,
            startDate: selectedTrainingType.startDate,
            endDate: selectedTrainingType.endDate,
            trainingconduction: selectedTrainingType.trainingConduction,
            trainer: selectedTrainingType.trainer,
            description,
            assignedToUid: selectedEmployee.id,
            status: 'Open',
          });
        }
      } else {
        // Assign training to the selected employee
        const selectedEmployee = employees.find(emp => emp.id === employee);
  
        await addDoc(collection(db, 'traininglist'), {
          trainingType: selectedTrainingType.type,
          assignedBy: loggedInEmployeeName,
          employee: selectedEmployee.fullName,
          startDate: selectedTrainingType.startDate,
          endDate: selectedTrainingType.endDate,
          trainingconduction: selectedTrainingType.trainingConduction,
          trainer: selectedTrainingType.trainer,
          description,
          assignedToUid: selectedEmployee.id,
          status: 'Open',
        });
      }
  
      // Display success alert
      window.alert('Training added Successfully');
  
      // Close the modal after submitting
      handleCloseAddRoleModal();
  
      // Fetch the updated training list
      fetchTrainingList();
  
      // Clear form fields
      setTrainingType('');
      setAssignedBy('');
      setEmployee('');
      setSelectedEmployeeOption('');
      setDescription('');
    } catch (error) {
      console.error('Error adding training: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      
      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ flex: 1 }}>
          {/* <input type="text" placeholder="Search..." style={{ padding: '8px' }} /> */}
          <h3>Training List</h3>
        </div>
        <div>
          <button className="btn btn-primary " onClick={handleOpenAddRoleModal} style={{ padding: '8px', marginLeft: '8px' }}>+ Add</button>
        </div>
      </div>

      <Modal show={showAddRoleModal} onHide={handleCloseAddRoleModal} size="lg">
        <Modal.Header closeButton>
          {/* <Modal.Title>Add Role</Modal.Title> */}
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <h4 className='text-center'> Add Training</h4>
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="trainingType" className="form-label">Training Title</label>
                <select
                  className="form-select "
                  id="trainingType"
                  name="trainingType"
                  value={trainingType}
                  onChange={(e) => setTrainingType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select </option>
                  {trainingTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.type}</option>
                  ))}
                </select>
              </div>

              <div className="col">
                <label htmlFor="assignedBy" className="form-label">Assigned By</label>
                <input
                  type="text"
                  className="form-control"
                  id="assignedBy"
                  name="assignedBy"
                  value={loggedInEmployeeName}
                  readOnly // Make it read-only
                />
              </div>
            </div>
            <div className="row mb-3">
            <div className="col">
  <label htmlFor="employee" className="form-label">Employee</label>
  <select
    className="form-select"
    id="employee"
    name="employee"
    value={selectedEmployeeOption}
    onChange={handleEmployeeSelection}
    required
  >
    <option value="" disabled>Select </option>
    <option value="All">All</option> {/* Add an "All" option */}
    {employees.map((employee) => (
      <option key={employee.id} value={employee.id}>{employee.fullName}</option>
    ))}
  </select>
</div>

              {/* <div className="col">
                <label htmlFor="startDate" className="form-label">Start Date</label>
                
              </div> */}
            </div>
            <div className="row mb-3">
              {/* <div className="col">
                <label htmlFor="endDate" className="form-label">End Date</label>
                
              </div> */}
              <div className="col">
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
            <th>Assigned By</th>
            <th>Employee</th>
            <th>Trainer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Description</th>
            <th>Training Conduction</th>
            {/* <th>Status</th> */}
            {/* <th>Action</th> */}
          </tr>
        </thead>
        <tbody>
          {records.map((training, index) => (
            <tr key={training.id}>
              <td>{index + 1}</td>
              <td>{training.trainingType}</td>
              <td>{training.assignedBy}</td>
              <td>{training.employee}</td>
              <td>{training.trainer}</td>
              <td>{formatDate(training.startDate)}</td>
              <td>{formatDate(training.endDate)}</td>
              <td>{training.description}</td>
              <td>{training.trainingconduction}</td>
              {/* <td style={{ color: training.status === 'Completed' ? 'green' : (training.status === 'Rejected' ? 'red' : (training.status === 'In Progress' ? 'orange' : 'blue')) }}><b>{training.status}</b></td> */}
              {/* <td>
                <button><FontAwesomeIcon icon={faPen} /></button>
                <button><FontAwesomeIcon icon={faTrash} /></button>
              </td> */}
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

export default TrainingList;
