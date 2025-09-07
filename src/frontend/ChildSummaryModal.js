import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaEdit } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "./ChildSummaryModal.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function ChildSummaryModal({ child, onClose, onDelete, language }) {
  const [spinPhoto, setSpinPhoto] = useState(false);
  const [showUniqueIdPopup, setShowUniqueIdPopup] = useState(false);
  const [uniqueIdInput, setUniqueIdInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInvalidIdPopup, setShowInvalidIdPopup] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSpinPhoto(true);
    const timer = setTimeout(() => setSpinPhoto(false), 800);
    return () => clearTimeout(timer);
  }, [child]);

  const currentAge = parseInt(child.age) || 0;
  const currentWeight = parseFloat(child.weight) || 0;
  const currentHeight = parseFloat(child.height) || 0;

  const ages = [currentAge - 1, currentAge, currentAge + 1].filter((a) => a > 0);
  const weightDataPoints = ages.map((a) =>
    a === currentAge ? currentWeight : currentWeight - 2 + (a - currentAge) * 2
  );
  const heightDataPoints = ages.map((a) =>
    a === currentAge ? currentHeight : currentHeight - 5 + (a - currentAge) * 5
  );
  const avgWeight = ages.map((a) => 10 + a * 2);
  const avgHeight = ages.map((a) => 70 + a * 7);

  const weightData = {
    labels: ages.map((a) => `Age ${a}`),
    datasets: [
      { label: "Child Weight (kg)", data: weightDataPoints, borderColor: "blue", backgroundColor: "rgba(0,0,255,0.2)", fill: true },
      { label: "Average Weight (kg)", data: avgWeight, borderColor: "red", borderDash: [5,5] }
    ]
  };

  const heightData = {
    labels: ages.map((a) => `Age ${a}`),
    datasets: [
      { label: "Child Height (cm)", data: heightDataPoints, borderColor: "green", backgroundColor: "rgba(0,255,0,0.2)", fill: true },
      { label: "Average Height (cm)", data: avgHeight, borderColor: "orange", borderDash: [5,5] }
    ]
  };

  const content = {
    en: {
      download: "Download Record",
      delete: "Delete Record",
      update: "Update Record",
      confirmDelete: "Are you sure you want to delete this child's record? This action cannot be undone.",
      enterId: "Enter Unique ID",
      promptId: "Please enter the unique ID to download the record.",
      invalidId: "Invalid Unique ID.",
      deleteSuccess: "Record deleted successfully.",
      close: "Close",
      yes: "Yes",
      no: "No"
    },
    hi: {
      download: "रिकॉर्ड डाउनलोड करें",
      delete: "रिकॉर्ड हटाएँ",
      update: "रिकॉर्ड अपडेट करें",
      confirmDelete: "क्या आप वाकई इस बच्चे का रिकॉर्ड हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
      enterId: "अद्वितीय आईडी दर्ज करें",
      promptId: "रिकॉर्ड डाउनलोड करने के लिए अद्वितीय आईडी दर्ज करें।",
      invalidId: "अमान्य अद्वितीय आईडी।",
      deleteSuccess: "रिकॉर्ड सफलतापूर्वक हटा दिया गया।",
      close: "बंद करें",
      yes: "हाँ",
      no: "नहीं"
    }
  };

  const currentContent = content[language];

  const handleDownloadClick = () => setShowUniqueIdPopup(true);

  const handleUniqueIdSubmit = (e) => {
  e.preventDefault();
  const childIdKey = child.child_id || child._id || child.id;

  if (uniqueIdInput === String(childIdKey)) {
    const modalContent = document.getElementById('modal-content-to-print');

    // Apply temporary styles for PDF
    const originalBackground = modalContent.style.backgroundColor;
    modalContent.style.backgroundColor = "#fff"; // Ensure white background
    modalContent.style.width = "100%";
    modalContent.style.maxWidth = "800px"; // optional for wider graph
    modalContent.style.padding = "20px";

    setTimeout(() => {
      html2pdf()
        .from(modalContent)
        .set({
          margin: 0.5,
          filename: `${child.name}_Record.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, logging: true, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .save()
        .then(() => {
          // Reset temporary styles
          modalContent.style.backgroundColor = originalBackground;
        });
    }, 300);

    setShowUniqueIdPopup(false);
    setUniqueIdInput("");
  } else {
    setShowInvalidIdPopup(true);
  }
};

  const handleAddRecordClick = () => navigate(`/add-record/${child.id || child._id || child.child_id}`);

  const handleDeleteClick = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    try {
      const childIdKey = child?.child_id || child?._id || child?.id;
      if (!childIdKey) { alert("❌ Child ID not found!"); return; }

      const res = await fetch(`/child/${childIdKey}`, { method: "DELETE" });
      if (!res.ok) throw new Error("❌ Failed to delete record from cloud");

      onDelete(childIdKey);
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
    } catch (err) {
      console.error("🔴 Delete error:", err);
      alert("Error deleting record from cloud");
    }
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-popup" onClick={(e) => e.stopPropagation()} id="modal-content-to-print">
        <div className="modal-buttons-top">
          <button className="modal-close" onClick={onClose}>✖</button>
          <button className="modal-download-btn" onClick={handleDownloadClick}>
            <FaDownload style={{marginRight:"6px"}} /> {currentContent.download}
          </button>
        </div>

        {child.photo && (
          <div className="child-photo-wrapper">
            <img src={child.photo} alt={child.name || "Child"} className={`child-photo ${spinPhoto ? "spin-photo" : ""}`} />
          </div>
        )}

        <h2>
          {child.name}
          <span style={{ fontSize: "0.8em", color: "#888", marginLeft: "8px" }}>
            ({child.child_id || child._id || child.id})
          </span>
        </h2>

        <p><strong>Age:</strong> {child.age} years</p>
        <p><strong>Gender:</strong> {child.gender}</p>
        <p><strong>Weight:</strong> {child.weight} kg</p>
        <p><strong>Height:</strong> {child.height} cm</p>
        <p><strong>Recent Illness:</strong> {child.illnesses || "None"}</p>
        <p><strong>Signs of Malnutrition:</strong> {child.malnutrition?.hasSigns === "yes" ? child.malnutrition.details : "No"}</p>

        <h3>Weight Progress</h3>
        <div className="graph-wrapper">
          <Line data={weightData} height={300} options={{ maintainAspectRatio: false }} />
        </div>

        <h3>Height Progress</h3>
        <div className="graph-wrapper">
          <Line data={heightData} height={300} options={{ maintainAspectRatio: false }} />
        </div>

        <div className="modal-actions">
          <button className="delete-button" onClick={handleDeleteClick}>{currentContent.delete}</button>
          <button className="update-card-btn" onClick={handleAddRecordClick}>
            <FaEdit style={{ marginRight: "6px" }} /> {currentContent.update}
          </button>
        </div>

        {/* Unique ID Popup */}
        {showUniqueIdPopup && (
          <div className="unique-id-modal-overlay" onClick={() => setShowUniqueIdPopup(false)}>
            <div className="unique-id-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="unique-id-modal-close" onClick={() => setShowUniqueIdPopup(false)}>✖</button>
              <form onSubmit={handleUniqueIdSubmit}>
                <h2>{currentContent.enterId}</h2>
                <p>{currentContent.promptId}</p>
                <input
                  type="text"
                  value={uniqueIdInput}
                  onChange={(e) => setUniqueIdInput(e.target.value)}
                  placeholder="Unique ID"
                  required
                />
                <button type="submit" className="unique-id-modal-submit">{currentContent.download}</button>
              </form>
            </div>
          </div>
        )}

        {/* Invalid ID Popup */}
        {showInvalidIdPopup && (
          <div className="unique-id-modal-overlay" onClick={() => setShowInvalidIdPopup(false)}>
            <div className="invalid-id-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{currentContent.invalidId}</h2>
              <button onClick={() => setShowInvalidIdPopup(false)}>{currentContent.close}</button>
            </div>
          </div>
        )}

        {/* Delete Confirm Popup */}
        {/* Delete Confirm Popup */}
{showDeleteConfirm && (
  <div className="unique-id-modal-overlay" onClick={cancelDelete}>
    <div className="popup-card" onClick={(e) => e.stopPropagation()}>
      <h2>{currentContent.confirmDelete}</h2>
      <div className="delete-buttons">
        <button onClick={confirmDelete}>{currentContent.yes}</button>
        <button onClick={cancelDelete}>{currentContent.no}</button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

export default ChildSummaryModal;
