import React, { useEffect, useState, useRef } from "react";
import { MdFamilyRestroom, MdChildCare } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ChromaGrid from "./ChromaGrid";
import ChildSummaryModal from "./ChildSummaryModal";
import ChildSpotlightCard from "./ChildSpotlightCard";
import "./ViewRecords.css";

const encouragements = {
  en: [
    "🎉 Every small step builds a stronger future.",
    "🌱 You’re doing amazing — keep going!",
    "💡 Health is a journey, not a race.",
    "🧡 Your care makes all the difference.",
    "👣 Progress is progress, no matter how small.",
    "💛 Your care is the quiet hero in every child’s journey.",
    "🕊️ Compassion is the most powerful medicine.",
    "🌈 Behind every number is a story of hope.",
    "🎨 You’re painting a future with every record you touch.",
    "🔍 What you notice today could change a life tomorrow."
  ],
  hi: [
    "🎉 हर छोटा कदम एक बेहतर भविष्य की नींव रखता है।",
    "🌱 आप शानदार काम कर रहे हैं — ऐसे ही आगे बढ़ते रहें!",
    "💡 स्वास्थ्य एक यात्रा है, दौड़ नहीं।",
    "🧡 आपकी देखभाल सबसे बड़ा फर्क लाती है।",
    "👣 प्रगति चाहे जितनी भी छोटी हो, मायने रखती है।",
    "💛 आपकी देखभाल हर बच्चे की यात्रा का नायक है।",
    "🕊️ करुणा सबसे शक्तिशाली दवा है।",
    "🌈 हर आंकड़े के पीछे आशा की एक कहानी है।",
    "🎨 आप हर रिकॉर्ड के साथ भविष्य को रंग दे रहे हैं।",
    "🔍 आज जो आप देख रहे हैं, वह कल किसी जीवन को बदल सकता है।"
  ]
};

function ViewRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [language, setLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [encourageIndex, setEncourageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const sidebarRef = useRef();
  const navigate = useNavigate();

  const attentionCount = filteredRecords.filter(r => r.malnutrition?.hasSigns === "yes").length;
  const healthyCount = filteredRecords.filter(r =>
    r.weight >= 10 + r.age * 2 && r.height >= 70 + r.age * 7
  ).length;
  const improvingCount = filteredRecords.length - attentionCount - healthyCount;
  const spotlightChild = filteredRecords.length > 0
    ? filteredRecords[Math.floor(Math.random() * filteredRecords.length)]
    : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        const currentList = encouragements[language] || [];
        setEncourageIndex((prev) => (prev + 1) % currentList.length);
        setFadeIn(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch("/children");
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data);
        setFilteredRecords(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setRecords([]);
        setFilteredRecords([]);
        setIsLoading(false);
      }
    }
    fetchRecords();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = records.filter((r) =>
      r.name ? r.name.toLowerCase().includes(term) : false
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleChildClick = (child) => {
    setSelectedChild(child);
    setShowModal(true);
  };
  const closeModal = () => {
    setSelectedChild(null);
    setShowModal(false);
  };

const handleDeleteChild = async (childId) => {
  try {
    const res = await fetch(`/child/${childId}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      const updatedRecords = records.filter(r =>
        r.child_id !== childId && r._id !== childId && r.id !== childId
      );
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
      closeModal();
    } else {
      console.log(`ℹ️ ${data.message || "Child not found."}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting record");
  }
};


  const handleUpdateChild = async (updatedChild) => {
    try {
      const res = await fetch(`/child/${updatedChild.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedChild),
      });
      if (!res.ok) throw new Error("Failed to update record");
      const updatedRecords = records.map((r) =>
        r.id === updatedChild.id || r._id === updatedChild.id ? updatedChild : r
      );
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
    } catch (err) {
      console.error(err);
      alert("Error updating record");
    }
  };

  const content = {
    en: {
      home: "Home",
      title: "GROWTH GUARDIAN",
      register: "Register a Child",
      viewRecords: "VIEW CHILD RECORDS",
      delete: "Delete Record",
      update: "Update Registered Child",
      healthy: "Healthy",
      improving: "Improving",
      attention: "Needs Attention",
      confirmDelete: "Are you sure you want to delete this child's record?",
      logout: "Log Out",
      search: "Search by name...",
    },
    hi: {
      home: "होम",
      title: "विकास संरक्षक",
      register: "नया बच्चा पंजीकृत करें",
      viewRecords: "बच्चे के रिकॉर्ड देखें",
      delete: "रिकॉर्ड हटाएँ",
      healthy: "स्वस्थ",
      improving: "सुधार हो रहा है",
      attention: "ध्यान देने की आवश्यकता",
      update: "रिकॉर्ड अपडेट करें",
      confirmDelete: "क्या आप वाकई इस बच्चे का रिकॉर्ड हटाना चाहते हैं?",
      logout: "लॉग आउट",
      search: "नाम से खोजें",
    },
  };

  const chromaItems = filteredRecords.map((r) => ({
    id: r.child_id || r._id || r.id,
    title: r.name || "Unnamed",
    uniqueId: r.child_id || r._id || r.id,
    subtitle: `${r.age || "?"} years • ${r.gender || "Unknown"}`,
    borderColor: "#3B82F6",
    gradient: "linear-gradient(145deg, #3B82F6, #1E40AF)",
    onClick: () => handleChildClick(r),
  }));

  return (
    <div className="viewrecords-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/backgroundViewRecords.mp4" type="video/mp4" />
      </video>
{sidebarOpen && (
  <div
    className="sidebar-backdrop"
    onClick={() => setSidebarOpen(false)}
  />
)}

<div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
  <ul className="sidebar-links">
    <li onClick={() => { navigate("/home"); setSidebarOpen(false); }}>{content[language].home}</li>
    <li onClick={() => { navigate("/register"); setSidebarOpen(false); }}>{content[language].register}</li>
    <li onClick={() => { navigate("/add-record/:childId"); setSidebarOpen(false); }}>{content[language].update}</li>
    <li onClick={() => { navigate("/view-records"); setSidebarOpen(false); }}>{content[language].view}</li>
    <li onClick={() => { navigate("/profile"); setSidebarOpen(false); }}>{content[language].profile}</li>
  </ul>
  <button
    className="logout-button"
    onClick={() => {
      navigate('/login');
      setSidebarOpen(false);
    }}
  >
    {content[language].logout}
  </button>
</div>


      <div className="top-left-brand">
        <MdFamilyRestroom className="brand-icon" />
        <h1 className={`brand-title ${language === "hi" ? "hindi-title" : ""}`}>
          {content[language].title}
        </h1>
        <FaBars className="menu-icon" onClick={toggleSidebar} />
      </div>

            <div className="language-card">
        <button className={`lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>English</button>
        <button className={`lang-btn ${language === "hi" ? "active" : ""}`} onClick={() => setLanguage("hi")}>हिन्दी</button>
      </div>

      <h2 className="records-title">
        <MdChildCare className="title-icon" /> {content[language].viewRecords}
      </h2>

      <ChildSpotlightCard child={spotlightChild} language={language} />

      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder={content[language].search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      <div className={`encouragement-carousel ${fadeIn ? "fade-in" : "fade-out"}`}>
        <p>{encouragements[language]?.[encourageIndex] || "💬 You're making a difference!"}</p>
      </div>

      {isLoading ? (
        <div className="loader-wrapper">Loading records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="no-records-container">No records found.</div>
      ) : (
        <>
          <div className="health-summary-cards">
            <div className="summary-card healthy">✅ {content[language].healthy}: {healthyCount}</div>
            <div className="summary-card improving">🕊️ {content[language].improving}: {improvingCount}</div>
            <div className="summary-card attention">⚠️ {content[language].attention}: {attentionCount}</div>
          </div>
          <ChromaGrid items={chromaItems} columns={3} rows={2} radius={220} />
        </>
      )}

      {showModal && selectedChild && (
        <ChildSummaryModal
          child={selectedChild}
          onClose={closeModal}
          onDelete={handleDeleteChild}
          onUpdate={handleUpdateChild}
          language={language}
        />
      )}
    </div>
  );
}

export default ViewRecords;

        