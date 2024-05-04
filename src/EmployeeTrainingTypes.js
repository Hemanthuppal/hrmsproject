import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from './App';
import { useLocation } from 'react-router-dom';
const ExploreTrainingTypes = ({  }) => {
  const location = useLocation();  // Use useLocation hook
  const loggedInEmployeeId = location.state.loggedInEmployeeId;
  const [loggedInEmployeeName, setLoggedInEmployeeName] = useState('');
  const [employeeData, setEmployeeData] = useState('');
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [requestedTrainings, setRequestedTrainings] = useState([]);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const employeesRef = collection(db, 'users');
        const querySnapshot = await getDocs(employeesRef);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          if (doc.id === loggedInEmployeeId) {
            setEmployeeData(employeeData);
            setLoggedInEmployeeName(employeeData.fullName);
            console.log("Name=",employeeData.fullName)
          }
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
      }
    };

    fetchEmployeeDetails();
  }, [loggedInEmployeeId]);


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  useEffect(() => {
    const fetchTrainingTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'trainingtype'));
        const typesData = [];
        querySnapshot.forEach((doc) => {
          typesData.push({ id: doc.id, ...doc.data() });
        });
        setTrainingTypes(typesData);
      } catch (error) {
        console.error('Error fetching training types: ', error);
      }
    };

    const fetchRequestedTrainings = async () => {
      try {
        // Check if employeeData is not null or undefined
        if (employeeData && employeeData.assignedManagerUid) {
          const querySnapshot = await getDocs(collection(db, `requests_${employeeData.assignedManagerUid}`));
          const requestedTrainingsData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(requestedTraining => requestedTraining.employeeName === loggedInEmployeeName);

          setRequestedTrainings(requestedTrainingsData);
        }
      } catch (error) {
        console.error('Error fetching requested trainings: ', error);
      }
    };

    fetchTrainingTypes();
    fetchRequestedTrainings();
  }, [employeeData, loggedInEmployeeName]);

  const handleRequest = async (trainingTypeId) => {
    try {
        const trainingTypeDoc = await getDoc(doc(db, 'trainingtype', trainingTypeId));
        const trainingTypeData = trainingTypeDoc.data();

        const currentDate = new Date().toISOString();

        // Check if employeeData is not null or undefined
        if (employeeData && employeeData.assignedManagerUid) {
            const requestDocRef = await addDoc(collection(db,   `requests_${employeeData.assignedManagerUid}`), {
                employeeId: loggedInEmployeeId,
                employeeName: loggedInEmployeeName,
                trainingTypeId: trainingTypeId,
                trainingTypeTitle: trainingTypeData.type,
                trainingTypeDescription: trainingTypeData.description,
                requestedDate: currentDate,
                status: 'Requested',
            });

            console.log('Request added with ID: ', requestDocRef.id);

            // Update requestedTrainings state with the new request
            setRequestedTrainings(prevTrainings => [
                ...prevTrainings,
                {
                    id: requestDocRef.id,
                    employeeId: loggedInEmployeeId,
                    employeeName: loggedInEmployeeName,
                    trainingTypeId: trainingTypeId,
                    trainingTypeTitle: trainingTypeData.type,
                    trainingTypeDescription: trainingTypeData.description,
                    requestedDate: currentDate,
                    status: 'Requested',
                },
            ]);

            // Display success alert
            window.alert('Training request added Successfully');
        }
    } catch (error) {
        console.error('Error adding request: ', error);
    }
};

  return (
    <div>
      <h3 className="text-center ">Trainings: Explore</h3>
      <table  className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Training Title</th>
            <th>Description</th>
            <th>Trainer</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Training Conduction</th>
            <th>Training Duration</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {trainingTypes.map((trainingType, index) => (
            <tr key={trainingType.id}>
              <td>{index + 1}</td>
              <td>{trainingType.type}</td>
              <td>{trainingType.description}</td>
              <td>{trainingType.trainer}</td>
              <td>{formatDate(trainingType.startDate)}</td>
              <td>{formatDate(trainingType.endDate)}</td>
              <td>{trainingType.trainingConduction}</td>
              <td>{trainingType.duration}</td>
              
              <td>
                <button onClick={() => handleRequest(trainingType.id)}>Request</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {requestedTrainings.length > 0 && (
        <>
          <h3 className="text-center mt-5">Requested Trainings</h3>
          <table className="styled-table" border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Training Title</th>
                <th>Description</th>
                {/* <th>Start Date</th>
                <th>End Date</th> */}
                
                <th>Requested Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requestedTrainings.map((requestedTraining, index) => (
                <tr key={requestedTraining.id}>
                  <td>{index + 1}</td>
                  <td>{requestedTraining.trainingTypeTitle}</td>
                  <td>{requestedTraining.trainingTypeDescription}</td>
                  {/* <td>{requestedTraining.startDate}</td>
                  <td>{requestedTraining.endDate}</td> */}
                  <td>{requestedTraining.requestedDate}</td>
                  <td style={{ color: requestedTraining.status === 'Approved' ? 'green' : (requestedTraining.status === 'Rejected' ? 'red' : 'orange') }}><b>{requestedTraining.status}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ExploreTrainingTypes;
