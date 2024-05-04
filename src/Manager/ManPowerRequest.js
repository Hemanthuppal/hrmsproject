import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../App"; // Import your Firestore instance

const ManPowerRequest = () => {
  const location = useLocation();
  const loggedInEmployeeName = location.state?.loggedInEmployeeName;
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [jobDescriptionError, setJobDescriptionError] = useState("");

  const [formData, setFormData] = useState({
    positionName: "",
    department: "",
    positionCount: "",
    budget: "",
    minExperience: "",
    maxExperience: "",
    minQualification: "",
    maxQualification: "",
    jobDescription: "",
    location: "",
    manager: loggedInEmployeeName,
    timestamp: null,
  });

  useEffect(() => {
    // Log the logged-in employee's name to the console
    console.log(
      "Logged-in Employee Name: ",
      loggedInEmployeeName,
      "Logged-in Employeeid: ",
      loggedInEmployeeId
    );
  }, [loggedInEmployeeName]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "jobDescription" && value.length > 300) {
      setJobDescriptionError(
        "Job description should not exceed 300 characters."
      );
    } else {
      setJobDescriptionError("");
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();

    // Convert to IST (UTC+5:30)
    const istOffset = 5.5 * 60 * 60000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    // Format to IST string
    const istTimeString = istTime.toISOString().replace("Z", "+05:30");

    // Update formData with the IST timestamp
    const updatedFormData = {
      ...formData,
      timestamp: istTimeString, // Set the timestamp field to IST
    };

    try {
      await addDoc(collection(db, "MPR"), updatedFormData);
      // Add formData to the "MPR" collection
      alert("Form submitted successfully!");
      // Alert or handle success
    } catch (error) {
      console.error("Error adding document: ", error); // Handle errors
    }
  };

  return (
    <form className="container mt-5" onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="positionName" className="form-label">
            Position Name:
          </label>
          <input
            type="text"
            className="form-control"
            id="positionName"
            name="positionName"
            value={formData.positionName}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="department" className="form-label">
            Department:
          </label>
          <input
            type="text"
            className="form-control"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="positionCount" className="form-label">
            Position Count:
          </label>
          <input
            type="text"
            className="form-control"
            id="positionCount"
            name="positionCount"
            value={formData.positionCount}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="budget" className="form-label">
            Budget:
          </label>
          <input
            type="text"
            className="form-control"
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="minExperience" className="form-label">
            Min Experience:
          </label>
          <input
            type="text"
            className="form-control"
            id="minExperience"
            name="minExperience"
            value={formData.minExperience}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="maxExperience" className="form-label">
            Max Experience:
          </label>
          <input
            type="text"
            className="form-control"
            id="maxExperience"
            name="maxExperience"
            value={formData.maxExperience}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="minQualification" className="form-label">
            Min Qualification:
          </label>
          <input
            type="text"
            className="form-control"
            id="minQualification"
            name="minQualification"
            value={formData.minQualification}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="maxQualification" className="form-label">
            Max Qualification:
          </label>
          <input
            type="text"
            className="form-control"
            id="maxQualification"
            name="maxQualification"
            value={formData.maxQualification}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <label htmlFor="location" className="form-label">
            Location:
          </label>
          <input
            type="text"
            className="form-control"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="jobDescription" className="form-label">
            Job Description(Max 300 Characters) :
          </label>
          <textarea
            className="form-control"
            id="jobDescription"
            name="jobDescription"
            rows="2"
            value={formData.jobDescription}
            onChange={handleChange}
          ></textarea>
          {jobDescriptionError && (
            <p className="text-danger">{jobDescriptionError}</p>
          )}
        </div>
      </div>

      <div className="text-center mt-3">
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </div>
    </form>
  );
};

export default ManPowerRequest;
