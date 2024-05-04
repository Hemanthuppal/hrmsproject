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
            <td colSpan="3" ><b>Total</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.annualSalary, 0)}</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.budget, 0)}</b></td>
            <td><b>{budgetData.reduce((sum, item) => sum + item.employees * item.annualSalary, 0)}</b></td>
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
        <td colSpan="1"><b>Total</b></td>
        <td><b>{recruitmentExpensesData.reduce((sum, item) => sum + item.estimatedCost, 0)}</b></td>
        <td><b>{recruitmentExpensesData.reduce((sum, item) => sum + item.actualCost, 0)}</b></td>
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
        <td colSpan="1"><b>Total</b></td>
        <td><b>{trainingAndDevelopmentData.reduce((sum, item) => sum + item.estimatedCost, 0)}</b></td>
        <td><b>{trainingAndDevelopmentData.reduce((sum, item) => sum + item.actualCost, 0)}</b></td>
      </tr>
      
    </tbody>
  </table>
</div>
      </div>

    </div>
  );
}

export default AnnualHRBudget;
