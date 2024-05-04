import React from 'react';

function AdminEmployeeLeavesDashboard({ setActivePage }) {
  const handlePageChange = (page) => {
    // Call the parent component's setActivePage function
    setActivePage(page);
  };

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
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managerpayslips')}>
        <span style={dashboardLinkStyle}>Payslips </span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managerexpensesstatus')}>
        <span style={dashboardLinkStyle}>Expenses</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managerfinalsettlement')}>
        <span style={dashboardLinkStyle}>Final Settlements </span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managerloan')}>
        <span style={dashboardLinkStyle}>Loans</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('managersalaryadvance')}>
        <span style={dashboardLinkStyle}>Salary Advance</span>
        {/* Display additional information here if needed */}
      </div>
     


    </div>
  );
}

export default AdminEmployeeLeavesDashboard;
