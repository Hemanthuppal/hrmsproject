import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App'; // Update with your actual path

const SelectedDate = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch UIDs of all managers
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

  // Fetch attendance data for each manager
  const fetchAllManagersAttendanceData = async () => {
    try {
      const managerUids = await fetchManagerUids();
      let allAttendanceData = [];

      for (const managerUid of managerUids) {
        const attendanceDocs = await getDocs(collection(db, `attendances_${managerUid}`));
        const managerAttendanceData = attendanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allAttendanceData = allAttendanceData.concat(managerAttendanceData);
      }

      setAttendanceData(allAttendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  useEffect(() => {
    fetchAllManagersAttendanceData();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchAllManagersAttendanceData();
  };

  const filterAttendanceDataByDate = (data, selectedDate) => {
    return data.filter(attendance => {
      const attendanceDatePart = attendance.id.split('_')[0];
      return attendanceDatePart === selectedDate;
    });
  };

  const filteredAttendanceData = filterAttendanceDataByDate(attendanceData, selectedDate);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Managers' Attendance Data - {selectedDate}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="datePicker" className="mr-2">Select Date:</label>
        <input
          type="date"
          id="datePicker"
          value={selectedDate}
          onChange={handleDateChange}
          className="mr-2"
        />
        {/* <button type="submit" className="btn btn-primary">Submit</button> */}
      </form>
      <table className="styled-table mt-4">
        <thead className="thead-dark">
          <tr>
            <th>User Name</th>
            <th>Status</th>
            <th>Total Duration</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendanceData.map((attendance, index) => (
            <tr key={index}>
              <td>{attendance.name}</td>
              <td>{attendance.status}</td>
              <td>{attendance.totalDuration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SelectedDate;
