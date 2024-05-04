import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp, collection, getDocs, query, where, orderBy, limit} from 'firebase/firestore';
import { auth, db } from '../App';
import { useNavigate } from 'react-router-dom';

function Registration() {
  const history = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [managerNames, setManagerNames] = useState([]);
  const [managerData, setManagerData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formValid, setFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState('');

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (fullName && email && password && mobile && selectedRole) {
      if (emailRegex.test(email)) {
        if (password.length >= 6) {
          setErrorMsg('');
          setPasswordError('');
          setFormValid(true);
          return;
        } else {
          setPasswordError('Minimum 6 characters required for the password.');
        }
      } else {
        setErrorMsg('Please enter a valid email address.');
      }
    } else {
      setErrorMsg('Please fill in all fields correctly.');
    }

    setFormValid(false);
  };

  useEffect(() => {
    validateForm();
    fetchEmployeeCount();
    if (selectedRole === 'Employee' && selectedDepartment) {
      fetchManagerNames(selectedDepartment);
    }
  }, [fullName, email, password, mobile, selectedRole, selectedDepartment]);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setSelectedManager(''); // Reset the selected manager when the role changes

    if (e.target.value === 'Employee') {
      fetchManagerNames();
    }
  };

  const fetchManagerNames = async (department) => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'Manager'),
        where('department', '==', department) // Filter by department
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        fullName: doc.data().fullName,
      }));
      setManagerData(data);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };


  const fetchEmployeeCount = async () => {
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const employeeCount = querySnapshot.docs.length;
      setEmployeeId(`EMPID${String(employeeCount + 1).padStart(3, '0')}`);
    } catch (error) {
      console.error('Error fetching employee count:', error);
    }
  };
  

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: fullName,
      });

      const selectedManagerData = managerData.find((manager) => manager.fullName === selectedManager);
      const assignedManagerUid = selectedManagerData ? selectedManagerData.uid : '';

      // Store user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        fullName: fullName,
        email: email,
        password: password,
        mobile: mobile,
        role: selectedRole,
        assignedManager: selectedManager,
        assignedManagerUid: assignedManagerUid,
        employeeId: employeeId, // Store the generated employee ID
        department: selectedDepartment, 
        timestamp: Timestamp.fromDate(new Date()),
      });

      window.alert('Registered Successfully!!!');
      setFullName('');
      setEmail('');
      setPassword('');
      setMobile('');
      setSelectedDepartment('');
      setSelectedRole('');
      setSelectedManager('');
    } catch (error) {
      console.error('Firebase signup error:', error);
      setErrorMsg('An error occurred during signup. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <h2 className="text-center mb-4">Employee Registration</h2>
          <form onSubmit={handleSignup} >
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="mobile" className="form-label">Mobile Number</label>
              <input
                type="number"
                className="form-control"
                id="mobile"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                required
              />
              {passwordError && <div className="text-danger">{passwordError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="department" className="form-label">Department</label>
              <select
                className="form-select"
                id="department"
                name="department"
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  if (selectedRole === 'Employee') {
                    fetchManagerNames(e.target.value); 
                  }
                }}
                required
              >
                <option value="" disabled>Select Department</option>
                <option value="Development">Development</option>
                <option value="HR Team">HR Team</option>
                <option value="Testing">Testing</option>
                <option value="Training and Development">Training and Development</option> {/* New option added */}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="role" className="form-label">Role</label>
              <select
                className="form-select"
                id="role"
                name="role"
                value={selectedRole}
                onChange={handleRoleChange}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            {selectedRole === 'Employee' && (
              <div className="mb-3">
                <label htmlFor="manager" className="form-label">Assigned To Manager</label>
                <select
                  className="form-select"
                  id="assignedmanager"
                  name="assignedmanager"
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  required
                >
                  <option value="" disabled>Select Manager</option>
                  {managerData.map((manager) => (
                    <option key={manager.uid} value={manager.fullName}>{manager.fullName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!formValid || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
        <div className='col-md-3'></div>
      </div>
    </div>
  );
}

export default Registration;
