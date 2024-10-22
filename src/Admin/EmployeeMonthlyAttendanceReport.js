import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query'; // Import useQuery

const MonthlyReport = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();

  // State for role and manager selection
  const [role, setRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = employeeData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(employeeData.length / recordsPerPage);
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

  const { isLoading, data, refetch } = useQuery('managers', async () => {
    try {
      const usersRef = collection(db, 'users');
      const managersQuery = query(usersRef, where("role", "==", "Manager"));
      const managersSnapshot = await getDocs(managersQuery);
      return managersSnapshot.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName }));
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error; // Rethrow the error to ensure proper error handling
    }
  }, {
    refetchOnMount: true, // Enable automatic refetching on component mount
    enabled: false, // Disable automatic fetching on mount
  });

  const fetchEmployeeUids = async () => {
    try {
      const usersRef = collection(db, 'users');
      const employeesQuery = query(usersRef, where("role", "==", "Employee"));
      const employeesSnapshot = await getDocs(employeesQuery);
      const uids = employeesSnapshot.docs.map(doc => doc.id);
      console.log('Employee UIDs:', uids); // Log UIDs to console
      return uids;
    } catch (error) {
      console.error('Error fetching employee UIDs:', error);
      return [];
    }
  };
  
  // Fetch data whenever role changes
 useEffect(() => {
    if (role) {
      if (role === 'Employee') {
        fetchEmployeeUids(); // Fetch and log employee UIDs when role is Employee
      }
      refetch(); // Manually trigger a refetch for managers
    }
  }, [role]);
  
  // Update managers state when data is fetched
  useEffect(() => {
    if (!isLoading && data) {
      setManagers(data);
    }
  }, [isLoading, data]);
  

  // Fetch employee data based on role
  const fetchEmployeeDataBasedOnRole = async () => {
    let managerUids = [];
    let employeeUids = [];
  
    if (role === 'Employee' && selectedManager) {
      managerUids = [selectedManager];
    } else if (role === 'Manager') {
      managerUids = await fetchManagerUids();
    } else if (role === 'All') {
      managerUids = await fetchManagerUids();
      employeeUids = await fetchEmployeeUids(); // Fetch employee UIDs for 'All' role
    } else {
      return; // Exit if no valid role or manager selected
    }
  
    try {
      let allEmployeeData = [];
      if (role === 'All') {
        // Fetch data for both employees and managers
        for (const managerUid of managerUids) {
          const collectionName = `attendances_${managerUid}`;
          const attendanceCollectionRef = collection(db, collectionName);
          const attendanceDocs = await getDocs(attendanceCollectionRef);
          const filteredEmployeeData = {};
  
          attendanceDocs.docs.forEach(doc => {
            const date = doc.id.split('_')[0];
            const employeeUid = doc.id.split('_')[1];
  
            if (!filteredEmployeeData[employeeUid]) {
              filteredEmployeeData[employeeUid] = {
                employeeUid,
                name: doc.data().name,
                records: {},
              };
            }
  
            filteredEmployeeData[employeeUid].records[date] = {
              status: doc.data().status,
              totalDuration: doc.data().totalDuration,
            };
          });
  
          allEmployeeData = allEmployeeData.concat(Object.values(filteredEmployeeData));
        }
  
        // Fetch employee data from their own collection
        for (const employeeUid of employeeUids) {
          const collectionName = `attendance_${employeeUid}`;
          const attendanceCollectionRef = collection(db, collectionName);
          const attendanceDocs = await getDocs(attendanceCollectionRef);
          const filteredEmployeeData = {};
  
          attendanceDocs.docs.forEach(doc => {
            const date = doc.id.split('_')[0];
  
            if (!filteredEmployeeData[employeeUid]) {
              filteredEmployeeData[employeeUid] = {
                employeeUid,
                name: doc.data().name,
                records: {},
              };
            }
  
            filteredEmployeeData[employeeUid].records[date] = {
              status: doc.data().status,
              totalDuration: doc.data().totalDuration,
            };
          });
  
          allEmployeeData = allEmployeeData.concat(Object.values(filteredEmployeeData));
        }
      } else {
        // Handle non-'All' roles as before
        for (const managerUid of managerUids) {
          const collectionName = role === 'Employee' ? `attendance_${managerUid}` : `attendances_${managerUid}`;
          const attendanceCollectionRef = collection(db, collectionName);
          const attendanceDocs = await getDocs(attendanceCollectionRef);
          const filteredEmployeeData = {};
  
          attendanceDocs.docs.forEach(doc => {
            const date = doc.id.split('_')[0];
            const employeeUid = doc.id.split('_')[1];
  
            if (!filteredEmployeeData[employeeUid]) {
              filteredEmployeeData[employeeUid] = {
                employeeUid,
                name: doc.data().name,
                records: {},
              };
            }
  
            filteredEmployeeData[employeeUid].records[date] = {
              status: doc.data().status,
              totalDuration: doc.data().totalDuration,
            };
          });
  
          allEmployeeData = allEmployeeData.concat(Object.values(filteredEmployeeData));
        }
      }
  
      setEmployeeData(allEmployeeData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };
  

  // Fetch manager UIDs
  const fetchManagerUids = async () => {
    try {
      const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(userQuery);
      const uids = querySnapshot.docs.map(doc => doc.id);
  
      // Console log to check the uids before returning
      console.log('Manager UIDs:', uids);
  
      return uids;
    } catch (error) {
      console.error('Error fetching manager UIDs:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchEmployeeDataBasedOnRole();
  }, [selectedManager, selectedMonth, role]);

  // Handlers for role, manager, and month change
  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setEmployeeData([]);
    if (event.target.value !== 'Employee') {
      setSelectedManager('');
    }
  };

  const handleManagerChange = (event) => {
    setSelectedManager(event.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Generate dates of the month
  const generateMonthDates = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  };

  const filterEmployeeDataByDate = (employee, selectedDate) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return employee.records[formattedDate] || { status: '', totalDuration: '' };
  };

  // Calculate total presents
  const calculateTotalPresents = (employee) => {
    let totalPresents = 0;
    const monthDates = generateMonthDates();
    monthDates.forEach((date) => {
      const record = filterEmployeeDataByDate(employee, date);
      if (record.status === 'P') {
        totalPresents += 1;
      }
    });
    return totalPresents;
  };

  // Download report
  const handleDownload = () => {
    const headers = ['User Name', ...generateMonthDates().map(date => format(date, 'dd')), 'Total Present'];
    const data = [
      headers,
      ...employeeData.map(employee => [
        employee.name,
        ...generateMonthDates().map(date => filterEmployeeDataByDate(employee, date).status),
        calculateTotalPresents(employee),
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly_Attendance_Report');
    XLSX.writeFile(wb, 'Monthly_Attendance_Report.xlsx');
  };

  return (
    <div className="container">
      <h3 className="mb-2">Monthly Attendance Report - {selectedMonth}</h3>
      
        <div className="mb-2">
          <div className='row'>
            <div className='col-md-4'>
              <label htmlFor="roleSelect" className="mr-2 form-label">Select Role:</label>
              <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
                <option value="" disabled>Select Role</option>
                <option value="Manager">Manager</option>
                <option value="Employee">Employee</option>
                <option value="All">All</option>
              </select>
            </div>
            {role === 'Employee' && (
              <div className='col-md-4'>
                <label htmlFor="managerSelect" className="mr-2 form-label">Select Manager:</label>
                <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                  <option value="" disabled>Select a Manager</option>
                  {/* <option value="All">All Manager</option> */}
                  {managers.map(manager => (
                    <option key={manager.uid} value={manager.uid}>{manager.fullName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className='col-md-4'>
              <label htmlFor="monthPicker" className="mr-2 form-label">Select Month:</label>
              <input type="month" id="monthPicker" value={selectedMonth} onChange={handleMonthChange} className="form-control mb-4" />
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-success" onClick={handleDownload}>
          Download Excel
        </button>
      
      <table className="styled-table mt-2">
        <thead>
          <tr>
            <th>User Name</th>
            {generateMonthDates().map((date, index) => (
              <th key={index}>{format(date, 'dd')}</th>
            ))}
            <th>Total Present</th>
          </tr>
        </thead>
        <tbody>
          {records.map((employee, index) => (
            <tr key={index}>
              <td>{employee.name}</td>
              {generateMonthDates().map((date, index) => (
                <td key={index}>{filterEmployeeDataByDate(employee, date).status}</td>
              ))}
              <td>{calculateTotalPresents(employee)}</td>
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
};

export default MonthlyReport;