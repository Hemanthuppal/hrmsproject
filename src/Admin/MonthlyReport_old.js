import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';

const MonthlyReport = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
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

  const formatTimestampToTimeString = (timestamp) => {
    if (!timestamp) return '';

    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }

    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const { isLoading: isLoadingManagers, data: managersData } = useQuery(
    'managers',
    async () => {
      const usersRef = collection(db, 'users');
      const managersQuery = query(usersRef, where("role", "==", "Manager"));
      const managersSnapshot = await getDocs(managersQuery);
      return managersSnapshot.docs.map(doc => ({ uid: doc.id, fullName: doc.data().fullName }));
    },
    {
      refetchOnMount: false,
      staleTime: 14400000, // 4 hours
      cacheTime: 14400000 
    }
  );
  const { isLoading: isLoadingEmployeeData, data: fetchedEmployeeData } = useQuery(
    ['employeeData', role, selectedManager, selectedMonth],
    async () => {
      let managerUids = [];

      if (role === 'Employee' && selectedManager) {
        managerUids = [selectedManager];
      } else if (role === 'Manager') {
        managerUids = await fetchManagerUids();
      } else {
        return [];
      }

      let allEmployeeData = [];
      for (const managerUid of managerUids) {
        const collectionName = role === 'Employee' ? `attendance_${managerUid}` : `attendances_${managerUid}`;
        const attendanceCollectionRef = collection(db, collectionName);
        const attendanceDocs = await getDocs(attendanceCollectionRef);
        const filteredEmployeeData = {};

        attendanceDocs.docs.forEach(doc => {
          const data = doc.data();
          const date = doc.id.split('_')[0];
          const employeeUid = doc.id.split('_')[1];

          if (!filteredEmployeeData[employeeUid]) {
            filteredEmployeeData[employeeUid] = {
              employeeUid,
              name: data.name,
              records: {},
            };
          }

          filteredEmployeeData[employeeUid].records[date] = {
            checkIn: formatTimestampToTimeString(data.checkIn),
            checkOut: formatTimestampToTimeString(data.checkOut),
            duration: data.duration,
            status: data.status,
          };
        });

        allEmployeeData = allEmployeeData.concat(Object.values(filteredEmployeeData));
      }

      return allEmployeeData;
    },
    {
      enabled: !!role,
      staleTime: 14400000, // 4 hours
      cacheTime: 14400000 
    }
  );



  useEffect(() => {
    if (!isLoadingManagers && managersData) {
      setManagers(managersData);
    }
  }, [isLoadingManagers, managersData]);

  useEffect(() => {
    if (!isLoadingEmployeeData && fetchedEmployeeData) {
      setEmployeeData(fetchedEmployeeData);
    }
  }, [isLoadingEmployeeData, fetchedEmployeeData]);

  const fetchManagerUids = async () => {
    try {
      const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(userQuery);
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching manager UIDs:', error);
      return [];
    }
  };

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

  const generateMonthDates = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));
    const currentDate = new Date();

    const adjustedEnd = end > currentDate ? currentDate : end;

    return eachDayOfInterval({ start, end: adjustedEnd });
  };
  
  const filterEmployeeDataByDate = (employee, selectedDate) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return employee.records[formattedDate] || { status: '', totalDuration: '' };
  };

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

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(employeeData.flatMap((employee) =>
      generateMonthDates().map((date, index) => {
        const record = filterEmployeeDataByDate(employee, date);
        return {
          'Employee Name': employee.name,
          'Date': format(date, 'yyyy-MM-dd'),
          'Check-In': record.checkIn || '',
          'Check-Out': record.checkOut || '',
          'Total Duration': record.duration || '',
          'Status': record.status || '',
        };
      })
    ));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly_Attendance_Report');
    XLSX.writeFile(wb, `Monthly_Attendance_Report_${selectedMonth}.xlsx`);
  };

  const doesDataExistForSelectedMonth = () => {
    const selectedMonthData = employeeData.find((employee) => {
      const monthDates = generateMonthDates();
      return monthDates.some((date) => filterEmployeeDataByDate(employee, date).status !== '');
    });
    return !!selectedMonthData;
  };

  return (
    <div className="container">
      <h3 className="mb-2">Monthly Attendance Report - {selectedMonth}</h3>
      {/* <div className='mb-3'>
        <input
          type="text"
          className="form-control"
          placeholder="Search by username"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div> */}

      <div className="mb-2">
        <div className='row'>
          <div className='col-md-4'>
            <label htmlFor="roleSelect" className="mr-2 form-label">Select Role:</label>
            <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
              <option value="" disabled>Select Role</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          {role === 'Employee' && (
            <div className='col-md-4'>
              <label htmlFor="managerSelect" className="mr-2 form-label">Select Manager:</label>
              <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                <option value="" disabled>Select a Manager</option>
                {managers.map(manager => (
                  <option key={manager.uid} value={manager.uid}>{manager.fullName}</option>
                ))}
              </select>
            </div>
          )}
          <div className='col-md-4'>
            <label htmlFor="monthPicker" className="mr-2 form-label">Select Month:</label>
            <input type="month" id="monthPicker" value={selectedMonth} onChange={handleMonthChange} className="form-control mb-4"  max={format(new Date(), 'yyyy-MM')}/>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-success" onClick={handleDownload}>
        Download Excel
      </button>
      {doesDataExistForSelectedMonth() ? (
        <table className="styled-table mt-2">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Date</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Total Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employeeData.flatMap((employee) =>
              generateMonthDates().map((date, index) => {
                const record = filterEmployeeDataByDate(employee, date);
                return (
                  <tr key={index}>
                    <td>{employee.name}</td>
                    <td>{format(date, 'yyyy-MM-dd')}</td>
                    <td>{record.checkIn || ''}</td>
                    <td>{record.checkOut || ''}</td>
                    <td>{record.duration || ''}</td>
                    <td>{record.status || ''}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      ) : (
        <div>No data available for the selected month.</div>
      )}

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
