import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx';
import { useLocation } from 'react-router-dom';

const ManagerMonthlyReport = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);
      try {
        const attendanceCollectionRef = collection(db, `attendances_${loggedInEmployeeId}`);
        const attendanceDocs = await getDocs(attendanceCollectionRef);
        const newEmployeeData = attendanceDocs.docs.reduce((acc, doc) => {
          const [date, employeeUid] = doc.id.split('_');
          const data = doc.data();
          const recordDate = format(data.checkIn ? data.checkIn.toDate() : new Date(), 'yyyy-MM');
          if (recordDate === selectedMonth) {
            acc[employeeUid] = acc[employeeUid] || { name: data.name, records: {} };
            acc[employeeUid].records[date] = {
              checkIn: data.checkIn ? data.checkIn.toDate() : '',
              checkOut: data.checkOut ? data.checkOut.toDate() : '',
              totalDuration: data.duration || '',
              status: data.status || '',
            };
          }
          return acc;
        }, {});
        setEmployeeData(Object.values(newEmployeeData));
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setIsError(true);
      }
      setIsLoading(false);
    };

    if (loggedInEmployeeId && selectedMonth) {
      fetchData();
    }
  }, [loggedInEmployeeId, selectedMonth]);

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

  return (
    <div className="container">
      <h3 className="mb-4">Monthly Attendance Report - {format(new Date(selectedMonth), 'yyyy-MM')}</h3>
      <div className='mb-3'>
        <label htmlFor="monthPicker" className="form-label">Select Month:</label>
        <input type="month" id="monthPicker" className="form-control" value={selectedMonth} onChange={handleMonthChange} max={format(new Date(), 'yyyy-MM')} />
      </div>
      <button type="button" className="btn btn-success mb-3" onClick={handleDownload}>Download Excel</button>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div>Error fetching data</div>
      ) : employeeData && employeeData.length > 0 ? (
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
