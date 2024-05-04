import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './App';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const localizer = momentLocalizer(moment);

  useEffect(() => {
    const fetchHolidays = async () => {
      const holidaysCollection = collection(db, 'holidays');
      const holidaysSnapshot = await getDocs(holidaysCollection);
      const holidayList = holidaysSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Transform holidays data into events format required by react-big-calendar
      const events = holidayList.map((holiday) => ({
        id: holiday.id,
        title: holiday.festival,
        start: new Date(formatDate(holiday.date)),
        end: new Date(formatDate(holiday.date)),
      }));

      setHolidays(events);
    };

    fetchHolidays();
  }, []);

  return (
    <div>
      <h2 className='text-center'>Holidays</h2>
      <Calendar
        localizer={localizer}
        events={holidays}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
}

export default Holidays;
