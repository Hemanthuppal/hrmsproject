import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from './App';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function EmployeeDetails() {
  const { state } = useLocation();
  const loggedInEmployeeId = state?.loggedInEmployeeId;

  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModePersonalInfo, setEditModePersonalInfo] = useState(false);
  const [editModeEducationDetails, setEditModeEducationDetails] = useState(false);
  const [editModeBankDetails, setEditModeBankDetails] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'users', loggedInEmployeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEmployeeData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (loggedInEmployeeId) {
      fetchEmployeeData();
    }
  }, [loggedInEmployeeId]);

  const handleSave = async (section) => {
    try {
      const docRef = doc(db, 'users', loggedInEmployeeId);
      await updateDoc(docRef, {
        ...employeeData,
      });
      if (section === 'personalInfo') setEditModePersonalInfo(false);
      if (section === 'educationDetails') setEditModeEducationDetails(false);
      if (section === 'bankDetails') setEditModeBankDetails(false);
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleChange = (event, field) => {
    setEmployeeData((prevState) => ({
      ...prevState,
      [field]: event.target.value,
    }));
  };

  const uploadResume = async (file) => {
    const storageRef = ref(storage, `resumes/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, 'users', loggedInEmployeeId);
      await updateDoc(docRef, {
        resume: downloadURL,
      });

      setEmployeeData((prevState) => ({
        ...prevState,
        resume: downloadURL,
      }));
      
      alert('Resume successfully uploaded!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume. Please try again.');
    }
  };

  const uploadPhoto = async (file) => { // Function to upload profile photo
    const storageRef = ref(storage, `photos/${file.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const docRef = doc(db, 'users', loggedInEmployeeId);
      await updateDoc(docRef, {
        photo: downloadURL,
      });

      setEmployeeData((prevState) => ({
        ...prevState,
        photo: downloadURL,
      }));
      
      alert('Profile photo successfully uploaded!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    }
  };

  if (!employeeData) return <div></div>;

  return (
    <div style={{
      padding: '20px', maxWidth: '1200px', margin: '20px auto',
      backgroundColor: '#9f9f9f', borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,.1)', display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img src={employeeData.photo} alt="Employee"
             style={{ borderRadius: '50%', width: '120px', height: '120px', objectFit: 'cover', marginRight: '20px' }} />
        <div>
          <h2 style={{ margin: 0 }}>{employeeData.fullName}</h2>
          <p style={{ margin: 0 }}>{employeeData.role}</p>
        </div>
      </div>

      <EditableSection
        title="Personal Information"
        data={employeeData}
        editMode={editModePersonalInfo}
        setEditMode={setEditModePersonalInfo}
        handleSave={() => handleSave('personalInfo')}
        handleChange={handleChange}
        fields={['fullName','fatherName', 'dob', 'gender', 'mobile', 'address', 'aadhaarNumber','photo']}
        uploadPhoto={uploadPhoto}
      />

      <EditableSection
        title="Education Details"
        data={employeeData}
        editMode={editModeEducationDetails}
        setEditMode={setEditModeEducationDetails}
        handleSave={() => handleSave('educationDetails')}
        handleChange={handleChange}
        fields={['education', 'specialisation', 'resume']}
        uploadResume={uploadResume}
      />

      <EditableSection
        title="Bank Details"
        data={employeeData}
        editMode={editModeBankDetails}
        setEditMode={setEditModeBankDetails}
        handleSave={() => handleSave('bankDetails')}
        handleChange={handleChange}
        fields={['accountHolderName', 'accountNumber', 'bank', 'branch', 'ifsc']}
      />
    </div>
  );
}

function EditableSection({
  title,
  data,
  editMode,
  setEditMode,
  handleSave,
  handleChange,
  fields,
  uploadResume,
  uploadPhoto // New prop for uploading profile photo
}) {
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && uploadResume) {
      await uploadResume(file);
    }
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file && uploadPhoto) {
      await uploadPhoto(file);
    }
  };

  const viewPhoto = () => {
    window.open(data.photo, '_blank');
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '20px', margin: '20px 0', borderRadius: '5px', position: 'relative', width:'80%',marginLeft:'100px' }}>
      <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>{title}</h3>
      
      {editMode ? (
        <button 
          onClick={() => handleSave(title.toLowerCase().replace(/ /g, ''))}
          style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 16px' }}>
          Save
        </button>
      ) : (
        <button 
          onClick={() => setEditMode(true)}
          style={{ position: 'absolute', top: '20px', right: '20px', backgroundColor: 'blue', color: 'white', border: 'none', borderRadius: '5px', padding: '8px 16px' }}>
          Edit
        </button>
      )}

      {fields.map((field) => {
        const labelWidth = 250;
        const inputStyles = {
          marginLeft: '10px',
          marginTop: editMode ? '10px' : '0' // Add margin top when in edit mode
        };

        if (editMode && field === 'resume') {
          return (
            <div key={field}>
              <strong style={{ display: 'inline-block', width: `${labelWidth}px` }}>Resume:</strong>
              <input
                type="file"
                onChange={handleFileChange}
                style={inputStyles}
              />
            </div>
          );
        } else if (editMode && field === 'photo') { // Add a condition for profile photo
          return (
            <div key={field}>
              <strong style={{ display: 'inline-block', width: `${labelWidth}px` }}>Profile Photo:</strong>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={inputStyles}
              />
            </div>
          );
        } else if (editMode) {
          return (
            <div key={field}>
              {/* Ensure the JavaScript expression for dynamic width is within curly braces */}
              <strong style={{ display: 'inline-block', width: `${labelWidth}px` }}>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
              <input
                type="text"
                value={data[field] || ''}
                onChange={(e) => handleChange(e, field)}
                style={inputStyles}
              />
            </div>
          );
        } else {
          return (
            <p key={field}>
              {/* Ensure the JavaScript expression for dynamic width is within curly braces */}
              <strong style={{ display: 'inline-block', width: `${labelWidth}px` }}>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:</strong>
              {field === 'resume' ? <a href={data[field]} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>View Resume</a> :
                field === 'photo' ? <a href="#" onClick={viewPhoto} style={{textDecoration: 'none'}}>View Photo</a> : data[field]}
            </p>
          );
        }
        
      })}
    </div>
  );
}


export default EmployeeDetails;