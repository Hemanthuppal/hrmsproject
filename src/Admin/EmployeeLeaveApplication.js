import React, { useState,useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../App';
import { useQuery } from 'react-query';
import { utils, write } from 'xlsx'; 
import { saveAs } from 'file-saver';

function LeaveApplications() {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [role, setRole] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = leaveApplications.slice(firstIndex, lastIndex);
  const npage = Math.ceil(leaveApplications.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);
  const exportToExcel = (data) => {
    // Add "S.No" column
    const formattedData = data.map((item, index) => ({
      S_No: index + 1,
      Employee_Name: item.fullName,
      Leave_Type: item.leaveType,
      From_Date: item.fromDate,
      To_Date: item.toDate,
      Description: item.description,
      Status: item.status
    }));
  
    // Create worksheet and workbook
    const worksheet = utils.json_to_sheet(formattedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Leave Data');
  
    // Write Excel file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, 'leave_applications.xlsx');
  };

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Handle month change
  const handleMonthChange = (e) => {
    const selectedValue = e.target.value;
    const today = new Date();
    const selectedDate = new Date(selectedValue + '-01');

    if (selectedDate <= today) {
      setSelectedMonth(selectedValue);
    } else {
      alert('Future months are not allowed.');
    }
  };

  function prePage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== npage) {
      setCurrentPage(currentPage + 1);
    }
  }
  const fetchManagers = async () => {
    const usersRef = collection(db, 'users');
    const managersQuery = query(usersRef, where("role", "==", "Manager"));
    const managersSnapshot = await getDocs(managersQuery);
    return managersSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
  };

  const fetchEmployees = async () => {
    const usersRef = collection(db, 'users');
    const employeesQuery = query(usersRef, where("role", "==", "Employee"));
    const employeesSnapshot = await getDocs(employeesQuery);
    return employeesSnapshot.docs.map(doc => ({ id: doc.id, fullName: doc.data().fullName }));
  };

  const fetchLeaveApplications = async () => {
    let applications = [];
    const [year, month] = selectedMonth.split('-');
    const startOfMonth = `${year}-${month}-01`;
    const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

    if (role === 'Employee' && selectedManager) {
      const leaveRef = collection(db, `leave_${selectedManager}`);
      const leaveSnapshot = await getDocs(leaveRef);
      applications = leaveSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (role === 'Employee') {
      for (const manager of employees) {
        const leaveCollectionRef = collection(db, `leave_${manager.id}`);
        const leaveDocs = await getDocs(leaveCollectionRef);
        const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applications = [...applications, ...leaveData];
      }
    } else if (role === 'Manager') {
      for (const manager of managers) {
        const leaveCollectionRef = collection(db, `Managerleave_${manager.id}`);
        const leaveDocs = await getDocs(leaveCollectionRef);
        const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applications = [...applications, ...leaveData];
      }
    } else if (role === 'All') {
      for (const employee of employees) {
        const leaveCollectionRef = collection(db, `leave_${employee.id}`);
        const leaveDocs = await getDocs(leaveCollectionRef);
        const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applications = [...applications, ...leaveData];
      }
      for (const manager of managers) {
        const leaveCollectionRef = collection(db, `Managerleave_${manager.id}`);
        const leaveDocs = await getDocs(leaveCollectionRef);
        const leaveData = leaveDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applications = [...applications, ...leaveData];
      }
    }

    // Filter applications by the selected month
    return applications.filter(app => {
      const fromDate = app.fromDate || '';
      return fromDate >= startOfMonth && fromDate <= endOfMonth;
    });
  };

  const { data: fetchedManagers, isLoading: loadingManagers } = useQuery(
    'managers', fetchManagers, { staleTime: 14400000, cacheTime: 14400000 }
  );

  const { data: fetchedEmployees, isLoading: loadingEmployees } = useQuery(
    'employees', fetchEmployees, { staleTime: 14400000, cacheTime: 14400000 }
  );

  const { data: fetchedLeaveApplications, isLoading: loadingLeaveApplications } = useQuery(
    ['leaveApplications', role, selectedManager, selectedMonth],
    fetchLeaveApplications,
    { enabled: !!role, staleTime: 14400000, cacheTime: 14400000 }
  );

  useEffect(() => {
    if (fetchedManagers) setManagers(fetchedManagers);
  }, [fetchedManagers]);

  useEffect(() => {
    if (fetchedEmployees) setEmployees(fetchedEmployees);
  }, [fetchedEmployees]);

  useEffect(() => {
    if (fetchedLeaveApplications) setLeaveApplications(fetchedLeaveApplications);
  }, [fetchedLeaveApplications]);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setSelectedManager('');
    setLeaveApplications([]);
  };

  const handleManagerChange = (e) => {
    setSelectedManager(e.target.value);
  };

  const handleStatusChange = async (applicationId, managerId, newStatus) => {
    try {
      const managerLeaveApplicationRef = doc(db, `Managerleave_${managerId}`, applicationId);
      await updateDoc(managerLeaveApplicationRef, { status: newStatus });

      setLeaveApplications(prevState =>
        prevState.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (error) {
      console.error('Error updating leave application status:', error);
    }
  };

  const styles = {
    tableHeader: {
      padding: '8px',
      textAlign: 'left',
    },
    tableCell: {
      padding: '8px',
      textAlign: 'center',
    },
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
      <div className="row">
        <div className="col-md-12 mt-3">
          <h4>Leave Status</h4>
          <div className='row'>
          <div className="col-md-4">
              <label htmlFor="monthSelect" className="form-label">Select Month:</label>
              <input
                type="month"
                id="monthSelect"
                className="form-control"
                value={selectedMonth}
                onChange={handleMonthChange}
                max={new Date().toISOString().split('T')[0].slice(0, 7)} // Restrict future months
              />
            </div>
            <button
          className="btn btn-primary mt-3"
          onClick={() => exportToExcel(records)} // Export the displayed data
        >
          Export to Excel
        </button>
            <div className='col-md-4'>
              <label htmlFor="roleSelect" className="form-label">Select Role:</label>
              <select id="roleSelect" className="form-select" onChange={handleRoleChange} value={role}>
                <option value="" disabled>Select Role</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="All">All</option>
              </select>
            </div>
            {role === 'Employee' && (
              <div className='col-md-4'>
                <label htmlFor="managerSelect" className="form-label">Select Manager:</label>
                <select id="managerSelect" className="form-select" onChange={handleManagerChange} value={selectedManager}>
                  <option value="" disabled>Select a Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>{manager.fullName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {(loadingManagers || loadingEmployees || loadingLeaveApplications) ? (
            <div>Loading...</div>
          ) : (
            <table className="styled-table mt-4">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Employee Name</th>
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  {role === 'Manager' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {records.map((application, index) => (
                  <tr key={application.id}>
                    <td>{index + 1}</td>
                    <td>{application.fullName}</td>
                    <td>{application.leaveType}</td>
                    <td>{application.fromDate}</td>
                    <td>{application.toDate}</td>
                    <td>{application.description}</td>
                    <td style={{ ...styles.tableCell, ...getStatusStyle(application.status) }}>
                      {application.status}
                    </td>
                    {role === 'Manager' && (
                      <td style={styles.tableCell}>
                        <select
                          defaultValue=""
                          onChange={(e) => handleStatusChange(application.id, application.employeeUid, e.target.value)}
                        >
                          <option value="" disabled>Choose Action</option>
                          <option value="Approved">Approve</option>
                          <option value="Rejected">Reject</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <nav aria-label="Page navigation example" style={{ position: "sticky", bottom: "5px", right: "10px", cursor: "pointer" }}>
            <ul className="pagination justify-content-end">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <a className="page-link" aria-label="Previous" onClick={prePage}>
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
              {numbers.map((n, i) => (
                <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                  <a className="page-link" onClick={() => changeCPage(n)}>
                    {n}
                  </a>
                </li>
              ))}
              <li className={`page-item ${currentPage === npage ? "disabled" : ""}`}>
                <a className="page-link" aria-label="Next" onClick={nextPage}>
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplications;
