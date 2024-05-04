import React from 'react';

function AdminEmployeeLeavesDashboard({ setActivePage }) {
  

  const dashboardBoxStyle = {
    // Your styling here
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f9f9f9',
    marginBottom: '20px',
  };

  const dashboardLinkStyle = {
    textDecoration: 'none',
    color: '#333',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managerleaveapplication')}>
        <span style={dashboardLinkStyle}>Managers Leaves</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeeleaveapplication')}>
        <span style={dashboardLinkStyle}>Employee Leaves</span>
        {/* Display additional information here if needed */}
      </div>
    
    </div>
  );
}

export default AdminEmployeeLeavesDashboard;