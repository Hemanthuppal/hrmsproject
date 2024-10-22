import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../App'; // Adjust this import to your actual file structure
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';

const ManagerMarkAttendance = () => {
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
        if (now.getDate() !== checkInTime.getDate() || now.getMonth() !== checkInTime.getMonth() || now.getFullYear() !== checkInTime.getFullYear()) {
          const endOfDay = new Date(checkInTime);
          endOfDay.setHours(23, 59, 59, 999);
          const elapsed = endOfDay - checkInTime;
          setDuration(formatDuration(elapsed));
        } else {
          const elapsed = now - checkInTime;
          setDuration(formatDuration(elapsed));
        }
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
    const attendanceDocRef = doc(db, `attendances_${loggedInEmployeeId}`, docId);
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
    const hours = Math.floor((milliseconds / (1000 * 60 * 60)));
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleCheckIn = async () => {
    if (checkInTime) {
      alert('Already checked in for today.');
      return;
    }
    const now = new Date();
    setCheckInTime(now);
    setIsLoading(true);
    setStatus('P');
    await updateAttendanceInDB(now, null, 'P');
    setIsLoading(false);
    alert('Successfully checked in!');
  };

  const handleCheckOut = async () => {
    if (!checkInTime) {
      alert('Cannot check out without checking in.');
      return;
    }
    if (checkOutTime) {
      alert('Already checked out for today.');
      return;
    }
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
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const docId = `${formattedDate}_${loggedInEmployeeId}`;
    const attendanceDocRef = doc(db, `attendances_${loggedInEmployeeId}`, docId);
    const attendanceData = {
      name,
      checkIn: checkIn ? toFirebaseTimestamp(checkIn) : null,
      checkOut: checkOut ? toFirebaseTimestamp(checkOut) : null,
      status,
      duration,
      employeeUid: loggedInEmployeeId,
    };

    try {
      await setDoc(attendanceDocRef, attendanceData);
    } catch (error) {
      console.error('Error updating attendance data:', error);
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

  const isToday = new Date().toDateString() === selectedDate.toDateString();
  const isCheckInDisabled = checkInTime || isLoading || !isToday;
  const isCheckOutDisabled = !checkInTime || checkOutTime || isLoading || !isToday;

  return (
    <>
      <div className='attendance_container'>
        <h2 style={{ color: '#150981', textAlign: 'center', marginTop: '10px' }}>Mark Attendance</h2>
        {status && (
          <div style={{ marginBottom: '5px', marginTop: '5px' }}>
            <p style={{ color: status === 'P' ? 'green' : 'red', textAlign: 'center', fontWeight: 'bold' }}>
              {status === 'P' ? 'Present' : 'Absent'}
            </p>
          </div>
        )}
        <div id="status" className="mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="success" onClick={handleCheckIn} disabled={isCheckInDisabled}
            style={{ width: '18%', padding: '10px', fontSize: '18px', marginRight: '10px' }}>
            Check-In
          </Button>
          <Button variant="danger" onClick={handleCheckOut} disabled={isCheckOutDisabled}
            style={{ width: '18%', padding: '10px', fontSize: '18px' }}>
            Check-Out
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <label style={{ marginRight: '10px', marginTop: '5px', fontSize: '18px' }}>Select Date:</label>
          <DatePicker 
            selected={selectedDate} 
            onChange={handleDateChange} 
            dateFormat="dd/MM/yyyy"
            className="form-control"
            customInput={<CustomInput />}
            maxDate={new Date()} // Disable future dates
          />
        </div>
        <div style={{ marginTop: '20px' }}>
          <table className="styled-table">
            <thead>
              <tr>
                {/* <th>Name</th> */}
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* <td>{name}</td> */}
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

export default ManagerMarkAttendance;
