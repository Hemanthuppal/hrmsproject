import React, { useState } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

// Import necessary functions
import { app } from '../App';

function AddLeaveType({ user }) {
  const [leaveName, setLeaveName] = useState('');
  const [leaveCode, setLeaveCode] = useState('');
  const [description, setDescription] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Added loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set loading state to true when starting the addition
    setIsAdding(true);

    // Get the db instance from firebaseApp
    const db = getFirestore(app);
    const collectionRef = collection(db, 'leave_types');

    const data = {
      leaveName,
      leaveCode,
      description,
    };

    try {
      const docRef = await addDoc(collectionRef, data);

      setLeaveName('');
      setLeaveCode('');
      setDescription('');

      console.log('Leave type added to Firestore with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding leave type:', error);
    } finally {
      // Set loading state to false after the addition, whether successful or not
      setIsAdding(false);
    }
  };

  return (
    <body>
      <div className="container-fluid mobile">
        <div className="row r2">
          <div className="col-1"></div>
          <div className="col-10">
           
            <form className="form-control" onSubmit={handleSubmit}>
              <center>
                <h5>Add Leave Type</h5>
              </center>

              <div className="">
                <label id="leaves" htmlFor="leave_name">
                  Leave Type:
                </label>
                <input
                  className="form-control"
                  id="leave_name"
                  type="text"
                  name="leave_name"
                  value={leaveName}
                  onChange={(e) => setLeaveName(e.target.value)}
                  required
                />
              </div>
              <br />

              <div className="">
                <label id="leaves" htmlFor="leave_code">
                  Leave Type Code:
                </label>
                <input
                  className="form-control"
                  id="leave_code"
                  type="text"
                  name="leave_code"
                  value={leaveCode}
                  onChange={(e) => setLeaveCode(e.target.value)}
                  maxLength="10"
                  required
                />
              </div>

              <div className="">
                <label id="leaves" htmlFor="description">
                  Description:
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  id="description"
                  rows="2"
                  cols="30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <br />

              <div className="">
                <center>
                  <button type="submit" name="button" className="btn btn-sm btn-primary text-white small-btn small-btn" disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add'}
                  </button>
                  
                </center>
              </div>
            </form>
          </div>
          <div className="col-md-1"></div>
        </div>
        <div className="row r3"></div>
      </div>
    </body>
  );
}

export default AddLeaveType;
