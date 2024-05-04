import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { format, lastDayOfMonth, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

import 'bootstrap/dist/css/bootstrap.min.css';
import * as XLSX from 'xlsx'; // Import the xlsx library
import { useLocation } from 'react-router-dom';

const MonthlyReport = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const fetchEmployeeData = async () => {
    try {
      const attendanceCollectionRef = collection(db, `attendances_${loggedInEmployeeId}`);
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

      setEmployeeData(Object.values(filteredEmployeeData));
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [loggedInEmployeeId, selectedMonth]);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchEmployeeData();
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
    const headers = ['User Name', ...monthDates.map(date => format(date, 'dd')), 'Total Present'];
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


  return (
    <div className="container">
      <h3 className="mb-4">Monthly Attendance Report - {selectedMonth}</h3>
      <form onSubmit={handleSubmit}>
        <div className='row'>
          <div className='col-md-4'>
        <label htmlFor="monthPicker" className="mr-2 ">Select Month:</label>
        <input type="month" id="monthPicker" value={selectedMonth} onChange={handleMonthChange} className="mr-2" />
        {/* <button type="submit" className="btn btn-primary mr-2">Submit</button> */}
        </div>
        <div className='col-md-6'></div>
        <div className='col-md-2' >
        <button type="button" className="btn btn-success"  onClick={handleDownload}>
          Download Excel
        </button>
        </div>
        </div>
      </form>
      <table className="styled-table mt-4">
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
          {records.map((employee, index) => (
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
