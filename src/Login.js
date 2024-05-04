import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db, auth } from './App';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './ContextApi/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './Login.css';
import logo from './Img/logohrms.png';

function Login() {
  const { loginUser } = useContext(AuthContext);
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
      console.log('Logged-in user:', user); // Log the user object
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      console.log('User data:', userData); // Log the userData object
  
      // Check for admin and manager credentials
      if (email === 'admin@gmail.com' && password === 'admin@123') {
        history('/AdminDashboard');
        return;
      } else if (email === 'manager@gmail.com' && password === 'manager@123') {
        history('/Dashboard');
        return;
      }
  
      // Check if userData is defined before accessing its properties
      if (userData) {
        console.log('User role:', userData.role, 'Department:', userData.department); // Log the role and department
  
        if (userData.role === 'Employee' && userData.department === 'HR Team') {
          history('/HRDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager' && userData.department === 'HR Team') {
          history('/HRManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Employee' && userData.department === 'Training and Development') {
          history('/T&DDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager' && userData.department === 'Training and Development') {
          history('/TDManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Employee') {
          history('/EmployeeDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else if (userData.role === 'Manager') {
          history('/ManagerDashboard', { state: { loggedInEmployeeId: user.uid, loggedInEmployeeName: userData.fullName } });
        } else {
          setErrorMsg('Invalid email or password. Please try again.');
        }
      } else {
        setErrorMsg('Invalid email or password. Please try again.');
      }
      loginUser(userData);
    } catch (error) {
      console.error('Firebase login error:', error.code, error.message);
      setErrorMsg('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" id='loginpage'>
    <div className="row border rounded-5 p-3 bg-white shadow box-area">
      <div className="col-md-6 rounded-4 d-flex justify-content-center align-items-center flex-column left-box" style={{ background: '#103cbe' }}>
        <div className="featured-image mb-3">
          <img src={logo} alt="Logo" className="img-fluid" style={{ width: '250px' }} />
        </div>
        <p className="text-white fs-2" style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 600 }}>Be Verified</p>
        <small className="text-white text-wrap text-center" style={{ width: '17rem', fontFamily: "'Courier New', Courier, monospace" }}>iiiQ Digital Transformational Services</small>
      </div>
      <div className="col-md-6 right-box">
        <div className="row align-items-center">
          <div className="header-text mb-4">
            <h2 className='text-center'>Login</h2>
            <p className='text-center'>Access to our dashboard</p>
          </div>
          <form onSubmit={handleLogin}>
              <div className="input-group mb-3">
               
                <input
                  type="email"
                  className="form-control form-control-lg bg-light fs-6"
                  id="email"
                  name="email"
                  value={email}
                  placeholder='  Email address'
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group mb-3">
  <input
    type={showPassword ? "text" : "password"}
    className="form-control form-control-lg bg-light fs-6"
    id="password"
    name="password"
    value={password}
    placeholder="Password"
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
  </span>
</div>

              {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
             
              <div className='input-group mb-3'>
              <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
