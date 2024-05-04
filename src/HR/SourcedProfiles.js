import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db, auth } from "../App"; // import your firebase database instance
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  setDoc,
} from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";

const SourcedProfiles = () => {
    const location = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    resume: "",
    source: "",
  });
  const [editProfileId, setEditProfileId] = useState(null);


const fetchProfiles = async () => {
    try {
      // Get the logged-in employee's ID from the location state
      const loggedInEmployeeId = location.state.loggedInEmployeeId;

      // Define the Firestore query
      const q = query(collection(db, `sourced-profiles-${loggedInEmployeeId}`));

      // Execute the query
      const querySnapshot = await getDocs(q);

      // Extract data from each document
      const fetchedProfiles = [];
      querySnapshot.forEach((doc) => {
        fetchedProfiles.push({ id: doc.id, ...doc.data() });
      });

      // Set state with the fetched profiles
      setProfiles(fetchedProfiles);
    } catch (error) {
      console.error("Error fetching profiles: ", error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [location.state.loggedInEmployeeId]);

  const handleEditClick = (profile) => {
    setEditProfileId(profile.id);
    setEditFormData(profile);
    setShowModal(true);
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditFormSubmit = async () => {
    // Update Firestore data
    const loggedInEmployeeId = location.state.loggedInEmployeeId;
    const docRef = doc(db, `sourced-profiles-${loggedInEmployeeId}`, editProfileId); // Corrected document reference
    await updateDoc(docRef, editFormData);

    const updatedProfiles = profiles.map((profile) =>
      profile.id === editProfileId ? { ...profile, ...editFormData } : profile
    );
    setProfiles(updatedProfiles);
    setShowModal(false);
  };

  const handleDeleteClick = async (profileId) => {
    // Confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this profile?");
    
    if (isConfirmed) {
      try {
        const docRef = doc(db, "sourced-profiles", profileId);
        await deleteDoc(docRef);
        
        const newProfiles = profiles.filter((profile) => profile.id !== profileId);
        setProfiles(newProfiles);
  
        // Success alert
        window.alert("Profile deleted successfully");
      } catch (error) {
        console.error("Error deleting document: ", error.message);
        window.alert("Failed to delete the profile: " + error.message); // Error alert
      }
    }
  };


  const handleContactedChange = async (profileId, value) => {
    // Update local state
    const updatedProfiles = profiles.map(profile =>
      profile.id === profileId ? { ...profile, contacted: value } : profile
    );
    setProfiles(updatedProfiles);
  
    // Update Firestore data
    const loggedInEmployeeId = location.state.loggedInEmployeeId;
    const docRef = doc(db, `sourced-profiles-${loggedInEmployeeId}`, profileId);
    await updateDoc(docRef, { contacted: value });
  };


  const handleSchedulingChange = async (profileId, value) => {
    // Update local state
    const updatedProfiles = profiles.map(profile =>
      profile.id === profileId ? { ...profile, scheduling: value } : profile
    );
    setProfiles(updatedProfiles);
  
    // Update Firestore data for scheduling status
    const loggedInEmployeeId = location.state.loggedInEmployeeId;
    const docRef = doc(db, `sourced-profiles-${loggedInEmployeeId}`, profileId);
    await updateDoc(docRef, { scheduling: value });
  
    // If 'R1 Scheduled' is selected, copy the data to interviews-loggedInEmployeeId collection
    if (value === "R1 scheduled") {
      const interviewDocRef = doc(db, `interviews-${loggedInEmployeeId}`, profileId);
      const profileData = updatedProfiles.find(profile => profile.id === profileId);
      await setDoc(interviewDocRef, profileData);
    }
  };
  
  

  
  return (
    <div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile Number</th>
            <th>Position</th>
            <th>Resume</th>
            <th>Source</th>
            <th>Contacted</th> 
            <th>Interview Scheduling</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile, index) => (
            <tr key={index}>
                <td>{index+1}</td>
              <td>{profile.name}</td>
              <td>{profile.email}</td>
              <td>{profile.mobileNumber}</td>
              <td>{profile.jobTitle}</td>
              <td>
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                Resume
                </a>
              </td>

              <td>{profile.source}</td>
              <td>
                <select
                  value={profile.contacted || ""}
                  onChange={(e) => handleContactedChange(profile.id, e.target.value)}
                >
                  <option value="">
Select Status</option>
<option value="interested">Interested</option>
<option value="not interested">Not Interested</option>
</select>
</td>
<td>
                <select
                  value={profile.scheduling || "not scheduled"}
                  onChange={(e) => handleSchedulingChange(profile.id, e.target.value)}
                >
                  <option value="not scheduled">Not Scheduled</option>
                  <option value="R1 scheduled">R1 Scheduled</option>
                </select>
              </td>
              <td>
                <button type="button" onClick={() => handleEditClick(profile)}>
                  Edit
                </button>
                <button type="button" onClick={() =>handleDeleteClick(profile.id)}>
                 Delete
                </button>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="number"
                name="mobileNumber"
                value={editFormData.mobileNumber}
                onChange={handleEditFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditFormSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SourcedProfiles;
