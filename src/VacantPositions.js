import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./App";
import { Modal, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPen,
  faPlus,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const ManPowerTable = () => {
  const location = useLocation();
  const loggedInEmployeeName = location.state?.loggedInEmployeeName;
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;
  const [data, setData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loggedInEmployeeData, setLoggedInEmployeeData] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescModalShow, setJobDescModalShow] = useState(false);
  const [selectedJobDescription, setSelectedJobDescription] = useState('');

  useEffect(() => {
    console.log(
      "Logged-in Employee Name: ",
      loggedInEmployeeName,
      "Logged-in Employeeid: ",
      loggedInEmployeeId
    );
    const fetchData = async () => {
      try {
        const q = query(collection(db, "MPR"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, [loggedInEmployeeId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Manpower data
        const q = query(collection(db, "MPR"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);

        // Fetch logged-in employee data
        const userDocRef = doc(db, "users", loggedInEmployeeId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setLoggedInEmployeeData(userData);
        }
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, [loggedInEmployeeId]);

  const handleApplyClick = (index) => {
    const item = data[index];
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleApply = async () => {
    try {
      if (resumeFile) {
        const allowedFileTypes = [
          "image/jpeg",
          "image/png",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (allowedFileTypes.includes(resumeFile.type)) {
          const storageRef = ref(
            storage,
            `resumes/${loggedInEmployeeId}/${resumeFile.name}`
          );
          await uploadBytes(storageRef, resumeFile);
          const resumeUrl = await getDownloadURL(storageRef);

          const applicantData = {
            fullName: loggedInEmployeeData.fullName,
            role: loggedInEmployeeData.role,
            email:loggedInEmployeeData.email,
            mobile:loggedInEmployeeData.mobile,
            positionName: selectedItem.positionName,
            department: selectedItem.department,
            positionCount: selectedItem.positionCount,
            minExperience: selectedItem.minExperience,
            maxExperience: selectedItem.maxExperience,
            minQualification: selectedItem.minQualification,
            maxQualification: selectedItem.maxQualification,
            jobDescription: selectedItem.jobDescription,
            location: selectedItem.location,
            resumeUrl: resumeUrl,
          };

          await addDoc(collection(db, "Applicants"), applicantData);

          setResumeFile(null);
        } else {
          // Handle invalid file type
          console.error(
            "Invalid file type. Please upload a JPEG, PNG, or Word document."
          );
        }
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error applying: ", error);
    }
  };

  const handleJobDescModal = (description) => {
    setSelectedJobDescription(description); // Set the selected job description
    setJobDescModalShow(true); // Show the modal
  };

  // Function to close the job description modal
  const handleCloseJobDescModal = () => setJobDescModalShow(false);

  return (
    <div>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Position Name</th>
            <th>Department</th>
            <th>Position Count</th>
            <th>Min Experience</th>
            <th>Max Experience</th>
            <th>Min Qualification</th>
            <th>Max Qualification</th>
            <th>Job Description</th>
            <th>Location</th>
            <th>Apply</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.positionName}</td>
              <td>{item.department}</td>
              <td>{item.positionCount}</td>
              <td>{item.minExperience}</td>
              <td>{item.maxExperience}</td>
              <td>{item.minQualification}</td>
              <td>{item.maxQualification}</td>
              <td>
                  <Button variant="link" onClick={() => handleJobDescModal(item.jobDescription)}>Description</Button>
                </td>
              <td>{item.location}</td>
              <td>
                <Button onClick={() => handleApplyClick(index)}>Apply</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <div className="selected-item-form">
              <div className="row ">
                <div className="col-6 form-group">
                <label htmlFor="fullName">Name: </label>
                  <input
                    type="text"
                    className="form-control"
                    value={loggedInEmployeeData.fullName}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                <label htmlFor="role">Role: </label>
                  <input
                    type="text"
                    className="form-control"
                    value={loggedInEmployeeData.role}
                    readOnly
                  />
                </div>
              </div>

              <div className="row mt-3">
        <div className="col-6 form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            className="form-control"
            value={loggedInEmployeeData?.email || ''} // Use the email from loggedInEmployeeData
            readOnly
          />
        </div>
        <div className="col-6 form-group">
          <label htmlFor="mobile">Mobile Number:</label>
          <input
            type="tel"
            className="form-control"
            value={loggedInEmployeeData?.mobile || ''} // Use the mobile number from loggedInEmployeeData
            readOnly
          />
        </div>
      </div>
              <div className="row mt-3">
                <div className="col-6 form-group">
                <label htmlFor="positionName">Position Name: </label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedItem.positionName}
                    readOnly
                  />
                </div>
                <div className="col-6 form-group">
                <label htmlFor="department">Department: </label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedItem.department}
                    readOnly
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-6 form-group">
                <label htmlFor="minExperience">Min Experience: </label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedItem.minExperience}
                    readOnly
                  />
                </div>
                <div className="col-6 form-group">
                <label htmlFor="maxExperience">Max Experience: </label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedItem.maxExperience}
                    readOnly
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-6 form-group">
                  <label htmlFor="minQualification">Min Qualification</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedItem.minQualification}
                    readOnly
                  />
                </div>
                <div className="col-6 form-group">
                  <label htmlFor="maxQualification">Max Qualification</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedItem.maxQualification}
                    readOnly
                  />
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-6 form-group">
                  <label  htmlFor="location" >Location:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedItem.location}
                    readOnly
                  />
                </div>

                <div className="col-6 form-group">
                  <label htmlFor="resumeFile">Resume:</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".jpeg, .jpg, .png, .doc, .docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                  />
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-md-12">
              <label htmlFor="jobDescription" className="form-label">
    Job Description:
  </label>
                <textarea 
                 className="form-control"
                value={selectedItem.jobDescription} readOnly />
              </div>
            </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {/* Add any other buttons as needed */}
        </Modal.Footer>
      </Modal>


      {/* Job Description Modal */}
      <Modal show={jobDescModalShow} onHide={handleCloseJobDescModal}>
        <Modal.Header closeButton>
          <Modal.Title>Job Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJobDescription}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseJobDescModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManPowerTable;
