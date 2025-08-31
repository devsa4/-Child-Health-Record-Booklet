import React from 'react';
import LoginForm from './frontend/login';
import SignUPForm from './frontend/SignUPForm';
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignUPForm/>}/>
      <Route path="/login" element={<LoginForm/>}/>
    </Routes>
  );
}

export default App;
