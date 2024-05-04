import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


function Payout() {
  const location = useLocation();
  const loggedInEmployeeId = location.state?.loggedInEmployeeId;

  const [payout, setPayout] = useState(null);

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const db = getFirestore();

        // Get the user document based on loggedInEmployeeId
        const userDocRef = doc(db, 'users', loggedInEmployeeId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Extract employeeId from the user document
          const { employeeId } = userDocSnap.data();

          // Construct the path for the payout document
          const payoutDocRef = doc(db, 'payout', `${employeeId}_1_2024`);
          const payoutDocSnap = await getDoc(payoutDocRef);

          if (payoutDocSnap.exists()) {
            // Set the payout data in the state
            setPayout({ id: payoutDocSnap.id, ...payoutDocSnap.data() });
          } else {
            console.log('Payout document not found for the selected employee.');
          }
        } else {
          console.log('User document not found for the selected employee.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPayout();
  }, [loggedInEmployeeId]);

  return (
    <div className="container">
      <div className="row r2">
        <div className="col-md-12 mt-3">
          <h4 id="welcome" className='text-center'>Payout </h4>
          {payout ? (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Gross Salary</th>
                  <th>Total Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Method</th>
                  <th>Overtime Pay</th>
                  <th>Bonuses</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{payout.employeeId}</td>
                  <td>{payout.fullName}</td>
                  <td>{payout.grossSalary}</td>
                  <td>{payout.totalDeductions}</td>
                  <td>{payout.netSalary}</td>
                  <td>{payout.paymentMethod}</td>
                  <td>{payout.overtimePay}</td>
                  <td>{payout.bonuses}</td>
                  <td>{payout.remarks}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
      <div className="row r3"></div>
    </div>
  );
}

export default Payout;
