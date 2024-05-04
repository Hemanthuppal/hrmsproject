import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { app } from '../App';

function DisplayPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = policies.slice(firstIndex, lastIndex);
  const npage = Math.ceil(policies.length / recordsPerPage);
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
    const db = getFirestore(app);
    const policiesCollectionRef = collection(db, 'policies');
    const q = query(policiesCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const policiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolicies(policiesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const db = getFirestore(app);
    const policiesCollectionRef = collection(db, 'policies');
    const q = query(policiesCollectionRef); // You can specify queries to filter data

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const policiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPolicies(policiesList);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Policy List</h2>
      </div>
      
      <table className="styled-table">
        <thead>
          <tr>
            <th>Policy Name</th>
            <th>Description</th>
            <th>Department</th>
            <th>Date Created</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          {records.map((policy) => (
            <tr key={policy.id}>
              <td>{policy.policyName}</td>
              <td>{policy.description}</td>
              <td>{policy.department}</td>
              <td>{policy.created.toDate().toLocaleDateString()}</td>
              <td>
                <a href={policy.policyDocumentUrl} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
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
}

export default DisplayPolicies;
