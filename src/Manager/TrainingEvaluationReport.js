import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

function TrainingEvaluationReport({loggedInEmployeeName}) {
  const [evaluationData, setEvaluationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10); // State for records per page
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = evaluationData.slice(firstIndex, lastIndex);
  const npage = Math.ceil(evaluationData.length / recordsPerPage);
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
    const fetchEvaluationData = async () => {
      try {
        const db = getFirestore();
        const evaluationCollection = collection(db, 'TrainingEvaluationPoints');
        const q = query(evaluationCollection, where('assignedManager', '==', loggedInEmployeeName));
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEvaluationData(data);
      } catch (error) {
        console.error('Error fetching evaluation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluationData();
  }, [loggedInEmployeeName]);

  return (
    <div>
      <h3>Training Evaluation Report</h3>
      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Full Name</th>
            <th>Training Type</th>
            <th>Trainer</th>
            <th>Total Points</th>
            <th>Average Points</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {records.map((evaluation,index) => (
            <tr key={evaluation.id}>
              <td>{index + 1}</td> 
              <td>{evaluation.date}</td>
              <td>{evaluation.fullName}</td>
              <td>{evaluation.trainingType}</td>
              <td>{evaluation.trainer}</td>
              <td>{evaluation.totalPoints}</td>
              <td>{evaluation.averagePoints}</td>
              <td>{evaluation.remarks}</td>
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

export default TrainingEvaluationReport;
