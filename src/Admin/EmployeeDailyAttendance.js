import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App'; // Ensure this path is updated with your actual path

const EmployeeDailyAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState('');
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');

  
   // Filter function remains unchanged
   const filterAttendanceDataByDate = (data, date) => {
    return data.filter(attendance => {
      const attendanceDatePart = attendance.id.split('_')[0];
      return attendanceDatePart === date;
    });
  };
  const filteredAttendanceData = filterAttendanceDataByDate(attendanceData, selectedDate);
  

  // Adjusted to fetch managers independent of role selection timing
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const managersQuery = query(usersRef, where("role", "==", "Manager"));
        const managersSnapshot = await getDocs(managersQuery);
        const fetchedManagers = managersSnapshot.docs.map(doc => ({
          uid: doc.id,
          fullName: doc.data().fullName
        }));
        setManagers(fetchedManagers);
        // Automatically select the first manager if role is Employee and managers are fetched
        if (role === 'Employee' && fetchedManagers.length > 0) {
          setSelectedManager(fetchedManagers[0].uid);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };
    fetchManagers();
  }, [db]);

  
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (role === 'Employee' && !selectedManager) {
        // Fetch attendance data for all employees
        try {
          const usersRef = collection(db, 'users');
          const employeesQuery = query(usersRef, where("role", "==", "Employee"));
          const employeesSnapshot = await getDocs(employeesQuery);
          let allAttendanceData = [];
  
          for (const doc of employeesSnapshot.docs) {
            const employeeUid = doc.id;
            const attendanceRef = collection(db, `attendance_${employeeUid}`);
            const attendanceSnapshot = await getDocs(attendanceRef);
            const employeeAttendanceData = attendanceSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            allAttendanceData = allAttendanceData.concat(employeeAttendanceData);
          }
  
          setAttendanceData(allAttendanceData);
        } catch (error) {
          console.error('Error fetching attendance data for all employees:', error);
        }
      } else if (role === 'Employee' && selectedManager=='All') {
        // Fetch attendance data for all employees
        try {
          const usersRef = collection(db, 'users');
          const employeesQuery = query(usersRef, where("role", "==", "Employee"));
          const employeesSnapshot = await getDocs(employeesQuery);
          let allAttendanceData = [];
  
          for (const doc of employeesSnapshot.docs) {
            const employeeUid = doc.id;
            const attendanceRef = collection(db, `attendance_${employeeUid}`);
            const attendanceSnapshot = await getDocs(attendanceRef);
            const employeeAttendanceData = attendanceSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            allAttendanceData = allAttendanceData.concat(employeeAttendanceData);
          }
  
          setAttendanceData(allAttendanceData);
        } catch (error) {
          console.error('Error fetching attendance data for all employees:', error);
        }
      } else if (role === 'Employee' && selectedManager) {
        // Fetch attendance data for the selected employee managed by the selected manager
        try {
          const attendanceRef = collection(db, `attendance_${selectedManager}`);
          const attendanceSnapshot = await getDocs(attendanceRef);
          const employeeAttendanceData = attendanceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAttendanceData(employeeAttendanceData);
        } catch (error) {
          console.error('Error fetching attendance data for the selected employee:', error);
        }
      } else if (role === 'Manager') {
        try {
          // Assuming each manager has their own collection of attendance data
          // Adjust the logic here depending on how your database is structured
          const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
          const querySnapshot = await getDocs(userQuery);
          let allAttendanceData = [];
  
          for (const doc of querySnapshot.docs) {
            const managerUid = doc.id;
            const attendanceRef = collection(db, `attendances_${managerUid}`);
            const attendanceSnapshot = await getDocs(attendanceRef);
            const managerAttendanceData = attendanceSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            allAttendanceData = allAttendanceData.concat(managerAttendanceData);
          }
  
          setAttendanceData(allAttendanceData);
        } catch (error) {
          console.error('Error fetching attendance data for all managers:', error);
        }
      }
    };
  
    fetchAttendanceData();
  }, [selectedManager, selectedDate, role, db]);
  

  const handleRoleChange = (event) => {
    const newRole = event.target.value;
    setRole(newRole);
    setAttendanceData([]);
    // Reset selectedManager if role is not Employee
    if (newRole !== 'Employee') {
      setSelectedManager('');
    }
  };

  const handleManagerChange = (event) => {
    setSelectedManager(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = filteredAttendanceData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(filteredAttendanceData.length / recordsPerPage);
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

  


  return (
    <div className="container">
      <h3 className="mb-2">Employee Attendance Data - {selectedDate}</h3>
      <div className="mb-2">
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
            <div className='col-md-4'>
              <label htmlFor="managerSelect" className="form-label">Select Manager:</label>
              <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                <option value="" disabled>Select a Manager</option>
                <option value="All">All Managers</option>
                {managers.map(manager => (
                  <option key={manager.uid} value={manager.uid}>{manager.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className='col-md-4'>
            <label htmlFor="datePicker" className="form-label">Select Date:</label>
            <input
              type="date"
              id="datePicker"
              className="form-control"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="styled-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>User Name</th>
              <th>Status</th>
              <th>Total Duration</th>
            </tr>
          </thead>
          <tbody>
            {records.map((attendance, index) => (
              <tr key={index}>
                <td>{index+1}</td>
                <td>{attendance.name}</td>
                <td>{attendance.status}</td>
                <td>{attendance.duration}</td>
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
  );
};

export default EmployeeDailyAttendance;