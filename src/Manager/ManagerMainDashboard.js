import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App'; // Ensure this path matches your Firebase configuration file's actual location

function EmployeesCount({ loggedInEmployeeId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchEmployeesCount = async () => {
      try {
        // Create a query against the 'users' collection where 'assignedManagerUid' matches 'loggedInEmployeeId'
        const q = query(collection(db, "users"), where("assignedManagerUid", "==", loggedInEmployeeId));
        
        const querySnapshot = await getDocs(q);
        setCount(querySnapshot.docs.length); // Update state with the count of matching documents
      } catch (error) {
        console.error("Error fetching employees count:", error);
      }
    };

    // Execute the fetch operation if 'loggedInEmployeeId' is provided
    if (loggedInEmployeeId) {
      fetchEmployeesCount();
    }
  }, [loggedInEmployeeId]); // Re-run the effect if 'loggedInEmployeeId' changes

  return (
    <div>
      <h2>Employees Under Manager</h2>
      <p>Count: {count}</p>
    </div>
  );
}

export default EmployeesCount;
