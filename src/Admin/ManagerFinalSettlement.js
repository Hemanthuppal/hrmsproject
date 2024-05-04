import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';

function FinalSettlementStatus() {
  const [settlementData, setSettlementData] = useState([]);

  const fetchManagerUids = async () => {
    try {
      const userQuery = query(collection(db, 'users'), where('role', '==', 'Manager'));
      const querySnapshot = await getDocs(userQuery);
      return querySnapshot.docs.map((doc) => doc.id);
    } catch (error) {
      console.error('Error fetching manager UIDs:', error);
      return [];
    }
  };

  const fetchAllManagersSettlements = async () => {
    try {
      const managerUids = await fetchManagerUids();
      let allSettlementsData = [];

      for (const managerUid of managerUids) {
        const settlementDocs = await getDocs(collection(db, `managersettlements_${managerUid}`));
        const managerSettlementsData = settlementDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        allSettlementsData = allSettlementsData.concat(managerSettlementsData);
      }

      setSettlementData(allSettlementsData);
    } catch (error) {
      console.error('Error fetching settlement data:', error);
    }
  };

  useEffect(() => {
    fetchAllManagersSettlements();
  }, []);

  const handleStatusChange = async (setId, employeeUid, newStatus) => {
    try {
      const employeeSettlementRef = doc(db, `managersettlements_${employeeUid}`, setId);
      await updateDoc(employeeSettlementRef, { status: newStatus });

      setSettlementData((prevSettlementData) =>
        prevSettlementData.map((settlement) =>
          settlement.id === setId ? { ...settlement, status: newStatus } : settlement
        )
      );
    } catch (error) {
      console.error('Error updating settlement status:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { color: 'green', fontWeight: 'bold' };
      case 'Rejected':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return { color: 'black', fontWeight: 'bold' };
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-12 mt-3">
          <h4>Settlement Status</h4>
          <table className="styled-table">
            <thead>
              <tr>
                <th>ManagerId</th>
                <th>Manager Name</th>
                <th>Resignation Date</th>
                <th>Last Working Day</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {settlementData.map((data) => (
                <tr key={data.id}>
                  <td>{data.employeeId}</td>
                  <td>{data.employeeName}</td>
                  <td>{data.resignationDate}</td>
                  <td>{data.lastWorkingDay}</td>
                  <td>{data.reason}</td>
                  <td style={{ ...getStatusStyle(data.status) }}>{data.status}</td>
                  <td>
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(data.id, data.employeeUid, e.target.value)}
                    >
                      <option value="" disabled>
                        Choose Action
                      </option>
                      <option value="Approved">Approve</option>
                      <option value="Rejected">Reject</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FinalSettlementStatus;
