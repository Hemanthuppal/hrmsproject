import React, { useState } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../App'; // Ensure this is the correct import for your Firebase app instance

function SubmitPolicy() {
  const [policyName, setPolicyName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [policyDocument, setPolicyDocument] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policies, setPolicies] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) {
    return; // Prevent multiple submissions
  }

  setIsSubmitting(true); // Indicate that submission is in progress

  const storage = getStorage(app);
  const db = getFirestore(app);

  try {
    // Check if a policy document file is selected
    if (!policyDocument) {
      throw new Error("Please upload a policy document.");
    }

    // Upload the policy document to Firebase Storage
    const policyDocumentRef = storageRef(storage, 'policies/${department}/${policyDocument.name}');
    const snapshot = await uploadBytes(policyDocumentRef, policyDocument);
    const policyDocumentUrl = await getDownloadURL(snapshot.ref);

    // Prepare policy data
    const policyData = {
      policyName,
      description,
      department,
      policyDocumentUrl,
      created: new Date() // Storing the current date
    };

    // Save the policy in the policies collection
    await addDoc(collection(db, "policies"), policyData);

    alert("Policy submitted successfully!");
  } catch (error) {
    console.error("Error submitting policy:", error);
    alert("An error occurred while submitting the policy. Please check the console for details.");
  } finally {
    setIsSubmitting(false); // Reset submission state
  }

  // Reset form fields after submission
  setPolicyName('');
  setDescription('');
  setDepartment('');
  setPolicyDocument(null);
};

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="policyName" className="form-label">Policy Name:</label>
          <input
            type="text"
            className="form-control"
            id="policyName"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description:</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="department" className="form-label">Department:</label>
          <select
            className="form-select"
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="IT">IT</option>
            {/* Add other departments as needed */}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="policyDocument" className="form-label">Upload Policy Document:</label>
          <input
            type="file"
            className="form-control"
            id="policyDocument"
            onChange={(e) => setPolicyDocument(e.target.files[0])} // Assuming single file upload
            required
          />
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Policy'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubmitPolicy;