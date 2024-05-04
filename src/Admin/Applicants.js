import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../App";

const Applicants = () => {
  const [applicantsData, setApplicantsData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = applicantsData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(applicantsData.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }

  useEffect(() => {
    const fetchApplicantsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Applicants"));
        const applicantsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setApplicantsData(applicantsData);
      } catch (error) {
        console.error("Error fetching applicants data: ", error);
      }
    };

    fetchApplicantsData();
  }, []);

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, "_blank");
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
          {records.map((applicant, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{applicant.fullName}</td>
              <td>{applicant.role}</td>
              <td>{applicant.positionName}</td>
              <td>{applicant.email}</td>
              <td>{applicant.mobile}</td>
              <td>NA</td>
              <td>
                <div>{applicant.r2Status}</div>
              </td>
              <td>
                <button
                  style={{
                    background: "none",
                    color: "blue",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    cursor: "pointer",
                    outline: "inherit",
                  }}
                  onClick={() => handleViewResume(applicant.resumeUrl)}
                >
                  Resume
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav aria-label="Page navigation example" style={{ position: "sticky", bottom: "5px", right: "10px", cursor: "pointer" }}>
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Previous" onClick={prePage}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {numbers.map((n, i) => (
            <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
              <a className="page-link" onClick={() => changeCPage(n)}>
                {n}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === npage ? "disabled" : ""}`}>
            <a className="page-link" aria-label="Next" onClick={nextPage}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Applicants;
