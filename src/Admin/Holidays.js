import React, { useState } from 'react';
import { getFirestore, addDoc, collection } from 'firebase/firestore';

// Import necessary functions
import { app } from '../App';

function AddHoliday() {
  const [date, setDate] = useState('');
  const [day, setDay] = useState('');
  const [festival, setFestival] = useState('');
  const [isAdding, setIsAdding] = useState(false); // Added loading state

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any field is empty
    if (!date || !day || !festival) {
      console.error('All fields are required');
      return;
    }

    // Set loading state to true when starting the addition
    setIsAdding(true);

    // Get the db instance from firebaseApp
    const db = getFirestore(app);
    const collectionRef = collection(db, 'holidays');

    const data = {
      date,
      day,
      festival,
    };

    try {
      const docRef = await addDoc(collectionRef, data);

      setDate('');
      setDay('');
      setFestival('');
      alert('Holiday added successfully!');
      console.log('Holiday added to Firestore with ID:', docRef.id);
    } catch (error) {
      console.error('Error adding holiday:', error);
    } finally {
      // Set loading state to false after the addition, whether successful or not
      setIsAdding(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    // Calculate the day based on the selected date
    const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    setDay(selectedDay);
  };

  const handleFestivalChange = (e) => {
    const input = e.target.value;
    // Allow only letters and spaces
    const filteredInput = input.replace(/[^a-zA-Z\s]/g, '');
    setFestival(filteredInput);
  };

  return (
    <body>
      <div className="container-fluid mobile">
        <div className="row r2">
          <div className="col-1"></div>
          <div className="col-10">
            <form className="form-control" onSubmit={handleSubmit}>
              <center>
                <h5>Add Holiday</h5>
              </center>

              <div className="">
                <label htmlFor="date">Date:</label>
                <input
                  className="form-control"
                  id="date"
                  type="date"
                  name="date"
                  value={date}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]} // Set minimum date to today
                  required
                />
              </div>
              <br />

              <div className="">
                <label htmlFor="day">Day:</label>
                <input
                  className="form-control"
                  id="day"
                  type="text"
                  name="day"
                  value={day}
                  readOnly // Make it read-only to display the calculated day
                  required
                />
              </div>
              <br />

              <div className="">
                <label htmlFor="festival">Festival:</label>
                <input
                  className="form-control"
                  id="festival"
                  type="text"
                  name="festival"
                  value={festival}
                  onInput={handleFestivalChange} // Use onInput to filter input in real-time
                  required
                />
              </div>
              <br />

              <div className="">
                <center>
                  <button type="submit" name="button"  style={{ fontSize: '1.2em', padding: '5px 20px' }} className="btn btn-sm btn-primary text-white small-btn small-btn" disabled={isAdding}>
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

export default AddHoliday;
