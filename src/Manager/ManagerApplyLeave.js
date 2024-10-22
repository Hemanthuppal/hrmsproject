import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, getFirestore, collection, getDocs, setDoc } from 'firebase/firestore';
import { app } from '../App';

function ManagerApplyLeave() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveStatus, setLeaveStatus] = useState('pending');
  const [isApplying, setIsApplying] = useState(false);

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleLeaveTypeChange = (e) => {
    const selectedId = e.target.value;
    const selectedType = leaveTypes.find((type) => type.id === selectedId);
    setLeaveType(selectedType ? selectedType.leaveName : '');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const db = getFirestore(app);
      const userDocRef = doc(db, 'users', loggedInEmployeeId);

      try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFullName(userData.fullName);
          setEmail(userData.email);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchLeaveTypes = async () => {
      const db = getFirestore(app);
      const leaveTypesCollectionRef = collection(db, 'leave_types');

      try {
        const leaveTypesSnapshot = await getDocs(leaveTypesCollectionRef);
        const leaveTypesData = leaveTypesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaveTypes(leaveTypesData);
      } catch (error) {
        console.error('Error fetching leave types:', error);
      }
    };

    fetchUserData();
    fetchLeaveTypes();
  }, [loggedInEmployeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loggedInEmployeeId) {
      console.error('Logged-in employee ID not available.');
      return;
    }

    const db = getFirestore(app);

    setIsApplying(true);

    const userDocRef = doc(db, 'users', loggedInEmployeeId);
    const employeeDocSnap = await getDoc(userDocRef);

    if (employeeDocSnap.exists()) {
      const loggedInEmployee = employeeDocSnap.data();

      const leaveApplicationData = {
        fullName,
        email,
        leaveType,
        fromDate,
        toDate,
        description,
        status: leaveStatus,
        employeeUid: loggedInEmployeeId,
      };

      try {
        const newLeaveRef = doc(collection(db, `Managerleave_${loggedInEmployeeId}`));
        await setDoc(newLeaveRef, leaveApplicationData);

        setFullName('');
        setEmail('');
        setLeaveType('');
        setFromDate('');
        setToDate('');
        setDescription('');
        setLeaveStatus('pending');

        alert('Leave application submitted successfully!!!');
        console.log('Leave application submitted successfully!');
      } catch (error) {
        console.error('Error submitting leave application:', error);
      } finally {
        setIsApplying(false);
      }
    } else {
      console.error('Logged-in employee not found.');
    }
  };

  const validateDescription = (name) => {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(name);
  };

  return (
    <div className="container">
      <div className="row ">
        <div className="col-md-12 mt-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3 row">
              <label htmlFor="fullName" className="col-sm-3 col-form-label">
                Name:
              </label>
              <div className="col-sm-9">
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  readOnly
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="email" className="col-sm-3 col-form-label">
                Email:
              </label>
              <div className="col-sm-9">
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="leave_type" className="col-sm-3 col-form-label">
                Leave Type:
              </label>
              <div className="col-sm-9">
                <select
                  id="leave_type"
                  className="form-select"
                  name="leave_type"
                  value={leaveTypes.find(type => type.leaveName === leaveType)?.id || ''}
                  onChange={handleLeaveTypeChange}
                >
                  <option value="" disabled>Select Leave Type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.leaveName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="from_date" className="col-sm-3 col-form-label">
                From Date:
              </label>
              <div className="col-sm-9">
                <input
                  id="from_date"
                  name="from_date"
                  type="date"
                  className="form-control"
                  autoComplete="off"
                  value={fromDate}
                  min={getCurrentDate()}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="to_date" className="col-sm-3 col-form-label">
                To Date:
              </label>
              <div className="col-sm-9">
                <input
                  id="to_date"
                  name="to_date"
                  type="date"
                  className="form-control"
                  autoComplete="off"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3 row">
              <label htmlFor="description" className="col-sm-3 col-form-label">
                Description:
              </label>
              <div className="col-sm-9">
                <textarea
                  id="description"
                  name="description"
                  rows="2"
                  value={description}
                  onChange={(e) => {
                    if (validateDescription(e.target.value)) {
                      setDescription(e.target.value);
                    }
                  }}
                  required
                  className="form-control"
                ></textarea>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" name="button" className="btn btn-primary" disabled={isApplying}>
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </form>
        </div>
      </div>
   

    </div>
  );
}

export default ManagerApplyLeave;
