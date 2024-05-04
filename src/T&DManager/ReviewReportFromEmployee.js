import React, { useEffect, useState } from 'react';
import { collection, getDocs,query,where } from 'firebase/firestore';
import { db } from '../App';

function TrainingFeedbackList({loggedInEmployeeName}) {
  const [feedbackList, setFeedbackList] = useState([]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
 
  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const feedbackCollection = collection(db, 'trainingFeedback');
        const q = query(feedbackCollection, where('trainer', '==', loggedInEmployeeName));
        const querySnapshot = await getDocs(q);

        const feedbackData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbackList(feedbackData);
      } catch (error) {
        console.error('Error fetching feedback data:', error);
      }
    };

    fetchFeedbackData();
  }, [loggedInEmployeeName,formatDate]); 

  return (
    <div>
      <h2>Training Feedback</h2>
      <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Trainer</th>
            <th>Employee</th>
            <th>Training Title</th>
            {/* <th>Trainer ID</th>
            <th>Role</th> */}
            {/* <th>Content</th>
            <th>Presentation</th> */}
           
            
            {/* <th>Relevance of Content</th>
            <th>Effectiveness of Materials</th> */}
            <th>Trainer Knowledge & Communication</th>
            <th>Training Organization & Structure</th>
            <th>Practical Exercises</th>
            <th>Clarity of Objectives</th>
            <th>Opportunities for Questions</th>
            <th>Facilities and Equipment</th>
            <th>Overall Experience</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.map((feedback) => (
            <tr key={feedback.id}>
              <td>{formatDate(feedback.date)}</td>
              <td>{feedback.trainer}</td>
              <td>{feedback.EmployeeName}</td>
              <td>{feedback.trainingTitle}</td>
              {/* <td>{feedback.employeeId}</td>
              <td>{feedback.role}</td> */}
              {/* <td>{feedback.content}</td>
              <td>{feedback.presentation}</td> */}
             
              
              {/* <td>{feedback.relevanceOfContent}</td>
              <td>{feedback.effectivenessOfMaterials}</td> */}
              <td>{feedback.trainerKnowledgeCommunication}</td>
              <td>{feedback.trainingOrganizationStructure}</td>
              <td>{feedback.practicalExercises}</td>
              <td>{feedback.clarityOfObjectives}</td>
              <td>{feedback.opportunitiesForQuestions}</td>
              <td>{feedback.facilitiesAndEquipment}</td>
              <td>{feedback.overallExperience}</td>
              <td>{feedback.feedback}</td>
              {/* Add additional fields as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrainingFeedbackList;
