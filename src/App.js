import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './frontend/LoginForm';
import SignUpForm from './frontend/SignUp';
import Home from './frontend/Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/home" element={<Home/>} />
    </Routes>
  );
}

export default App;
