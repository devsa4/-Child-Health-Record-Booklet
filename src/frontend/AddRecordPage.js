import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { MdFamilyRestroom } from 'react-icons/md';
import { FaBars } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import "./AddRecordPage.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AddRecordPage() {
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [childData, setChildData] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [illnesses, setIllnesses] = useState("");
  const [malnutrition, setMalnutrition] = useState("");
  const [records, setRecords] = useState([]);
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const content = {
    en: {
      title: 'GROWTH GUARDIAN',
      register: 'Register a Child',
      update: 'Update Registered Child',
      fetchChild: 'Fetch Child by Unique ID',
      enterId: 'Enter Unique ID',
      fetch: 'Fetch Child',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      illness: 'Recent Illness',
      malnutrition: 'Signs of Malnutrition',
      addRecord: 'Add Record',
      parentName: "Parent's Name",
      age: 'Age',
      dob: 'DOB',
      home:"Home",
      logout:'Log Out',
      view:'View Child Record',
      profile:'Your Profile',
      name:"Name"
    },
    hi: {
      home:"होम",
      logout:'लॉग आउट',
      title: 'विकास संरक्षक',
      register: 'नया बच्चा पंजीकृत करें',
      update: 'रिकॉर्ड जोड़ें',
      fetchChild: 'अद्वितीय आईडी द्वारा बच्चा खोजें',
      enterId: 'अद्वितीय आईडी दर्ज करें',
      fetch: 'बच्चा खोजें',
      height: 'ऊंचाई (सेमी)',
      weight: 'वजन (किग्रा)',
      illness: 'हालिया बीमारी',
      malnutrition: 'कुपोषण के लक्षण',
      addRecord: 'रिकॉर्ड जोड़ें',
      parentName: 'अभिभावक का नाम',
      age: 'आयु',
      dob: 'जन्म तिथि',
      view:'बच्चों के रिकॉर्ड देखें',
      profile:'अपनी प्रोफ़ाइल देखें',
      name:"नाम"
    }
  };

  const currentContent = content[language];

  // Fetch child data by Unique ID
  const handleFetchChild = (e) => {
    e.preventDefault();
    const storedRecords = JSON.parse(localStorage.getItem("childRecords")) || [];
    const child = storedRecords.find((c) => c.id === uniqueId);
    if (child) {
      setChildData(child);
      setRecords(child.history || []);
      setHeight("");
      setWeight("");
      setIllnesses("");
      setMalnutrition("");
    } else {
      alert("Child not found with this Unique ID");
      setChildData(null);
    }
  };

  // Save new record for this child
  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!height || !weight) {
      alert("Height and Weight are required!");
      return;
    }
    const newRecord = {
      height: parseFloat(height),
      weight: parseFloat(weight),
      illnesses,
      malnutrition,
      date: new Date().toLocaleDateString(),
    };
    const updatedHistory = [...records, newRecord];

    const storedRecords = JSON.parse(localStorage.getItem("childRecords")) || [];
    const updatedRecords = storedRecords.map((c) =>
      c.id === uniqueId ? { ...c, history: updatedHistory } : c
    );
    localStorage.setItem("childRecords", JSON.stringify(updatedRecords));

    setRecords(updatedHistory);
    setHeight("");
    setWeight("");
    setIllnesses("");
    setMalnutrition("");
    alert("Record added successfully!");
  };

  // Chart data
  const chartData = {
    labels: records.map((r, i) => `Record ${i + 1}`),
    datasets: [
      { label: "Weight (kg)", data: records.map((r) => r.weight), borderColor: "blue", fill: false },
      { label: "Height (cm)", data: records.map((r) => r.height), borderColor: "green", fill: false }
    ]
  };

  return (
    <div className="add-record-page">
        <div className="moving-backgrounds">
  <img src="/carousel1.jpg" alt="background 1" />
  <img src="/carousel2.jpg" alt="background 2" />
  <img src="/carousel3.jpg" alt="background 3" />
</div>

<div className="background-overlay"></div>

      <div className="background-overlay"></div>

      <div className="top-left-brand">
        <MdFamilyRestroom className="brand-icon" />
        <h1 className="brand-title">{currentContent.title}</h1>
        <FaBars className="menu-icon" onClick={toggleSidebar} />
      </div>

      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-links">
          <li onClick={() => navigate('/home')}>{content[language].home}</li>
          <li onClick={() => navigate('/register')}>{content[language].register}</li>
          <li >{currentContent.update}</li>
          <li onClick={() => navigate('/view-records')}>{content[language].view}</li>
          <li>{content[language].profile}</li>
        </ul>
        <button className="logout-button">{content[language].logout}</button>
      </div>

      <div className="language-card">
        <div className="language-toggle">
          <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
          <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>हिन्दी</button>
        </div>
      </div>

      <div className="add-record-container">
        {!childData && (
          <form className="unique-id-form" onSubmit={handleFetchChild}>
            <h3>{currentContent.fetchChild}</h3>
            <label>{currentContent.enterId}:</label>
            <input type="text" value={uniqueId} onChange={(e) => setUniqueId(e.target.value)} required />
            <button type="submit">{currentContent.fetch}</button>
          </form>
        )}

        {childData && (
          <div className="child-record-form">
            <div className="child-info">
              <p><strong>{currentContent.enterId}:</strong> {childData.id}</p>
             
              <p><strong>{currentContent.name}:</strong> {childData.name}</p>
              <p><strong>{currentContent.age}:</strong> {childData.age}</p>
              <p><strong>{currentContent.dob}:</strong> {childData.dob}</p>
            </div>

            <form onSubmit={handleAddRecord} className="new-record-form">
              <label>{currentContent.height}:</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} required />
              <label>{currentContent.weight}:</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} required />
              <label>{currentContent.illness}:</label>
              <input type="text" value={illnesses} onChange={(e) => setIllnesses(e.target.value)} />
              <label>{currentContent.malnutrition}:</label>
              <input type="text" value={malnutrition} onChange={(e) => setMalnutrition(e.target.value)} />
              <button type="submit">{currentContent.addRecord}</button>
            </form>

            {records.length > 0 && (
              <div className="charts">
                <h3>Height & Weight Progress</h3>
                <Line data={chartData} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddRecordPage;
