import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function LeaveApplications() {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [role, setRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = leaveApplications.slice(firstIndex, lastIndex);
  const npage = Math.ceil(leaveApplications.length / recordsPerPage);
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
    const fetchManagers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where("role", "==", "Manager"));
        const managersSnapshot = await getDocs(managersQuery);
        const fetchedManagers = managersSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
        setManagers(fetchedManagers);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where("role", "==", "Employee"));
        const managersSnapshot = await getDocs(managersQuery);
        const fetchedManagers = managersSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
        setEmployees(fetchedManagers);
        console.log("fetchedManagers=",fetchedManagers)
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchLeaveApplications = async () => {
      let applications = [];

      if (role === 'Employee' && selectedManager) {
        const leaveRef = collection(db, `leave_${selectedManager}`);
        try {
          const leaveSnapshot = await getDocs(leaveRef);
          applications = leaveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Error fetching leave applications:', error);
        }
      } else if (role === 'Employee') {
        try {
          for (const manager of employees) {
            const leaveCollectionRef = collection(db, `leave_${manager.id}`);
            const leaveDocs = await getDocs(leaveCollectionRef);
            const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            applications = [...applications, ...leaveData];
          }
          
        } catch (error) {
          console.error('Error fetching leave applications for managers:', error);
        }
      }else if (role === 'Employee' && selectedManager=== 'All') {
        // Fetch leave applications for all employees
        try {
          for (const manager of employees) {
            const leaveCollectionRef = collection(db, `leave_${manager.id}`);
            const leaveDocs = await getDocs(leaveCollectionRef);
            const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            applications = [...applications, ...leaveData];
          }
        } catch (error) {
          console.error('Error fetching leave applications for all employees:', error);
        }
      }else if (role === 'Manager') {
        // Fetch leave applications for all managers
        try {
          for (const manager of managers) {
            const leaveCollectionRef = collection(db, `Managerleave_${manager.id}`);
            const leaveDocs = await getDocs(leaveCollectionRef);
            const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            applications = [...applications, ...leaveData];
          }
        } catch (error) {
          console.error('Error fetching leave applications for managers:', error);
        }
      }

      setLeaveApplications(applications);
    };

    if ((role === 'Employee' && selectedManager) || role === 'Manager' || (role === 'Employee' && selectedManager === 'All')|| role === 'Employee') {
      fetchLeaveApplications();
    }
  }, [selectedManager, role, managers, employees]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager(''); // Reset selectedManager when role changes
    setLeaveApplications([]); // Clear applications when role changes
  };

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
  };
  const handleStatusChange = async (applicationId, managerId, newStatus) => {
    try {
      // Update in the manager's collection
      const managerLeaveApplicationRef = doc(db, `Managerleave_${managerId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      // Update local state to reflect the new status
      setLeaveApplications(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating leave application status:', error);
    }
  };

  const styles = {
    tableHeader: {
      padding: '8px',
      textAlign: 'left',
    },
    tableCell: {
      padding: '8px',
      textAlign: 'center',
    },
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'Rejected':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return { color: 'black', fontWeight: 'bold' };
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mt-3">
          <h4>Leave Status</h4>
          <div className='row'>
          <div className='col-md-4'>
            <label htmlFor="roleSelect" className="form-label">Select Role:</label>
            <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
              <option value="" disabled>Select Role</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
            </div>
            {role === 'Employee' && (
              <>
              <div className='col-md-4'>
                <label htmlFor="managerSelect" className="form-label">Select Manager:</label>
                <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                  <option value="" disabled>Select a Manager</option>
                  {/* <option value="All">All Managers</option> */}
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>{manager.fullName}</option>
                  ))}
                </select>
                </div>
              </>
            )}
          </div>
          <table className="styled-table mt-4">
  <thead>
    <tr>
      <th>S.No</th>
      <th>Username</th>
      <th>Leave Type</th>
      <th>From Date</th>
      <th>To Date</th>
      <th>Description</th>
      <th>Status</th>
      {role === 'Manager' && <th>Action</th>}
    </tr>
  </thead>
  <tbody>
    {records.map((application, index) => (
      <tr key={application.id}>
        <td>{index + 1}</td> 
        <td>{application.fullName}</td>
        <td>{application.leaveType}</td>
        <td>{application.fromDate}</td>
        <td>{application.toDate}</td>
        <td>{application.description}</td>
        <td style={{ ...styles.tableCell, ...getStatusStyle(application.status) }}>
          {application.status}
        </td>
        {role === 'Manager' && (
          <td style={styles.tableCell}>
            <select
              defaultValue=""
              onChange={(e) => handleStatusChange(application.id, application.employeeUid, e.target.value)}
            >
              <option value="" disabled>Choose Action</option>
              <option value="Approved">Approve</option>
              <option value="Rejected">Reject</option>
            </select>
          </td>
        )}
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
    </div>
  </div>
  
  );
}

export default LeaveApplications;
