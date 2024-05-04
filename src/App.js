import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

import Login from "./Login";

import HolidayCalendar from "./HolidayCalendar";
import EmployeeDisplay from "./Admin/EmployeeDisplay";
import ManagerDisplay from "./Admin/ManagerDisplay";
import EmployeeRegistration from "./Admin/EmployeeRegistration";
import EmployeeDashboard from "./EmployeeDashboard";
import AdminDashboard from "./Admin/AdminDashboard";
import ManagerDashboard from "./Manager/ManagerDashBoard";
import Dashboard from "./GeneralManager/Dashboard";
import HRDashboard from "./HR/HRDashboard";
import HRManagerDashboard from "./HR/HRManagerDashboard";
import TDManagerDashboard from "./T&DManager/TDManagerDashboard";
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

const firebaseConfig = {
  apiKey: "AIzaSyCfX8PxMS-fsEdVc3vte45m6_HRkQHIXRI",
  authDomain: "syconehrms.firebaseapp.com",
  databaseURL: "https://syconehrms-default-rtdb.firebaseio.com",
  projectId: "syconehrms",
  storageBucket: "syconehrms.appspot.com",
  messagingSenderId: "440196769987",
  appId: "1:440196769987:web:b5fd8f6d48c0becb275a76"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, getFirestore, auth };

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (authUser) => {
        setUser(authUser);
        setLoading(false); // Set loading to false once the user is fetched
      },
      (error) => {
        console.error("Authentication error:", error);
        setLoading(false); // Ensure loading is false on error as well
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) { 
    return ;
  }

  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/holiday" element={<HolidayCalendar />} />
        <Route path="/emp" element={<ProtectedRoute user={user}><EmployeeDisplay /></ProtectedRoute>} />
        <Route path="/manager" element={<ProtectedRoute user={user}><ManagerDisplay /></ProtectedRoute>} />
        <Route path="/Empregister" element={<ProtectedRoute user={user}><EmployeeRegistration /></ProtectedRoute>} />
        <Route path="/AdminDashboard" element={<ProtectedRoute user={user}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/ManagerDashboard" element={<ProtectedRoute user={user}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/EmployeeDashboard" element={<ProtectedRoute user={user}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/Dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/HRdashboard" element={<ProtectedRoute user={user}><HRDashboard /></ProtectedRoute>} />
        <Route path="/HRManagerDashboard" element={<ProtectedRoute user={user}><HRManagerDashboard /></ProtectedRoute>} />
        <Route path="/TDManagerDashboard" element={<ProtectedRoute user={user}><TDManagerDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
