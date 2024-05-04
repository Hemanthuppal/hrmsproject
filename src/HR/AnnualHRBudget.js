import React, { useState, useEffect } from 'react';
import { db } from '../App'; // Import your Firebase config file
import { collection, addDoc, getDocs } from 'firebase/firestore';

function AnnualHRBudget() {
  const [budgetData, setBudgetData] = useState([]);
  const [newRow, setNewRow] = useState({
    department: '',
    position: '',
    employees: '',
    annualSalary: '',
    budget: '',
  });

  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    fetchPersonnelCostsBudget();
  }, []);

  const fetchPersonnelCostsBudget = async () => {
    try {
      const personnelCostsCollection = collection(db, 'personnelCostsBudget');
      const querySnapshot = await getDocs(personnelCostsCollection);
      
      const data = querySnapshot.docs.map(doc => doc.data());
      setBudgetData(data);

      console.log('Data fetched from Firestore:', data);
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
    }
  };

  const addRow = async () => {
    try {
      // Validate that all fields are filled
      if (!newRow.department || !newRow.position || !newRow.employees || !newRow.annualSalary || !newRow.budget) {
        alert('Please fill all fields before adding a new row.');
        return;
      }
  
      // Add the new row to Firestore
      const personnelCostsCollection = collection(db, 'personnelCostsBudget');
      await addDoc(personnelCostsCollection, newRow);
  
      // Fetch updated data from Firestore and update the state
      fetchPersonnelCostsBudget();
  
      setNewRow({
        department: '',
        position: '',
        employees: '',
        annualSalary: '',
        budget: '',
      });
  
      console.log('Row added to Firestore:', newRow);
    } catch (error) {
      console.error('Error adding row to Firestore:', error);
    }
  };
  

  const handleNewRowChange = (field, value) => {
    setNewRow({
      ...newRow,
      [field]: value,
    });
  };

  const [recruitmentExpensesData, setRecruitmentExpensesData] = useState([]);
  const [newRecruitmentExpense, setNewRecruitmentExpense] = useState({
    category: '',
    estimatedCost: '',
    actualCost: '', // New column for Actual Cost
  });

  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    fetchRecruitmentExpenses();
  }, []);

  const fetchRecruitmentExpenses = async () => {
    try {
      const recruitmentExpensesCollection = collection(db, 'recruitmentExpensesBudget');
      const querySnapshot = await getDocs(recruitmentExpensesCollection);

      const data = querySnapshot.docs.map(doc => doc.data());
      setRecruitmentExpensesData(data);

      console.log('Recruitment Expenses fetched from Firestore:', data);
    } catch (error) {
      console.error('Error fetching Recruitment Expenses data from Firestore:', error);
    }
  };

  const addRecruitmentExpenseRow = async () => {
    try {
      // Validate that all fields are filled
      if (!newRecruitmentExpense.category || !newRecruitmentExpense.estimatedCost || !newRecruitmentExpense.actualCost) {
        alert('Please fill all fields before adding a new recruitment expense row.');
        return;
      }
  
      // Add the new recruitment expense row to Firestore
      const recruitmentExpensesCollection = collection(db, 'recruitmentExpensesBudget');
      await addDoc(recruitmentExpensesCollection, newRecruitmentExpense);
  
      // Fetch updated data from Firestore and update the state
      fetchRecruitmentExpenses();
  
      setNewRecruitmentExpense({
        category: '',
        estimatedCost: '',
        actualCost: '', // Reset Actual Cost when adding a new row
      });
  
      console.log('Recruitment Expense Row added to Firestore:', newRecruitmentExpense);
    } catch (error) {
      console.error('Error adding Recruitment Expense Row to Firestore:', error);
    }
  };
  

  const handleNewRecruitmentExpenseChange = (field, value) => {
    setNewRecruitmentExpense({
      ...newRecruitmentExpense,
      [field]: value,
    });
  };

  const [trainingAndDevelopmentData, setTrainingAndDevelopmentData] = useState([]);
  const [newTrainingData, setNewTrainingData] = useState({
    trainingProgram: '',
    estimatedCost: '',
    actualCost: '',
  });
  
  useEffect(() => {
    // Fetch data from Firestore when the component mounts
    fetchTrainingAndDevelopmentData();
  }, []);
  
  const fetchTrainingAndDevelopmentData = async () => {
    try {
      const trainingAndDevelopmentCollection = collection(db, 'trainingAndDevelopmentBudget');
      const querySnapshot = await getDocs(trainingAndDevelopmentCollection);
  
      const data = querySnapshot.docs.map(doc => doc.data());
      setTrainingAndDevelopmentData(data);
  
      console.log('Training and Development data fetched from Firestore:', data);
    } catch (error) {
      console.error('Error fetching Training and Development data from Firestore:', error);
    }
  };
  
  const addTrainingAndDevelopmentRow = async () => {
    try {
      // Validate that all fields are filled
      if (!newTrainingData.trainingProgram || !newTrainingData.estimatedCost || !newTrainingData.actualCost) {
        alert('Please fill all fields before adding a new training and development row.');
        return;
      }
  
      // Add the new training and development row to Firestore
      const trainingAndDevelopmentCollection = collection(db, 'trainingAndDevelopmentBudget');
      await addDoc(trainingAndDevelopmentCollection, newTrainingData);
  
      // Fetch updated data from Firestore and update the state
      fetchTrainingAndDevelopmentData();
  
      setNewTrainingData({
        trainingProgram: '',
        estimatedCost: '',
        actualCost: '',
      });
  
      console.log('Training and Development Row added to Firestore:', newTrainingData);
    } catch (error) {
      console.error('Error adding Training and Development Row to Firestore:', error);
    }
  };
  
  const handleNewTrainingDataChange = (field, value) => {
    setNewTrainingData({
      ...newTrainingData,
      [field]: value,
    });
  };

  return (
    <div>
      <h2 className='text-center'>Personnel Costs</h2>
      {/* Personnel Costs table */}
      <table className="styled-table" border="2" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>Department</th>
            <th>Position</th>
            <th>No of Employees</th>
            <th>Annual Salary</th>
            <th>Budget</th>
            <th>TOTAL COST</th>
          </tr>
        </thead>
        <tbody>
          {budgetData.map((item, index) => (
            <tr key={index}>
              <td>{item.department}</td>
              <td>{item.position}</td>
              <td>{item.employees}</td>
              <td>{item.annualSalary}</td>
              <td>{item.budget}</td>
              <td>{item.employees * item.annualSalary}</td>
            </tr>
          ))}
          <tr>
            <td>
              <select
                value={newRow.department}
                onChange={(e) => handleNewRowChange('department', e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="Development">Development</option>
    <option value="HR Team">HR Team</option>
    <option value="Testing">Testing</option>
    <option value="Training and Development">Training and Development</option>
                {/* Add more departments as needed */}
              </select>
            </td>
            <td>
              <select
                value={newRow.position}
                onChange={(e) => handleNewRowChange('position', e.target.value)}
              >
                <option value="">Select Position</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                {/* Add more positions as needed */}
              </select>
            </td>
            <td>
              <input
                type="number"
                value={newRow.employees}
                onChange={(e) => handleNewRowChange('employees', parseInt(e.target.value, 10))}
              />
            </td>
            <td>
              <input
                type="number"
                value={newRow.annualSalary}
                onChange={(e) => handleNewRowChange('annualSalary', parseInt(e.target.value, 10))}
              />
            </td>
            <td>
              <input
                type="number"
                value={newRow.budget}
                onChange={(e) => handleNewRowChange('budget', parseInt(e.target.value, 10))}
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <td colSpan="3" ><b>Total</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.annualSalary, 0)}</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.budget, 0)}</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.employees * item.annualSalary, 0)}</b></td>
          </tr>
          
          <tr>
            <td colSpan="6" style={{ textAlign: 'left' }}>
              <button onClick={addRow}>Add Row</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className='row'>
      <div className="col-md-6">
  <h2 className='text-center'>Recruitment Expenses</h2>
  <table className="styled-table" border="2" style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th>Expense Category</th>
        <th>Estimated Cost</th>
        <th>Actual Cost</th>
      </tr>
    </thead>
    <tbody>
      {recruitmentExpensesData.map((item, index) => (
        <tr key={index}>
          <td>{item.category}</td>
          <td>{item.estimatedCost}</td>
          <td>{item.actualCost}</td>
        </tr>
      ))}
      
      <tr>
        <td>
          <input
            type="text"
            value={newRecruitmentExpense.category}
            onChange={(e) => handleNewRecruitmentExpenseChange('category', e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={newRecruitmentExpense.estimatedCost}
            onChange={(e) => handleNewRecruitmentExpenseChange('estimatedCost', parseInt(e.target.value, 10))}
          />
        </td>
        <td>
          <input
            type="number"
            value={newRecruitmentExpense.actualCost}
            onChange={(e) => handleNewRecruitmentExpenseChange('actualCost', parseInt(e.target.value, 10))}
          />
        </td>
      </tr>
      <tr>
        <td colSpan="1"><b>Total</b></td>
        <td><b>{recruitmentExpensesData.reduce((sum, item) => sum + item.estimatedCost, 0)}</b></td>
        <td><b>{recruitmentExpensesData.reduce((sum, item) => sum + item.actualCost, 0)}</b></td>
      </tr>
      <tr>
  <td colSpan="3" style={{ textAlign: 'left' }}>
    <button onClick={addRecruitmentExpenseRow}>Add Row</button>
  </td>
</tr>


    </tbody>
  </table>
</div>
<div className="col-md-6">
  <h2 className='text-center'>Training and Development</h2>
  
  <table className="styled-table" border="2" style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead>
      <tr>
        <th>Training Program</th>
        <th>Estimated Cost</th>
        <th>Actual Cost</th>
      </tr>
    </thead>
    <tbody>
      {trainingAndDevelopmentData.map((item, index) => (
        <tr key={index}>
          <td>{item.trainingProgram}</td>
          <td>{item.estimatedCost}</td>
          <td>{item.actualCost}</td>
        </tr>
      ))}
      
      <tr>
        <td>
          <input
            type="text"
            value={newTrainingData.trainingProgram}
            onChange={(e) => handleNewTrainingDataChange('trainingProgram', e.target.value)}
          />
        </td>
        <td>
          <input
            type="number"
            value={newTrainingData.estimatedCost}
            onChange={(e) => handleNewTrainingDataChange('estimatedCost', parseInt(e.target.value, 10))}
          />
        </td>
        <td>
          <input
            type="number"
            value={newTrainingData.actualCost}
            onChange={(e) => handleNewTrainingDataChange('actualCost', parseInt(e.target.value, 10))}
          />
        </td>
      </tr>
      <tr>
        <td colSpan="1"><b>Total</b></td>
        <td><b>{trainingAndDevelopmentData.reduce((sum, item) => sum + item.estimatedCost, 0)}</b></td>
        <td><b>{trainingAndDevelopmentData.reduce((sum, item) => sum + item.actualCost, 0)}</b></td>
      </tr>
      <tr>
        <td colSpan="3" style={{ textAlign: 'left' }}>
          <button onClick={addTrainingAndDevelopmentRow}>Add Row</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
      </div>

    </div>
  );
}

export default AnnualHRBudget;
