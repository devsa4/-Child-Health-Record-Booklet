import React, { useEffect, useState, useRef } from "react";
import { MdFamilyRestroom, MdChildCare } from "react-icons/md";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ChromaGrid from "./ChromaGrid";
import ChildSummaryModal from "./ChildSummaryModal";
import "./ViewRecords.css";

function ViewRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [language, setLanguage] = useState("en");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const sidebarRef = useRef();
  const navigate = useNavigate();

  // ✅ Fetch records only from cloud
  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await fetch("/children"); // Backend endpoint connected to MongoDB Atlas
        if (!res.ok) throw new Error("Failed to fetch records from cloud");
        const data = await res.json();
        setRecords(data);
        setFilteredRecords(data);
      } catch (err) {
        console.error("Cloud Fetch Error:", err);
        setRecords([]);
        setFilteredRecords([]);
      }
    }
    fetchRecords();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleChildClick = (child) => {
    setSelectedChild(child);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedChild(null);
    setShowModal(false);
  };

  // Delete child directly in cloud
  // Delete child directly in cloud
const handleDeleteChild = async (childId) => {
  try {
    const res = await fetch(`/child/${childId}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok) {
      console.log(`✅ Deleted child: ${childId}`);
      const updatedRecords = records.filter(r => r.child_id !== childId && r._id !== childId && r.id !== childId);
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
      closeModal();
    } else {
      // ignore not found errors
      console.log(`ℹ️ ${data.message || "Child not found, ignoring."}`);
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting record from cloud");
  }
};



  // Update child directly in cloud
  const handleUpdateChild = async (updatedChild) => {
    try {
      const res = await fetch(`/child/${updatedChild.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedChild),
      });
      if (!res.ok) throw new Error("Failed to update record in cloud");

      const updatedRecords = records.map((r) =>
        r.id === updatedChild.id || r._id === updatedChild.id ? updatedChild : r
      );
      setRecords(updatedRecords);
      setFilteredRecords(updatedRecords);
    } catch (err) {
      console.error(err);
      alert("Error updating record in cloud");
    }
  };

  // Close sidebar on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Filter records by search term
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = records.filter((r) =>
      r.name ? r.name.toLowerCase().includes(term) : false
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const content = {
    en: {
      home: "Home",
      title: "GROWTH GUARDIAN",
      register: "Register a Child",
      viewRecords: "View Child Records",
      delete: "Delete Record",
      update: "Update Record",
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
      update: "रिकॉर्ड अपडेट करें",
      confirmDelete: "क्या आप वाकई इस बच्चे का रिकॉर्ड हटाना चाहते हैं?",
      logout: "लॉग आउट",
      search: "नाम से खोजें",
    },
  };

  const chromaItems = filteredRecords.map((r) => ({
  id: r.child_id || r._id || r.id,
  title: `${r.name || "Unnamed"} (${r.child_id || r._id || r.id})`,
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

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} ref={sidebarRef}>
        <ul className="sidebar-links">
          <li onClick={() => navigate("/home")}>{content[language].home}</li>
          <li onClick={() => navigate("/register")}>{content[language].register}</li>
          <li>{content[language].viewRecords}</li>
        </ul>
        <button className="logout-button">{content[language].logout}</button>
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

      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder={content[language].search}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {filteredRecords.length === 0 ? (
        <div className="no-records-container">
          <p>No Records Found</p>
        </div>
      ) : (
        <ChromaGrid items={chromaItems} columns={3} rows={2} radius={220} />
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
