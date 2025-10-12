import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './frontend/LoginForm';
import SignUpForm from './frontend/SignUp';
import Home from './frontend/Home';
import ChildForm from './frontend/ChildForm';
import ViewRecords from './frontend/ViewRecords';
import AddRecordPage from './frontend/AddRecordPage';
import YourProfile from './frontend/YourProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { syncUsers } from "./utils/indexeddb";

function App() {
  useEffect(() => {
    let syncTimeout;

    const handleOnline = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(syncUsers, 1000); // ⏳ debounce sync
    };

    window.addEventListener("online", handleOnline);
    syncUsers(); // 🔄 initial sync on load

    return () => {
      clearTimeout(syncTimeout);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/home" element={<Home />} /> {/* ✅ Offline login lands here */}
      <Route path="/register" element={<ChildForm />} />
      <Route path="/view-records" element={<ViewRecords />} />
      <Route path="/add-record/:childId" element={<AddRecordPage />} />
      <Route path="/profile" element={<YourProfile />} />
    </Routes>
  );
}

export default App;