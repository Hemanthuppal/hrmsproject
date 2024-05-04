import React from 'react';

function AdminEmployeePayslipDashboard({ setActivePage }) {
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
      <div style={dashboardBoxStyle} onClick={() => setActivePage('payslips')}>
        <span style={dashboardLinkStyle}>Payslip Details</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeeexpenses')}>
        <span style={dashboardLinkStyle}>Expenses Approval</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('payoutdisbursements')}>
        <span style={dashboardLinkStyle}>Payouts</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeeloan')}>
        <span style={dashboardLinkStyle}>Loans</span>
        {/* Display additional information here if needed */}
      </div>




      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeefinalsettlement')}>
        <span style={dashboardLinkStyle}>Final Settlement</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeeadvance')}>
        <span style={dashboardLinkStyle}>SalaryAdvance</span>
        {/* Display additional information here if needed */}
      </div>
    
      <div style={dashboardBoxStyle} onClick={() => setActivePage('employeepayslip')}>
        <span style={dashboardLinkStyle}>Payslip</span>
        {/* Display additional information here if needed */}
      </div>
    </div>
  );
}

export default AdminEmployeePayslipDashboard;
