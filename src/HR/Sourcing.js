import React, { useState, useEffect } from 'react';

import { db, storage, auth } from "../App";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useLocation } from "react-router-dom";


const Sourcing = () => {
  const location = useLocation();
  const [positionNames, setPositionNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const loggedInEmployeeId = location.state.loggedInEmployeeId;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    source: '',
    resume: null,
    skills: '',
    jobTitle: '',
  });

  const fetchMPRData = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "MPR"));
      const positions = querySnapshot.docs.map(doc => doc.data().positionName);
      

      console.log("Fetched positions:", positions); // Debug log
      setPositionNames(positions);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      // Optionally, update the state to indicate an error to the user
    }
  };

  useEffect(() => {
    fetchMPRData();
  }, [loggedInEmployeeId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Check if there is a file to upload
    if (formData.resume) {
      const resumeFile = formData.resume;
      const storageRef = ref(storage, `sourced-resumes/${resumeFile.name}`);

      try {
        // Upload the file to Firebase Storage
        const fileSnapshot = await uploadBytes(storageRef, resumeFile);

        // Get the URL of the uploaded file
        const resumeURL = await getDownloadURL(fileSnapshot.ref);

        // Combine form data with the resume URL
        const fullData = { ...formData, resume: resumeURL };

        // Get the UID of the logged-in user
        const loggedInEmployeeId = location.state.loggedInEmployeeId;

        // Store the combined data in Firestore under the dynamic collection name
        await addDoc(collection(db, `sourced-profiles-${loggedInEmployeeId}`), fullData);

        // Clear the form or give feedback
        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          source: '',
          resume: null,
          skills: '',
        });
        alert("Profile submitted successfully!");

      } catch (error) {
        console.error("Error uploading or storing data: ", error);
        alert("An error occurred while submitting the profile.");
      }
    } else {
      alert("Please attach a resume file.");
    }{
      setSubmitting(false); // Reset submitting state whether the submission is successful or fails
  }
  };
  

  return (
    <form onSubmit={handleSubmit}>
        <div className='row'>
      <div className="col-6 form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="col-6 form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      </div>
      <div className='row mt-3'>
      <div className="col-6 form-group">
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="tel"
          className="form-control"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
        />
      </div>


      <div className="col-6 form-group">
        <label htmlFor="resume">Resume:</label>
        <input
          type="file"
          className="form-control"
          id="resume"
          name="resume"
          onChange={handleChange}
        />
      </div>
      </div>
      <div className='row mt-3'>
   
      <div className="col-6 form-group">
        <label htmlFor="source">Source:</label>
        <select
          className="form-control"
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
        >
          <option value="">Select Source</option>
          <option value="naukri">Naukri</option>
          <option value="linkedin">LinkedIn</option>
          <option value="monster">Monster</option>
          <option value="other">Other</option>
        </select>
      </div>
     
      <div className="col-6 form-group">
                <label>Job Title/Position:</label>
                <select
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className="form-control"
                >
                    <option value="">Select Position</option>
                    {positionNames.map((position, index) => (
                        <option key={index} value={position}>{position}</option>
                    ))}
                </select>
            </div>
            <div className="col-6 form-group mt-3">
        <label htmlFor="skills">Skills:</label>
        
        <textarea
    className="form-control"
    id="skills"
    name="skills"
    value={formData.skills}
    onChange={handleChange}
  />
      </div>
      </div>
      <div className='mt-3 text-center'>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                </button>
            </div>
    </form>
  );
}

export default Sourcing;
