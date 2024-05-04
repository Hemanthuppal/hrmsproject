import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import { db, auth } from "./Firebase";

function EmployeeDetails() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "employees"));
        const employeeList = [];
        querySnapshot.forEach((doc) => {
          employeeList.push({ id: doc.id, ...doc.data() });
        });
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (id, email) => {
    // Check if there is a currently signed-in user
    if (!auth.currentUser) {
      alert("No signed-in user.");
      return;
    }
  
    if (auth.currentUser.email !== email) {
      alert("You can only delete the currently signed-in user.");
      return;
    }
  
    // Rest of your code...
  };
  

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Employee List</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
              <td>
                <button
                  className="btn btn-danger"
                  onClick={() =>
                    handleDelete(employee.id, employee.email)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeDetails;
