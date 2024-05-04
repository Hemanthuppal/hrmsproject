import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp, onSnapshot, orderBy, query, where,getDoc,doc } from 'firebase/firestore';
import { db } from '../App';
import { Form, Dropdown, DropdownButton } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom'; 
import '../Employeecommunication.css';

function EmployeeCommunication() {
  const location = useLocation();  
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [departments, setDepartments] = useState([]); // State to store departments
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    const fetchLoggedInEmployeeDetails = async () => {
      try {
        const docRef = doc(db, 'users', loggedInEmployeeId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const employeeData = docSnap.data();
          setLoggedInEmployeeName(employeeData.fullName);
        } else {
          console.log("No such document for logged-in employee!");
        }
      } catch (error) {
        console.error('Error fetching logged in employee details:', error);
      }
    };
  
    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'departments'));
        const fetchedDepartments = querySnapshot.docs.map(doc => doc.data().name);
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
  
    // Execute both fetch operations
    fetchLoggedInEmployeeDetails();
    fetchDepartments();
  }, [loggedInEmployeeId]); // Dependency on loggedInEmployeeId since it's used in fetching employee details
  

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'Employee'), where('assignedManager', '==', loggedInEmployeeName));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(user => user.fullName !== loggedInEmployeeName);
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
        const userToSelectedUserChatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const selectedUserToUserChatCollection = collection(db, `Chats_${selectedUser.id}_${loggedInEmployeeId}`);

        const userToSelectedUserMessagesQuery = query(userToSelectedUserChatCollection, orderBy('timestamp'));
        const selectedUserToUserMessagesQuery = query(selectedUserToUserChatCollection, orderBy('timestamp'));

        const userToSelectedUserUnsubscribe = onSnapshot(userToSelectedUserMessagesQuery, (querySnapshot) => {
          const newMessages = querySnapshot.docs.map((doc) => doc.data());
          setMessages(newMessages);
        });

        const selectedUserToUserUnsubscribe = onSnapshot(selectedUserToUserMessagesQuery, (querySnapshot) => {
          const newMessages = querySnapshot.docs.map((doc) => doc.data());
          setMessages(newMessages);
        });

        return () => {
          userToSelectedUserUnsubscribe(); // Cleanup the listener when component unmounts
          selectedUserToUserUnsubscribe(); // Cleanup the listener when component unmounts
        };
      }
    };

    fetchMessages();
  }, [loggedInEmployeeId, selectedUser]);

  const handleUserSelection = (userId) => {
    const selectedUserData = users.find(user => user.id === userId);
    setSelectedUser(selectedUserData);
  };

  const handleSendMessage = async (message) => {
    if (message.trim() && selectedUser) { // Check if the message is not just whitespace
      try {
        const userToSelectedUserChatCollection = collection(db, `Chats_${loggedInEmployeeId}_${selectedUser.id}`);
        const selectedUserToUserChatCollection = collection(db, `Chats_${selectedUser.id}_${loggedInEmployeeId}`);

        const messageData = {
          sender: loggedInEmployeeName,
          content: message.trim(), // Trim the message to ensure it's not empty
          timestamp: Timestamp.now(),
        };

        await addDoc(userToSelectedUserChatCollection, messageData);
        await addDoc(selectedUserToUserChatCollection, messageData);

        setMessageInput(''); // Clear the input after sending the message
      } catch (error) {
        console.error('Error sending message: ', error);
      }
    }
  };

  useEffect(() => {
    // Adapted from the first code snippet to include department filtering
    const fetchUsers = async () => {
      try {
        let usersQuery;
        if (selectedDepartment) {
          usersQuery = query(collection(db, 'users'), where('department', '==', selectedDepartment));
        } else {
          usersQuery = query(collection(db, 'users'), where('role', '==', 'Employee'));
        }
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(user => user.fullName !== loggedInEmployeeName);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, [loggedInEmployeeName, selectedDepartment]); // Include selectedDepartment in dependencies array

  const handleDepartmentChange = (eventKey) => {
    setSelectedDepartment(eventKey);
  };



  return (
    <div className="d-flex">
      <div className="sidebar">
        <h3>Users</h3>
        <DropdownButton id="department-dropdown" title="Department" onSelect={handleDepartmentChange}>
          <Dropdown.Item eventKey="">All Departments</Dropdown.Item>
          {departments.map((department, index) => (
            <Dropdown.Item eventKey={department} key={index}>{department}</Dropdown.Item>
          ))}
        </DropdownButton>
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserSelection(user.id)}
              className={selectedUser && selectedUser.id === user.id ? 'selected' : ''}
            >
              {user.fullName}
            </li>
          ))}
        </ul>
      </div>

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
