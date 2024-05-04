import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../App';

function TDManagerTrainingList({ loggedInEmployeeName }) {
  const [trainingList, setTrainingList] = useState([]);

  useEffect(() => {
    const fetchTrainingList = async () => {
      try {
        const q = query(
          collection(db, 'traininglist'),
          where('trainer', '==', loggedInEmployeeName)
        );
        const querySnapshot = await getDocs(q);

        const trainingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrainingList(trainingData);
      } catch (error) {
        console.error('Error fetching training list: ', error);
      }
    };

    fetchTrainingList();
  }, [loggedInEmployeeName]);

  return (
    <div>
      <h2>Training List</h2>
      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Training Title</th>
            <th>Description</th>
            <th>Trainer</th>
            <th>Assigned By</th>
            <th>Employee</th>
            <th>Start Date</th>
            <th>End Date</th>

            <th>Training Conduction</th>
          </tr>
        </thead>
        <tbody>
          {trainingList.map((training, index) => (
            <tr key={training.id}>
              <td>{index + 1}</td>
              <td>{training.trainingType}</td>
              <td>{training.description}</td>
              <td>{training.trainer}</td>
              <td>{training.assignedBy}</td>
              <td>{training.employee}</td>
              <td>{training.startDate}</td>
              <td>{training.endDate}</td>
              <td>{training.trainingconduction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TDManagerTrainingList;
