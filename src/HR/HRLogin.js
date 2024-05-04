
// Login without HR Department


import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from './App';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


function Login() {
  const history = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

const handleLogin = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const loggedInEmployeeId = user.uid;
    console.log('Logged-in employee ID:', loggedInEmployeeId);

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    // Check if userData is defined before accessing its properties
    if (userData && userData.role === 'Employee') {
      history('/EmployeeDashboard', { state: { loggedInEmployeeId, loggedInEmployeeName: userData.fullName } });
    } else if (userData && userData.role === 'Manager') {
      history('/ManagerDashboard', { state: { loggedInEmployeeId, loggedInEmployeeName: userData.fullName } });
    } else if (email === 'admin@gmail.com' && password === 'admin@123') {
      // Additional check for admin login with specific credentials
      history('/AdminDashboard');
    } else {
      setErrorMsg('Invalid email or password. Please try again.');
    }

    // Clear form fields
    setEmail('');
    setPassword('');
  } catch (error) {
    console.error('Firebase login error:', error.code, error.message);
    setErrorMsg('Invalid email or password. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mt-5">
      <div className='card'>
        <div className='card-body'>
      <div className="row">
        <div className="col-md-3"></div>
        <div className="col-md-6">
          <h2 className="text-center mb-4">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                required
              />
            </div>
            <div className="mb-3" style={{ position: 'relative' }}>
        <label htmlFor="password" className="form-label" style={{ display: 'block', marginBottom: '5px' }}>
          Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className="form-control"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          required
        />
        <i
          onClick={togglePasswordVisibility}
          style={{ position: 'absolute', right: '10px', top: '40px', cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </i>
      </div>
            {errorMsg && <div className="text-danger">{errorMsg}</div>}
            <div className="text-center">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-3"></div>
      </div>
      </div>
    </div>
    </div>
  );
}

export default Login;
