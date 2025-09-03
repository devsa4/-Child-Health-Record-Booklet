import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './frontend/LoginForm';
import SignUpForm from './frontend/SignUp';
import Home from './frontend/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { syncUsers } from "./utils/indexeddb";
import ChildForm from './frontend/ChildForm';   

function App() {
  useEffect(() => {
    let syncTimeout;

    const handleOnline = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncUsers, 1000); // delay by 1s
    };

    window.addEventListener("online", handleOnline);
    syncUsers(); // initial sync on app load

    return () => {
      clearTimeout(syncTimeout);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="/register" element={<ChildForm />} />
    </Routes>
  );
}

export default App;
