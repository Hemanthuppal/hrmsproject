import React from 'react';

function PayslipDashboard({ setCurrentPage }) {
  // Styles
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
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('payslip')}>
        <span style={dashboardLinkStyle}>Payslip Details</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('expensesapproval')}>
        <span style={dashboardLinkStyle}>Expenses Approval</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('payoutdisbursements')}>
        <span style={dashboardLinkStyle}>Payouts</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('loanapproval')}>
        <span style={dashboardLinkStyle}>Loans</span>
        {/* Display additional information here if needed */}
      </div>




      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('finalsettlement')}>
        <span style={dashboardLinkStyle}>Final Settlement</span>
        {/* Display additional information here if needed */}
      </div>
      <div style={dashboardBoxStyle} onClick={() => setCurrentPage('advancesalaryapplication')}>
        <span style={dashboardLinkStyle}>SalaryAdvance</span>
        {/* Display additional information here if needed */}
      </div>
    
    
    </div>
  );
}

export default PayslipDashboard;
