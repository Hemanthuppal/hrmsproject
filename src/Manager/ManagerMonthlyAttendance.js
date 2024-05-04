import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';

const ManagerMonthlyReport = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [searchQuery, setSearchQuery] = useState('');

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

  const fetchEmployeeData = async () => {
    try {
      const attendanceCollectionRef = collection(db, `attendances_${loggedInEmployeeId}`);
      const attendanceDocs = await getDocs(attendanceCollectionRef);
      const newEmployeeData = attendanceDocs.docs.reduce((acc, doc) => {
        const [date, employeeUid] = doc.id.split('_');
        const data = doc.data();
        acc[employeeUid] = acc[employeeUid] || { name: data.name, records: {} };
        acc[employeeUid].records[date] = {
          checkIn: data.checkIn ? data.checkIn.toDate() : '',
          checkOut: data.checkOut ? data.checkOut.toDate() : '',
          totalDuration: data.duration,
          status: data.status,
        };
        return acc;
      }, {});
      setEmployeeData(Object.values(newEmployeeData));
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  useEffect(() => {
    if (new Date(selectedMonth).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0)) {
      setEmployeeData([]);
    } else {
      fetchEmployeeData();
    }
  }, [loggedInEmployeeId, selectedMonth, fetchEmployeeData]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleDownload = () => {
    const monthDates = generateMonthDates();
    const headers = ['User Name', 'Date', 'Check-In', 'Check-Out', 'Total Duration', 'Status'];
    const data = [headers];

    employeeData.forEach(employee => {
      monthDates.forEach(date => {
        const record = employee.records[format(date, 'yyyy-MM-dd')] || {};
        const row = [
          employee.name,
          format(date, 'yyyy-MM-dd'),
          record.checkIn ? format(record.checkIn, 'HH:mm:ss') : '',
          record.checkOut ? format(record.checkOut, 'HH:mm:ss') : '',
          record.totalDuration || '',
          record.status || '',
        ];
        data.push(row);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly_Attendance_Report');
    XLSX.writeFile(wb, `Monthly_Attendance_Report_${selectedMonth}.xlsx`);
  };

  const generateMonthDates = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const currentDate = new Date();
    const end = endOfMonth(new Date(selectedMonth));
    const adjustedEnd = currentDate < end ? currentDate : end;
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

  const doesDataExistForSelectedMonth = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));
    
    return employeeData.some(employee => {
      return Object.keys(employee.records).some(date => {
        const recordDate = new Date(date);
        return recordDate >= start && recordDate <= end;
      });
    });
  };

  return (
    <div className="container">
      <h3 className="mb-4">Monthly Attendance Report - {format(new Date(selectedMonth), 'yyyy-MM')}</h3>
      <div className='mb-3'>
        <label htmlFor="monthPicker" className="form-label">Select Month:</label>
        <input type="month" id="monthPicker" className="form-control" value={selectedMonth} onChange={handleMonthChange} max={format(new Date(), 'yyyy-MM')} />
      </div>
      <button type="button" className="btn btn-success mb-3" onClick={handleDownload}>Download Excel</button>
      {doesDataExistForSelectedMonth() ? (
        <table className="styled-table">
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
            {employeeData.flatMap(employee =>
              generateMonthDates().map((date, index) => {
                const record = employee.records[format(date, 'yyyy-MM-dd')] || {};
                return (
                  <tr key={index}>
                    <td>{employee.name}</td>
                    <td>{format(date, 'yyyy-MM-dd')}</td>
                    <td>{record.checkIn ? format(record.checkIn, 'HH:mm:ss') : ''}</td>
                    <td>{record.checkOut ? format(record.checkOut, 'HH:mm:ss') : ''}</td>
                    <td>{record.totalDuration || ''}</td>
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
    </div>
  );
};

export default ManagerMonthlyReport;
