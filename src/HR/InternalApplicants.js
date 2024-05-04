import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc} from "firebase/firestore";
import { db } from '../App';

const Applicants = () => {
  const [applicantsData, setApplicantsData] = useState([]);

  useEffect(() => {
    const fetchApplicantsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Applicants"));
        const applicantsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplicantsData(applicantsData);
      } catch (error) {
        console.error("Error fetching applicants data: ", error);
      }
    };

    fetchApplicantsData();
  }, []);

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      const applicantRef = doc(db, "Applicants", applicantId);
      await updateDoc(applicantRef, { r2Status: newStatus });

      setApplicantsData(applicantsData.map(applicant => 
        applicant.id === applicantId ? { ...applicant, r2Status: newStatus } : applicant
      ));
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };


  return (
    <div>
      <h2>Applicants</h2>
      <table className="styled-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Full Name</th>
            <th>Role</th>
            <th>Position Name</th>
           <th>Email</th>
           <th>Mobile Number</th>
           <th>R1 Status</th>
           <th>R2 Status</th>
            <th>Resume</th>
          </tr>
        </thead>
        <tbody>
          {applicantsData.map((applicant, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{applicant.fullName}</td>
              <td>{applicant.role}</td>
             <td>{applicant.positionName}</td>
             <td>{applicant.email}</td>
             <td>{applicant.mobile}</td>
             <td>NA</td>
             <td>
              <select
                value={applicant.r2Status || ""}
                onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
              <div>{applicant.r2Status}</div>
            </td>
             <td>
                <button
                 style={{ 
                    background: 'none',
                    color: 'blue',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    cursor: 'pointer',
                    outline: 'inherit'
                  }}
                 onClick={() => handleViewResume(applicant.resumeUrl)}>
                 Resume
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Applicants;