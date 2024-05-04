import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';

const holidays = [
  { date: '2024-01-01', name: 'New Year' },
  { date: '2024-01-15', name: 'Makara Sankranti' },
  { date: '2024-04-09', name: 'Ugadi Festival' },
  { date: '2024-04-11', name: 'Khutub-E-Ramzan' },
  { date: '2024-04-17', name: 'Sri Rama Navami' },
  { date: '2024-05-10', name: 'Basava Jayanthi/Akshaya Tritiya' },
  { date: '2024-06-17', name: 'Bakrid(Eid-ul-Adha)' },
  { date: '2024-09-07', name: 'Varasidhi Vinayaka Vrata' },
  { date: '2024-09-16', name: 'Eid Milad' },
  { date: '2024-10-11', name: 'Mahanavami/Ayudhapooja' },
  { date: '2024-11-02', name: 'Balipadyami, Deepavali' },
  { date: '2024-12-25', name: 'Christmas' },
];

// Function to convert date from YYYY-MM-DD to DD-MM-YYYY
function formatIndianDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}-${month}-${year}`;
}

const HolidayCalendar = () => {
  return (
    <Grid container spacing={2} sx={{ mx: 'auto', maxWidth: 'lg', width: '100%' }}>
    {holidays.map((holiday, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {formatIndianDate(holiday.date)} {/* Use the format function */}
              </Typography>
              <Typography variant="h5" component="h2">
                {holiday.name}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default HolidayCalendar;
