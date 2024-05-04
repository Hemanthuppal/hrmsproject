import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './App';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

const MarkAttendance = () => {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const loggedInEmployeeName = location.state?.loggedInEmployeeName;

  const [name, setName] = useState(loggedInEmployeeName || '');
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [status, setStatus] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const timerID = setInterval(() => {
      if (checkInTime && !checkOutTime) {
        const now = new Date();
        const elapsed = now - checkInTime;
        setDuration(formatDuration(elapsed));
      }
    }, 1000);

    return () => clearInterval(timerID);
  }, [checkInTime, checkOutTime]);

  useEffect(() => {
    fetchAttendanceRecord();
  }, [selectedDate, loggedInEmployeeId]);

  const fetchAttendanceRecord = async () => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const docId = `${formattedDate}_${loggedInEmployeeId}`;
    const attendanceDocRef = doc(db, `attendance_${loggedInEmployeeId}`, docId);
    const docSnap = await getDoc(attendanceDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const checkIn = data.checkIn ? fromFirebaseTimestamp(data.checkIn) : null;
      const checkOut = data.checkOut ? fromFirebaseTimestamp(data.checkOut) : null;
      setCheckInTime(checkIn);
      setCheckOutTime(checkOut);
      setStatus(data.status);
      if (checkIn && checkOut) {
        const durationMillis = checkOut.getTime() - checkIn.getTime();
        setDuration(formatDuration(durationMillis));
      } else {
        setDuration('');
      }
    } else {
      resetState();
    }
  };

  const resetState = () => {
    setCheckInTime(null);
    setCheckOutTime(null);
    setStatus('');
    setDuration('');
  };

  const toFirebaseTimestamp = (date) => Timestamp.fromDate(date);
  const fromFirebaseTimestamp = (timestamp) => timestamp.toDate();

  const formatDuration = (milliseconds) => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleCheckIn = async () => {
    const now = new Date();
    setCheckInTime(now);
    setIsLoading(true);
    setStatus('P'); // Assume Present initially
    await updateAttendanceInDB(now, null, 'P');
    setIsLoading(false);
    alert('Successfully checked in!');
  };

  const handleCheckOut = async () => {
    const now = new Date();
    setCheckOutTime(now);
    setIsLoading(true);
    const durationMillis = now.getTime() - checkInTime.getTime();
    const durationHours = durationMillis / (1000 * 60 * 60);
    const finalStatus = durationHours >= 8 ? 'P' : 'A';
    setStatus(finalStatus);
    setDuration(formatDuration(durationMillis));
    await updateAttendanceInDB(checkInTime, now, finalStatus);
    setIsLoading(false);
    alert(`Successfully checked out! Status: ${finalStatus}`);
  };

  const updateAttendanceInDB = async (checkIn, checkOut, status) => {
    if (!loggedInEmployeeId) {
      console.error('User not authenticated');
      return;
    }
  
    setIsLoading(true);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const docId = `${formattedDate}_${loggedInEmployeeId}`;
    const attendanceData = {
      name,
      checkIn: checkIn ? toFirebaseTimestamp(checkIn) : null,
      checkOut: checkOut ? toFirebaseTimestamp(checkOut) : null,
      status,
      employeeUid: loggedInEmployeeId,
    };
  
    try {
      // Save attendance record for the logged-in employee
      const employeeAttendanceDocRef = doc(db, `attendance_${loggedInEmployeeId}`, docId);
      await setDoc(employeeAttendanceDocRef, attendanceData);
  
      // Fetch the assignedManagerUid from the logged-in employee's document
      const userDocRef = doc(db, 'users', loggedInEmployeeId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const loggedInEmployee = userDocSnap.data();
        const assignedManagerUid = loggedInEmployee.assignedManagerUid;
  
        if (assignedManagerUid) {
          // Save the same attendance record in the assigned manager's collection
          const managerAttendanceDocRef = doc(db, `attendance_${assignedManagerUid}`, docId);
          await setDoc(managerAttendanceDocRef, {
            ...attendanceData,
            // Optionally modify or add additional data specific to the manager's record
          });
        }
      } else {
        console.error('Employee document not found');
      }
    } catch (error) {
      console.error('Error updating attendance data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <button className="custom-datepicker-input form-control" onClick={onClick} ref={ref}>
      {value} <FaCalendarAlt />
    </button>
  ));

  const isCheckInDisabled = checkInTime || isLoading;
  const isCheckOutDisabled = !checkInTime || checkOutTime || isLoading;

  return (
    <>
     <div className='attendance_container'>
      <h2 style={{ color: '#150981', textAlign: 'center', marginTop: '10px' }}>Mark Attendance</h2>
      {status && (
      <div style={{ marginBottom: '5px',marginTop: '5px' }}>
        <p style={{ color: status === 'P' ? 'green' : 'red', textAlign: 'center', fontWeight: 'bold' }}>
          {status === 'P' ? 'Check In' : 'Check Out'}
        </p>
      </div>
      )}
      <div id="status" className="mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant="success" onClick={handleCheckIn} disabled={isCheckInDisabled}
         style={{width:'18%', padding:'10px', fontSize:'18px', marginRight: '10px'}}>
          Check-In
        </Button>
        <Button variant="danger" onClick={handleCheckOut} disabled={isCheckOutDisabled}
         style={{width:'18%', padding:'10px', fontSize:'18px'}}>
          Check-Out
        </Button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      <label style={{ marginRight: '10px',marginTop:'5px',fontSize: '18px' }}>Select Date:</label>
        <DatePicker 
          selected={selectedDate} 
          onChange={handleDateChange} 
          dateFormat="dd/MM/yyyy"
          className="form-control"
          customInput={<CustomInput />}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
      <table className="styled-table mt-4">
      <thead className="thead-dark">
            <tr>
              <th>Name</th>
              <th>Check-In Time</th>
              <th>Check-Out Time</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{name}</td>
              <td>{checkInTime ? checkInTime.toLocaleTimeString() : '-'}</td>
              <td>{checkOutTime ? checkOutTime.toLocaleTimeString() : '-'}</td>
              <td>{duration}</td>
              <td>{status === 'P' ? 'Present' : 'Absent'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    </>
  );
};

export default MarkAttendance;
