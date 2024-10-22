import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { useLocation } from 'react-router-dom';

const MonthlyReport = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

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

  const fetchEmployeeData = async (managerUids) => {
    try {
      let allEmployeeData = [];

      for (const managerUid of managerUids) {
        const attendanceCollectionRef = collection(db, `attendances_${managerUid}`);
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

      setEmployeeData(allEmployeeData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  useEffect(() => {
    const fetchManagersAndEmployeeData = async () => {
      const managerUids = await fetchManagerUids();
      fetchEmployeeData(managerUids);
    };

    fetchManagersAndEmployeeData();
  }, [selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchManagerUids().then(fetchEmployeeData);
  };

  const generateMonthDates = () => {
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(start);
    return eachDayOfInterval({ start, end });
  };

  const filterEmployeeDataByDate = (employee, selectedDate) => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return employee.records[formattedDate] || { status: '', totalDuration: '' };
  };

  const monthDates = generateMonthDates();
  const calculateTotalPresents = (employee) => {
    let totalPresents = 0;
    monthDates.forEach((date) => {
      const record = filterEmployeeDataByDate(employee, date);
      if (record.status === 'P') {
        totalPresents += 1;
      }
    });
    return totalPresents;
  };

  const handleDownload = () => {
    const headers = ['Employee Name', ...monthDates.map(date => format(date, 'dd')), 'Total Present'];
    const data = [
      headers,
      ...employeeData.map(employee => [
        employee.name,
        ...monthDates.map(date => filterEmployeeDataByDate(employee, date).status),
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
      <h2>Monthly Attendance Report - {selectedMonth}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="monthPicker" className="mr-2">Select Month:</label>
        <input type="month" id="monthPicker" value={selectedMonth} onChange={handleMonthChange} className="mr-2" />{" "}
        {/* <button type="submit" className="btn btn-primary mr-2">Submit</button>{" "} */}
        <button type="button" className="btn btn-success" onClick={handleDownload}>
          Download Excel
        </button>
      </form>
      <table className="styled-table">
        <thead className="thead-dark">
          <tr>
            <th>User Name</th>
            {monthDates.map((date, index) => (
              <th key={index}>{format(date, 'dd')}</th>
            ))}
            <th>Total Present</th>
          </tr>
        </thead>
        <tbody>
          {employeeData.map((employee, index) => (
            <tr key={index}>
              <td>{employee.name}</td>
              {monthDates.map((date, index) => (
                <td key={index}>{filterEmployeeDataByDate(employee, date).status}</td>
              ))}
              <td>{calculateTotalPresents(employee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyReport;
