import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { query, collection, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from './App';

function ReviewOnTrainer({ loggedInEmployeeId, loggedInEmployeeName }) {
  console.log("loggedInEmployeeName=", loggedInEmployeeName);
  const [managerData, setManagerData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    trainer: '',
    trainerId: '',
    role: '',
    content: '',
    presentation: '',
    feedback: '',
    overallExperience: '',
    relevanceOfContent: '',
    effectivenessOfMaterials: '',
    trainerKnowledgeCommunication: '',
    trainingOrganizationStructure: '',
    practicalExercises: '',
    clarityOfObjectives: '',
    opportunitiesForQuestions: '',
    facilitiesAndEquipment: '',
    trainingTitle: '', // Add this line
  });
  const [trainingList, setTrainingList] = useState([]);

  const fetchManagerNames = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'Manager'),where('department', '==', 'Training and Development') );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        fullName: doc.data().fullName,
        employeeId: doc.data().employeeId,
        role: doc.data().role,
      }));

      // Log manager UIDs to the console
      console.log('Manager UIDs:', data.map(manager => manager.uid));

      setManagerData(data);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };

  useEffect(() => {
    
    fetchManagerNames();
  }, []); 

  const handleInputChange = async (e) => {
  const { name, value } = e.target;

  if (name === 'trainer') {
    const selectedManager = managerData.find((manager) => manager.fullName === value);

    try {
      // Fetch training list based on the selected trainer
      const trainingListSnapshot = await getDocs(query(collection(db, 'traininglist'), 
        where('trainer', '==', value),
        where('assignedToUid', '==', loggedInEmployeeId)
      ));

      const listData = trainingListSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Log the assignedBy field of each object in listData
      listData.forEach(item => console.log("assignedBy:", item.assignedBy));
      
      setTrainingList(listData);
      console.log("listData:", listData);
    } catch (error) {
      console.error('Error fetching training list:', error);
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      employeeId: selectedManager ? selectedManager.employeeId : '',
      role: selectedManager ? selectedManager.role : '',
    }));
  } else {
    setFormData({
      ...formData,
      [name]: value,
    });
  }
};

  
  
const handleFormSubmit = async (e) => {
  e.preventDefault();

  try {
    // Fetch user document and assignedManager value
    // const userDoc = await getDocs(collection(db, 'users', loggedInEmployeeId));
    // const userData = userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;

    // if (!userData) {
    //   console.error('User not found with ID: ', loggedInEmployeeId);
    //   return;
    // }

    // Find the selected training item from listData
    const selectedTraining = trainingList.find(training => training.trainingType === formData.trainingTitle);

    // Check if selectedTraining is found and it has assignedBy field
    const assignedBy = selectedTraining ? selectedTraining.assignedBy : null;

    const formDataWithLoggedInEmployee = {
      ...formData,
      EmployeeName: loggedInEmployeeName,
      assignedManager: assignedBy,
      // assignedBy: assignedBy, 
      selectedTrainingType: formData.trainingTitle,
    };

    const docRef = await addDoc(collection(db, 'trainingFeedback'), formDataWithLoggedInEmployee);

    console.log('Document written with ID: ', docRef.id);

    setFormData({
      date: '',
      trainer: '',
      employeeId: '',
      role: '',
      content: '',
      presentation: '',
      feedback: '',
      overallExperience: '',
      relevanceOfContent: '',
      effectivenessOfMaterials: '',
      trainerKnowledgeCommunication: '',
      trainingOrganizationStructure: '',
      practicalExercises: '',
      clarityOfObjectives: '',
      opportunitiesForQuestions: '',
      facilitiesAndEquipment: '',
      trainingTitle: '', // Add this line if it's necessary to reset trainingTitle
    });
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

  


  return (
    <div className="container">
      <form onSubmit={handleFormSubmit}>
        <h2>Review On Training</h2>
        <div className="row">
          <div className="col-6">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={formData.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-6">
            <label htmlFor="trainer">Trainer:</label>
            <select
              name="trainer"
              className="form-select"
              value={formData.trainer}
              onChange={handleInputChange}
            >
              <option value="">Select a Trainer</option>
              {managerData.map((manager) => (
                <option key={manager.uid} value={manager.fullName}>
                  {manager.fullName}
                </option>
              ))}
            </select>
          </div>
         
          <div className="col-6">
  <label htmlFor="trainingTitle">Training Title:</label>
  <select
    name="trainingTitle"
    className="form-select"
    value={formData.trainingTitle}
    onChange={handleInputChange}
  >
    <option value="">Select </option>
    {trainingList.map((training) => (
      <option key={training.id} value={training.trainingType}>
        {training.trainingType}
      </option>
    ))}
  </select>
</div>
          <div className="col-6">
            <label htmlFor="trainerKnowledgeCommunication">Trainer Knowledge & Communication:</label>
            <select
              name="trainerKnowledgeCommunication"
              className="form-select"
              value={formData.trainerKnowledgeCommunication}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="trainingOrganizationStructure">Training Organization & Structure:</label>
            <select
              name="trainingOrganizationStructure"
              className="form-select"
              value={formData.trainingOrganizationStructure}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="practicalExercises">Practical Exercises:</label>
            <select
              name="practicalExercises"
              className="form-select"
              value={formData.practicalExercises}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="clarityOfObjectives">Clarity of Objectives:</label>
            <select
              name="clarityOfObjectives"
              className="form-select"
              value={formData.clarityOfObjectives}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="opportunitiesForQuestions">Opportunities for Questions:</label>
            <select
              name="opportunitiesForQuestions"
              className="form-select"
              value={formData.opportunitiesForQuestions}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="facilitiesAndEquipment">Facilities and Equipment:</label>
            <select
              name="facilitiesAndEquipment"
              className="form-select"
              value={formData.facilitiesAndEquipment}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="overallExperience">Overall Experience:</label>
            <select
              name="overallExperience"
              className="form-select"
              value={formData.overallExperience}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="feedback">Remarks:</label>
            <textarea
              name="feedback"
              className="form-select"
              value={formData.feedback}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="col-12 mt-3">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReviewOnTrainer;
