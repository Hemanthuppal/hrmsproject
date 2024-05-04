import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, onSnapshot, orderBy, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from './App';
import { Form, Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import './Employeecommunication.css';

function EmployeeCommunication() {
  const location = useLocation();
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState({});
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const fetchLoggedInEmployeeDetails = async () => {
      try {
        const docRef = doc(db, 'users', loggedInEmployeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLoggedInEmployeeName(docSnap.data());
          // Optionally fetch users here or wait for the department to be selected
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error('Error fetching logged in employee details:', error);
      }
    };

    fetchLoggedInEmployeeDetails();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=",employeeData.fullName)
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.fullName !== loggedInEmployeeName);
  
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };
  
    fetchUsers();
  }, [loggedInEmployeeName]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (loggedInEmployeeId && selectedUser) {
        const chatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const messagesQuery = query(chatCollection, orderBy('timestamp'));

        const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
          const newMessages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return { ...data, timestamp: data.timestamp?.toDate() }; // Convert Timestamp to Date
          });
          setMessages(newMessages);
        });

        return () => unsubscribe(); // Cleanup the listener when component unmounts
      }
    };

    fetchMessages();
  }, [loggedInEmployeeId, selectedUser]);

  const handleUserSelection = (userId) => {
    const selectedUserData = users.find(user => user.id === userId);
    setSelectedUser(selectedUserData);
    if (selectedUserData) {
      console.log('Selected User UID:', selectedUserData.id);
    }
  };

  const handleSendMessage = async (message) => {
    if (message.trim() && selectedUser) { // Check if message is not empty
      try {
        const chatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const messageData = {
          sender: loggedInEmployeeName,
          content: message.trim(), // Trim the message to remove whitespace
          timestamp: Timestamp.now(),
        };

        await addDoc(chatCollection, messageData);
        setMessageInput(''); // Clear the input after sending the message
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'departments'));
        const fetchedDepartments = querySnapshot.docs.map(doc => doc.data().name); // Assuming each doc has a 'name' field for the department
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let usersQuery;
        if (selectedDepartment) {
          usersQuery = query(collection(db, 'users'), where('department', '==', selectedDepartment));
        } else {
          // Fetch all users or based on another condition if no department is selected
          usersQuery = query(collection(db, 'users'));
        }
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, [selectedDepartment]);

  const handleDepartmentChange = (eventKey) => {
    setSelectedDepartment(eventKey);
  };

  return (
    <div className="d-flex">
      {/* Sidebar with user names and department filter */}
      <div className="sidebar">
        <h3>Users</h3>
        <DropdownButton id="department-dropdown" title=" Department" onSelect={handleDepartmentChange}>
          <Dropdown.Item eventKey="">All Departments</Dropdown.Item>
          {departments.map((department, index) => (
            <Dropdown.Item eventKey={department} key={index}>{department}</Dropdown.Item>
          ))}
        </DropdownButton>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={selectedUser && selectedUser.id === user.id ? 'selected' : ''}
            >
              {user.fullName}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {selectedUser && (
          <div>
            <div className="chat-header">
              <h3>{selectedUser.fullName}</h3>
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className="chat-message" style={{
                  textAlign: msg.sender === loggedInEmployeeName ? 'right' : 'left',
                  backgroundColor: msg.sender === loggedInEmployeeName ? '#e0e0e0' : '#d4edda',
                  padding: '8px',
                  borderRadius: '8px',
                  margin: '8px',
                }}>
                 {msg.content}
                 <br />
                  <small>{msg.timestamp.toLocaleString()}</small> 
              </div>
              ))}
            </div>

            <div className="chat-input-container">  
              <Form.Control
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                style={{ position: 'absolute', bottom: '4vh', width: 'calc(69% - 40px)', height: '47px' }}
              />
              <div className="input-group-append" style={{ position: 'absolute', bottom: '4vh', right: '2vw' }}>
                <div className="input-group-text">
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    size="2x"
                    onClick={() => handleSendMessage(messageInput)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeCommunication;
