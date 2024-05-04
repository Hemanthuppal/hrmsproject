import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const SelectedDate = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fetchDataImmediately, setFetchDataImmediately] = useState(false);
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const fetchAttendanceData = async (loggedInEmployeeId) => {
    try {
      const attendanceCollectionRef = collection(db, `attendance_${loggedInEmployeeId}`);
      const attendanceDocs = await getDocs(attendanceCollectionRef);
      const attendanceData = attendanceDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceData(attendanceData);
      console.log("attendance",attendanceData)
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceData(loggedInEmployeeId);
  }, [loggedInEmployeeId]);

  useEffect(() => {
    if (fetchDataImmediately) {
      fetchAttendanceData(loggedInEmployeeId);
      setFetchDataImmediately(false);
    }
  }, [selectedDate, fetchDataImmediately, loggedInEmployeeId]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFetchDataImmediately(true);
  };

  const filterAttendanceDataByDate = (data, selectedDate) => {
    const filteredData = data.filter((attendance) => {
      const attendanceDatePart = attendance.id.split('_')[0]; // Extract date part from document ID
      return attendanceDatePart === selectedDate;
    });
    return filteredData;
  };

  const filteredAttendanceData = filterAttendanceDataByDate(attendanceData, selectedDate);

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
      <h2 className="mb-4">Attendance Data - {selectedDate}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="datePicker" className="mr-2">
          Select Date:
        </label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={handleDateChange}
          className="mr-2"
        />
        {/* <button type="submit" className="btn btn-primary">
          Submit
        </button> */}
      </form>
      <table className="styled-table mt-4">
        <thead className="thead-dark">
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
              <td>{index + 1}</td> 
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
  );
};

export default SelectedDate;
