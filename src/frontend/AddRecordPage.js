import React, { useState, useEffect, useRef } from "react";
import { addChild, getChildById } from "../utils/indexeddb";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { MdFamilyRestroom } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AddRecordPage.css";
import { addRecordToChild } from "../utils/indexeddb";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function AddRecordPage() {
  const [language, setLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uniqueId, setUniqueId] = useState("");
  const [childData, setChildData] = useState(null);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [illnesses, setIllnesses] = useState("");
  const [malnutrition, setMalnutrition] = useState("");
  const [records, setRecords] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const sidebarRef = useRef();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  useEffect(() => {
    const preloadChildren = async () => {
      if (navigator.onLine) {
        try {
          const res = await fetch("/children");
          if (!res.ok) throw new Error("Failed to fetch children");

          const children = await res.json();
          for (const child of children) {
            await addChild({ ...child, child_id: child.child_id || child._id || child.id });
          }

          console.log("📦 Preloaded children to IndexedDB:", children.length);
        } catch (err) {
          console.error("❌ Error preloading children:", err);
        }
      } else {
        console.log("📴 Offline — skipping preload");
      }
    };

    preloadChildren();
  }, []);

  const syncUnsyncedRecords = async () => {
    if (!navigator.onLine) return;

    const allRecords = JSON.parse(localStorage.getItem("offlineRecords") || "[]");
    const unsynced = allRecords.filter(r => !r.synced && r.child_id);

    if (unsynced.length === 0) {
      console.log("✅ No unsynced records to sync");
      return;
    }

    const synced = [];

    for (const record of unsynced) {
      try {
        const res = await fetch(`/add-record/${record.child_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        });

        if (res.ok) {
          synced.push({ ...record, synced: true });
          console.log("🔁 Synced offline record:", record.id);
        }
      } catch (err) {
        console.error("❌ Sync failed for record:", record.id, err);
      }
    }

    localStorage.setItem("offlineRecords", JSON.stringify(synced));
  };

  useEffect(() => {
    syncUnsyncedRecords();
  }, []);

  useEffect(() => {
    window.addEventListener("online", syncUnsyncedRecords);
    return () => window.removeEventListener("online", syncUnsyncedRecords);
  }, []);

  const content = {
    en: {
      title: "GROWTH GUARDIAN",
      register: "Register a Child",
      update: "Update Registered Child",
      fetchChild: "Fetch Child by Unique ID",
      enterId: "Enter Unique ID",
      fetch: "Fetch Child",
      height: "Height (cm)",
      weight: "Weight (kg)",
      illness: "Recent Illness",
      malnutrition: "Signs of Malnutrition",
      addRecord: "Add Record",
      parentName: "Parent's Name",
      age: "Age",
      progress: "Height & Weight Progress",
      dob: "DOB",
      home: "Home",
      logout: "Log Out",
      view: "View Child Record",
      add: "📈 Keep adding progress records to see the child's growth over time.",
      profile: "Your Profile",
      name: "Name"
    },
    hi: {
      home: "होम",
      logout: "लॉग आउट",
      title: "विकास संरक्षक",
      register: "नया बच्चा पंजीकृत करें",
      update: "रिकॉर्ड जोड़ें",
      fetchChild: "अद्वितीय आईडी द्वारा बच्चा खोजें",
      enterId: "अद्वितीय आईडी दर्ज करें",
      fetch: "बच्चा खोजें",
      height: "ऊंचाई (सेमी)",
      weight: "वजन (किग्रा)",
      illness: "हालिया बीमारी",
      malnutrition: "कुपोषण के लक्षण",
      addRecord: "रिकॉर्ड जोड़ें",
      parentName: "अभिभावक का नाम",
      progress: "ऊंचाई और वजन प्रगति",
      age: "आयु",
      dob: "जन्म तिथि",
      view: "बच्चों के रिकॉर्ड देखें",
      profile: "अपनी प्रोफ़ाइल देखें",
      name: "नाम",
      add: "📈 समय के साथ बच्चे की वृद्धि देखने के लिए प्रगति रिकॉर्ड जोड़ते रहें।"
    }
  };

  const currentContent = content[language] || content["en"];

  const fetchChildById = async (childId) => {
    try {
      const offlineChild = await getChildById(childId);
      if (offlineChild) return offlineChild;

      if (navigator.onLine) {
        const res = await fetch(`http://localhost:5000/child-by-unique-id/${childId}`);
        if (!res.ok) throw new Error("Failed to fetch child online");

        const onlineChild = await res.json();
        const normalizedChild = {
          ...onlineChild,
          child_id: onlineChild.child_id || onlineChild._id || onlineChild.id
        };

        await addChild(normalizedChild);
        return normalizedChild;
      }

      return null;
    } catch (err) {
      console.error("❌ Error in fetchChildById:", err);
      return null;
    }
  };

  const handleFetchChild = async (e) => {
    e.preventDefault();
    const normalizedId = String(uniqueId).trim();
    const child = await fetchChildById(normalizedId);

    if (child) {
      setChildData(child);
      setRecords(child.history || []);
      setHeight("");
      setWeight("");
      setIllnesses("");
      setMalnutrition("");

      const source = !navigator.onLine
        ? "offline"
        : child.synced === false
        ? "offline (unsynced)"
        : "server";

      setPopupMessage(`✅ Fetched from ${source}.`);
      setShowPopup(true);
    } else {
      setPopupMessage("❌ No record found in server or offline cache.");
      setShowPopup(true);
      setChildData(null);
    }
  };

const handleAddRecord = async (e) => {
  e.preventDefault();

  if (!height || !weight) {
    setPopupMessage("Height and Weight are required!");
    setShowPopup(true);
    return;
  }

  const recordId = "RECORD_" + Date.now();
  const newRecord = {
    id: recordId,
    height: parseFloat(height),
    weight: parseFloat(weight),
    illnesses,
    malnutrition: malnutrition.trim(),
    date: new Date().toISOString(),
    child_id: childData.child_id || childData._id,
    synced: navigator.onLine
  };

  try {
    if (!navigator.onLine) {
      await addRecordToChild(newRecord.child_id, newRecord);
      setRecords((prev) => [...prev, newRecord]); // update chart immediately
      setHeight("");
      setWeight("");
      setIllnesses("");
      setMalnutrition("");
      setPopupMessage("Saved offline. Will sync when online.");
      setShowPopup(true);
      return;
    }

    const res = await fetch(`/add-record/${newRecord.child_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord)
    });

    if (!res.ok) throw new Error("Failed to add record");

    const updatedChild = await res.json();
    await addRecordToChild(newRecord.child_id, newRecord); // ✅ update IndexedDB too
    setRecords(updatedChild.history || []);
    setHeight("");
    setWeight("");
    setIllnesses("");
    setMalnutrition("");
    setPopupMessage("Record added successfully!");
    setShowPopup(true);
  } catch (err) {
    console.error(err);
    setPopupMessage("Error saving record to cloud");
    setShowPopup(true);
  }
};

const chartData = {
  labels: records.map((r, i) => `Record ${i + 1}`),
  datasets: [
    {
      label: "Weight (kg)",
      data: records.map((r) => r.weight),
      borderColor: "blue",
      fill: false
    },
    {
      label: "Height (cm)",
      data: records.map((r) => r.height),
      borderColor: "green",
      fill: false
    }
  ]
};

const chartOptions = {
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
      ticks: { color: '#ffffff' }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.2)' },
      ticks: { color: '#ffffff' }
    }
  },
  plugins: {
    legend: {
      labels: { color: '#ffffff' }
    }
  }
};

return (
  <div className="add-record-page">
    {/* Background and Branding */}
    <div className="moving-backgrounds">
      <img src="/carousel1.jpg" alt="background 1" />
      <img src="/carousel2.jpg" alt="background 2" />
      <img src="/carousel3.jpg" alt="background 3" />
    </div>
    <div className="background-overlay"></div>
    <div className="top-left-brand">
      <MdFamilyRestroom className="brand-icon" />
      <h1 className="brand-title">{currentContent.title}</h1>
      <FaBars className="menu-icon" onClick={toggleSidebar} />
    </div>

    {/* Sidebar */}
    {sidebarOpen && (
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
    )}
    <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <ul className="sidebar-links">
        <li onClick={() => { navigate("/home"); setSidebarOpen(false); }}>{currentContent.home}</li>
        <li onClick={() => { navigate("/register"); setSidebarOpen(false); }}>{currentContent.register}</li>
        <li onClick={() => { navigate("/add-record/:childId"); setSidebarOpen(false); }}>{currentContent.update}</li>
        <li onClick={() => { navigate("/view-records"); setSidebarOpen(false); }}>{currentContent.view}</li>
        <li onClick={() => { navigate("/profile"); setSidebarOpen(false); }}>{currentContent.profile}</li>
      </ul>
      <button className="logout-button" onClick={() => {
        navigate('/login');
        setSidebarOpen(false);
      }}>
        {currentContent.logout}
      </button>
    </div>

    {/* Language Toggle */}
    <div className="language-card1">
      <div className="language-toggle1">
        <button className={`lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>English</button>
        <button className={`lang-btn1 ${language === "hi" ? "active" : ""}`} onClick={() => setLanguage("hi")}>हिन्दी</button>
      </div>
    </div>

    {/* Main Form */}
    <div className="add-record-container">
      {!childData && (
        <form className="unique-id-form" onSubmit={handleFetchChild}>
          <h3>{currentContent.fetchChild}</h3>
          <label>{currentContent.enterId}:</label>
          <input
            type="text"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            required
          />
          <button type="submit">{currentContent.fetch}</button>
        </form>
      )}

      {childData && (
        <div className="child-record-form">
          <div className="child-info">
            <p><strong>{currentContent.enterId}:</strong> {childData.child_id || childData._id || childData.id}</p>
            <p><strong>{currentContent.name}:</strong> {childData.name}</p>
            <p><strong>{currentContent.age}:</strong> {childData.age}</p>
            <p><strong>{currentContent.dob}:</strong> {childData.dateOfBirth ? new Date(childData.dateOfBirth).toLocaleDateString() : ""}</p>
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
              <h3>{currentContent.progress}</h3>
              <p className="growth-note">{currentContent.add}</p>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>

    {/* Popup Message */}
    {showPopup && (
      <div className="popup-overlay" onClick={() => setShowPopup(false)}>
        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
          <h2>Message</h2>
          <p>{popupMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      </div>
    )}
  </div>
);
}

export default AddRecordPage;