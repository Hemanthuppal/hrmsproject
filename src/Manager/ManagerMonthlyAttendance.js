import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';
import { useQuery } from 'react-query'; // Import useQuery

const ManagerMonthlyReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const generateMonthDates = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const currentDate = new Date();
    const end = endOfMonth(new Date(selectedMonth));
    const adjustedEnd = currentDate < end ? currentDate : end;
    return eachDayOfInterval({ start, end: adjustedEnd });
  };

   const fetchEmployeeData = async () => {
  try {
    const attendanceCollectionRef = collection(db, `attendances_${loggedInEmployeeId}`);
    const attendanceDocs = await getDocs(attendanceCollectionRef);
    const newEmployeeData = attendanceDocs.docs.reduce((acc, doc) => {
      const [date, employeeUid] = doc.id.split('_');
      const data = doc.data();
      const recordDate = format(data.checkIn ? data.checkIn.toDate() : new Date(), 'yyyy-MM'); // Get the record date in yyyy-MM format
      if (recordDate === selectedMonth) { // Check if the record date matches the selected month
        acc[employeeUid] = acc[employeeUid] || { name: data.name, records: {} };
        acc[employeeUid].records[date] = {
          checkIn: data.checkIn ? data.checkIn.toDate() : '',
          checkOut: data.checkOut ? data.checkOut.toDate() : '',
          totalDuration: data.duration,
          status: data.status,
        };
      }
      return acc;
    }, {});
    return Object.values(newEmployeeData);
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw new Error('Failed to fetch employee data');
  }
};

  const { data: employeeData, isLoading, isError } = useQuery(['employeeData', loggedInEmployeeId, selectedMonth], fetchEmployeeData, {
    enabled: !!loggedInEmployeeId && !!selectedMonth,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

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

  // Render loading state
  if (isLoading) return <div>Loading...</div>;

  // Render error state
  if (isError) return <div>Error fetching data</div>;

  return (
    <div className="container">
      <h3 className="mb-4">Monthly Attendance Report - {format(new Date(selectedMonth), 'yyyy-MM')}</h3>
      <div className='mb-3'>
        <label htmlFor="monthPicker" className="form-label">Select Month:</label>
        <input type="month" id="monthPicker" className="form-control" value={selectedMonth} onChange={handleMonthChange} max={format(new Date(), 'yyyy-MM')} />
      </div>
      <button type="button" className="btn btn-success mb-3" onClick={handleDownload}>Download Excel</button>
      {employeeData && employeeData.length > 0 ? (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Employee Name</th>
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
