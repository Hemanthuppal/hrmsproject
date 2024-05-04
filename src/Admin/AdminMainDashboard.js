import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../App'; // Make sure this import points to your Firebase app instance

const FetchEmployeeCountComponent = () => {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [totalLeaves, setTotalLeaves] = useState(0);

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      const db = getFirestore(app);
      try {
        // Fetch total employees
        const employeesRef = collection(db, "users");
        const employeesSnapshot = await getDocs(employeesRef);
        setEmployeeCount(employeesSnapshot.size);

        // Fetch managers and their leaves
        const managersQuery = query(employeesRef, where("role", "==", "manager"));
        const managersSnapshot = await getDocs(managersQuery);
        setManagerCount(managersSnapshot.size);

        let totalLeavesSum = 0;
        for (const managerDoc of managersSnapshot.docs) {
          const managerId = managerDoc.id;
          const leavesRef = collection(db, `Leaves_${managerId}`);
          const leavesSnapshot = await getDocs(leavesRef);
          totalLeavesSum += leavesSnapshot.docs.length;
        }
        setTotalLeaves(totalLeavesSum);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchEmployeeCount();
  }, []);

  return (
    <div>
      <p>Total Employee Count: {employeeCount}</p>
      <p>Total Manager Count: {managerCount}</p>
      <p>Total Leaves Count: {totalLeaves}</p>
    </div>
  );
};

export default FetchEmployeeCountComponent;
