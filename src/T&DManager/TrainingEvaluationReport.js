import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs,query,where } from 'firebase/firestore';

function TrainingEvaluationReport({loggedInEmployeeName}) {
  const [evaluationData, setEvaluationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const db = getFirestore();
        const evaluationCollection = collection(db, 'TrainingEvaluationPoints');
        const q = query(evaluationCollection, where('trainer', '==', loggedInEmployeeName));
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

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      <h3>Training Evaluation Report</h3>
      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
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
          {evaluationData.map((evaluation) => (
            <tr key={evaluation.id}>
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
    </div>
  );
}

export default TrainingEvaluationReport;
