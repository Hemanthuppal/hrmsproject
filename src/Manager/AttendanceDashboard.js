

    import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../App';

function AttendanceDashboard({ setCurrentPage }) {
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, total: 0 });

  const fetchAttendanceStats = async () => {
    try {
      // Assuming you have a collection for today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceCollectionRef = collection(db, `attendance_${today}`);
      const attendanceDocs = await getDocs(attendanceCollectionRef);
      const attendanceRecords = attendanceDocs.docs.map(doc => doc.data());

      // Calculate the number of present employees
      const presentCount = attendanceRecords.filter(record => record.status === 'P').length;
      const totalCount = attendanceRecords.length; // Replace with actual total count if different

      setAttendanceStats({ present: presentCount, total: totalCount });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceStats();
  }, []);
  // Reuse the same styles as in the Dashboard component
  const dashboardBoxStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px',
  };

  const dashboardLinkStyle = {
    textDecoration: 'none',
    color: '#333',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('dailyattendance')}>
        <span style={dashboardLinkStyle}>Daily Attendance</span>
        {/* <div>Present Today: {attendanceStats.present} / {attendanceStats.total}</div> */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('monthlyattendancereport')}>
        <span style={dashboardLinkStyle}>Monthly Attendance Report</span>
        {/* Optionally display monthly stats similar to the daily stats */}
      </div>
    </div>
  );
}

export default AttendanceDashboard;