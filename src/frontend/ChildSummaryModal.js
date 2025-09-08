import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaEdit } from "react-icons/fa";
import { jsPDF } from 'jspdf';
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
    const [modalLanguage, setModalLanguage] = useState(language);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showInvalidIdPopup, setShowInvalidIdPopup] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setSpinPhoto(true);
        const timer = setTimeout(() => setSpinPhoto(false), 800);
        return () => clearTimeout(timer);
    }, [child]);
    useEffect(() => {
        if (showDeleteConfirm) {
            setTimeout(() => {
                document.querySelector(".popup-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [showDeleteConfirm]);

    useEffect(() => {
        setModalLanguage(language);
    }, [language]);


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
            { label: "Average Weight (kg)", data: avgWeight, borderColor: "red", borderDash: [5, 5] }
        ]
    };

    const heightData = {
        labels: ages.map((a) => `Age ${a}`),
        datasets: [
            { label: "Child Height (cm)", data: heightDataPoints, borderColor: "green", backgroundColor: "rgba(0,255,0,0.2)", fill: true },
            { label: "Average Height (cm)", data: avgHeight, borderColor: "orange", borderDash: [5, 5] }
        ]
    };

    const translations = {
        en: {
            download: "Download Record",
            delete: "Delete Record",
            update: "Update Record",
            confirmDelete: "Are you sure you want to delete this child's record? This action cannot be undone.",
            enterId: "Enter Unique ID",
            promptId: "Please enter the unique ID to download the record.",
            invalidId: "Invalid Unique ID.",
            close: "Close",
            yes: "Yes",
            no: "No",
            uniqueId: "Unique ID",
            moodLabel: "Select Child's Mood Today:",
            age: "Age",
            gender: "Gender",
            guardian: "Guardian",
            weight: "Weight",
            height: "Height",
            illness: "Recent Illness",
            malnutrition: "Signs of Malnutrition",
            healthy: "Healthy",
            improving: "Improving",
            attention: "Needs Attention",
            healthyMessage: "✅ Your child’s growth is on track. Keep it up!",
            alertMessage: "⚠️ Please consult a health professional for guidance.",
            encouragement1: "🎉 Small efforts lead to big outcomes — you're building a healthy future.",
            encouragement2: "⚠️ Some signs of malnutrition were detected. You're taking the right step by monitoring closely.",
            encouragement3: "👩‍⚕️ Consider consulting a health professional for personalized guidance.",
            weightProgress: "Weight Progress",
            heightProgress: "Height Progress",
            futureGrowth: "Future Growth: Together, we build a healthier future. 🌱",
            guardianName: "Parents/Guardian’s Name",
            chartSubtitle: "This chart tracks your child's growth over time."
        },
        hi: {
            download: "रिकॉर्ड डाउनलोड करें",
            delete: "रिकॉर्ड हटाएँ",
            update: "रिकॉर्ड अपडेट करें",
            confirmDelete: "क्या आप वाकई इस बच्चे का रिकॉर्ड हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
            enterId: "अद्वितीय आईडी दर्ज करें",
            promptId: "रिकॉर्ड डाउनलोड करने के लिए अद्वितीय आईडी दर्ज करें।",
            invalidId: "अमान्य अद्वितीय आईडी।",
            close: "बंद करें",
            yes: "हाँ",
            no: "नहीं",
            uniqueId: "अद्वितीय आईडी",
            moodLabel: "बच्चे का मूड चुनें:",
            age: "उम्र",
            gender: "लिंग",
            guardian: "अभिभावक",
            weight: "वज़न",
            height: "कद",
            illness: "हाल की बीमारी",
            malnutrition: "कुपोषण के संकेत",
            healthy: "स्वस्थ",
            improving: "सुधार हो रहा है",
            attention: "ध्यान देने की आवश्यकता",
            healthyMessage: "✅ आपके बच्चे की वृद्धि सही दिशा में है। इसी तरह आगे बढ़ते रहें!",
            alertMessage: "⚠️ कृपया किसी स्वास्थ्य विशेषज्ञ से सलाह लें।",
            encouragement1: "🎉 छोटे प्रयास बड़े परिणाम लाते हैं — आप एक स्वस्थ भविष्य बना रहे हैं।",
            encouragement2: "⚠️ कुछ कुपोषण के संकेत पाए गए हैं। आप सही कदम उठा रहे हैं।",
            encouragement3: "👩‍⚕️ व्यक्तिगत सलाह के लिए किसी स्वास्थ्य विशेषज्ञ से संपर्क करें।",
            weightProgress: "वज़न की प्रगति",
            heightProgress: "कद की प्रगति",
            futureGrowth: "भविष्य की वृद्धि: साथ मिलकर, हम एक स्वस्थ भविष्य बनाते हैं। 🌱",
            guardianName: "अभिभावक का नाम",
            chartSubtitle: "यह चार्ट आपके बच्चे की समय के साथ वृद्धि को ट्रैक करता है।"
        }
    };

    const handleDownloadClick = () => setShowUniqueIdPopup(true);

    const handleUniqueIdSubmit = async (e) => {
        e.preventDefault();
        const childIdKey = child.child_id || child._id || child.id;

        if (uniqueIdInput === String(childIdKey)) {
            setShowUniqueIdPopup(false);
            setUniqueIdInput("");

            // Delay the PDF generation to ensure the popup is gone and animations are finished
            setTimeout(async () => {
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'in',
                    format: 'letter'
                });

                const lang = modalLanguage;
                const t = translations[lang];
                let y = 0.5;

                // Add GROWTH GUARDIAN title with bold font
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(22);
                pdf.text("GROWTH GUARDIAN", 4.25, y, { align: 'center' });
                y += 0.3;

                // Add subtitle with italic font
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(10);
                pdf.text("Empowering every child's journey", 4.25, y, { align: 'center' });
                y += 0.5;
                pdf.setFont("helvetica", "normal"); // Reset font

                // Add child photo if available
                if (child.photo) {
                    try {
                        const response = await fetch(child.photo);
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                            const base64data = reader.result;
                            const imgSize = 1.5;
                            pdf.addImage(base64data, 'JPEG', 4.25 - imgSize / 2, y, imgSize, imgSize);
                            y += imgSize + 0.3;

                            // Add child details
                            pdf.setFontSize(16);
                            pdf.text("Child Record", 4.25, y, { align: 'center' });
                            y += 0.3;
                            pdf.line(0.5, y, 8.0, y);
                            y += 0.3;

                            pdf.setFontSize(12);
                            const details = [
                                `${t.uniqueId}: ${child.child_id || child._id || child.id}`,
                                `Name: ${child.name}`,
                                `${t.guardianName}: ${child.guardian}`,
                                `${t.age}: ${child.age} years`,
                                `${t.gender}: ${child.gender}`,
                                `${t.weight}: ${child.weight} kg`,
                                `${t.height}: ${child.height} cm`,
                                `${t.illness}: ${child.illnesses || "None"}`,
                                `${t.malnutrition}: ${child.malnutrition?.hasSigns === "yes" ? child.malnutrition.details : "No"}`
                            ];

                            details.forEach(line => {
                                pdf.text(line, 0.7, y);
                                y += 0.25;
                            });
                            y += 0.3;

                            // Add encouragement text
                            pdf.setFontSize(16);
                            pdf.text("Progress Status", 4.25, y, { align: 'center' });
                            y += 0.3;
                            pdf.line(0.5, y, 8.0, y);
                            y += 0.3;

                            const encouragement = [];
                            if (child.malnutrition?.hasSigns === "yes") {
                                encouragement.push(t.alertMessage);
                                encouragement.push(t.encouragement2);
                                encouragement.push(t.encouragement3);
                            } else {
                                encouragement.push(t.healthyMessage);
                                encouragement.push(t.encouragement1);
                            }

                            pdf.setFontSize(12);
                            encouragement.forEach(text => {
                                const splitText = pdf.splitTextToSize(text, 7.5);
                                pdf.text(splitText, 0.7, y);
                                y += (splitText.length * 0.25) + 0.1;
                            });

                            pdf.save(`${child.name}_Record.pdf`);
                        };
                    } catch (error) {
                        console.error("Failed to load image for PDF:", error);
                        // Continue with text-only PDF if image fails
                        generatePdfWithoutImage(pdf, lang, t, y);
                    }
                } else {
                    generatePdfWithoutImage(pdf, lang, t, y);
                }
            }, 800);
        } else {
            setShowInvalidIdPopup(true);
        }
    };

    const generatePdfWithoutImage = (pdf, lang, t, y) => {
        // Add GROWTH GUARDIAN title with bold font
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("GROWTH GUARDIAN", 4.25, y, { align: 'center' });
        y += 0.3;

        // Add subtitle with italic font
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.text("Empowering every child's journey", 4.25, y, { align: 'center' });
        y += 0.5;
        pdf.setFont("helvetica", "normal"); // Reset font

        pdf.setFontSize(16);
        pdf.text("Child Record", 4.25, y, { align: 'center' });
        y += 0.3;
        pdf.line(0.5, y, 8.0, y);
        y += 0.3;

        pdf.setFontSize(12);
        const details = [
            `${t.uniqueId}: ${child.child_id || child._id || child.id}`,
            `Name: ${child.name}`,
            `${t.guardianName}: ${child.guardian}`,
            `${t.age}: ${child.age} years`,
            `${t.gender}: ${child.gender}`,
            `${t.weight}: ${child.weight} kg`,
            `${t.height}: ${child.height} cm`,
            `${t.illness}: ${child.illnesses || "None"}`,
            `${t.malnutrition}: ${child.malnutrition?.hasSigns === "yes" ? child.malnutrition.details : "No"}`
        ];

        details.forEach(line => {
            pdf.text(line, 0.7, y);
            y += 0.25;
        });
        y += 0.3;

        // Add encouragement text
        pdf.setFontSize(16);
        pdf.text("Progress Status", 4.25, y, { align: 'center' });
        y += 0.3;
        pdf.line(0.5, y, 8.0, y);
        y += 0.3;

        const encouragement = [];
        if (child.malnutrition?.hasSigns === "yes") {
            encouragement.push(t.alertMessage);
            encouragement.push(t.encouragement2);
            encouragement.push(t.encouragement3);
        } else {
            encouragement.push(t.healthyMessage);
            encouragement.push(t.encouragement1);
        }

        pdf.setFontSize(12);
        encouragement.forEach(text => {
            const splitText = pdf.splitTextToSize(text, 7.5);
            pdf.text(splitText, 0.7, y);
            y += (splitText.length * 0.25) + 0.1;
        });

        pdf.save(`${child.name}_Record.pdf`);
    };


    const handleAddRecordClick = () => navigate(`/add-record/${child.id || child._id || child.child_id}`);

    const handleDeleteClick = () => setShowDeleteConfirm(true);

    const confirmDelete = async () => {
        try {
            const childIdKey = child?.child_id || child?._id || child?.id;
            if (!childIdKey) {
                console.error("❌ Child ID not found!");
                return;
            }
            const res = await fetch(`/child/${childIdKey}`, { method: "DELETE" });
            if (!res.ok) throw new Error("❌ Failed to delete record from cloud");

            onDelete(childIdKey);
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("🔴 Delete error:", err);
        }
    };

    const cancelDelete = () => setShowDeleteConfirm(false);
    const getProgressStatusKey = () => {
        if (child.malnutrition?.hasSigns === "yes") return "attention";
        if (child.weight >= 10 + child.age * 2 && child.height >= 70 + child.age * 7) return "healthy";
        return "improving";
    };
    const progressStatusKey = getProgressStatusKey();

    return (

        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-popup" onClick={(e) => e.stopPropagation()} id="modal-content-to-print">
                <div className="modal-buttons-top">
                    <button className="modal-close" onClick={onClose}>✖</button>
                    <button className="modal-download-btn" onClick={handleDownloadClick}>
                        <FaDownload style={{ marginRight: "6px" }} /> {translations[modalLanguage].download}
                    </button>
                </div>

                {child.photo && (
                    <div className="child-photo-wrapper">
                        <img src={child.photo} alt={child.name || "Child"} className={`child-photo ${spinPhoto ? "spin-photo" : ""}`} />
                    </div>
                )}
                
                <h2>{child.name}</h2>
                <div className="section-divider"></div>
                <div className={`progress-badge ${progressStatusKey}`}>
                    {translations[modalLanguage][progressStatusKey]}
                </div>
                <p className="unique-id-label"><strong>{translations[modalLanguage].uniqueId}:</strong> {child.child_id || child._id || child.id}</p>
                <div className="language-toggle">
                    <button onClick={() => setModalLanguage(modalLanguage === "en" ? "hi" : "en")}>
                        {modalLanguage === "en" ? "हिन्दी में पढ़िए" : "Read in English"}
                    </button>
                </div>

                <div className="gradient-card">
                    <div className="mood-tracker">
                        <label className="mood-label">{translations[modalLanguage].moodLabel}</label>
                        <div className="mood-options">
                            {["😊", "😐", "😢"].map((emoji) => (
                                <button
                                    key={emoji}
                                    className={`mood-btn ${selectedMood === emoji ? "selected" : ""}`}
                                    onClick={() => setSelectedMood(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p><strong>{translations[modalLanguage].guardianName}:</strong> <span className="field-value">{child.guardian}</span></p>
                    <p><strong>{translations[modalLanguage].age}:</strong> <span className="field-value">{child.age} years</span></p>
                    <p><strong>{translations[modalLanguage].gender}:</strong> <span className="field-value">{child.gender}</span></p>
                    <p><strong>{translations[modalLanguage].weight}:</strong> <span className="field-value">{child.weight} kg</span></p>
                    <p><strong>{translations[modalLanguage].height}:</strong> <span className="field-value">{child.height} cm</span></p>
                    <p><strong>{translations[modalLanguage].illness}:</strong> <span className="field-value">{child.illnesses || "None"}</span></p>
                    <p><strong>{translations[modalLanguage].malnutrition}:</strong> <span className="field-value">
                        {child.malnutrition?.hasSigns === "yes" ? child.malnutrition.details : "No"}
                    </span></p>
                </div>

                {child.malnutrition?.hasSigns === "yes" ? (
                    <div className="encouragement-text">
                        <p className="encouragement-primary warning">
                            {translations[modalLanguage].alertMessage}
                        </p>
                        <p>{translations[modalLanguage].encouragement2}</p>
                        <p>{translations[modalLanguage].encouragement3}</p>
                    </div>
                ) : (
                    <div className="encouragement-text">
                        <p className="encouragement-primary success">
                            {translations[modalLanguage].healthyMessage}
                        </p>
                        <p>{translations[modalLanguage].encouragement1}</p>
                    </div>
                )}
                
                <h3>{translations[modalLanguage].weightProgress}</h3>
                <div className="graph-wrapper">
                    <Line data={weightData} height={300} options={{ maintainAspectRatio: false }} />
                </div>
                <h3>{translations[modalLanguage].heightProgress}</h3>
                <div className="graph-wrapper">
                    <Line data={heightData} height={300} options={{ maintainAspectRatio: false }} />
                </div>
                <div className="modal-actions">
                    <button className="delete-button" onClick={handleDeleteClick}>{translations[modalLanguage].delete}</button>
                    <button className="update-card-btn" onClick={handleAddRecordClick}>
                        <FaEdit style={{ marginRight: "6px" }} /> {translations[modalLanguage].update}
                    </button>
                </div>
                <div className="footer-message">
                    <p><strong>{translations[modalLanguage].futureGrowth}:</strong> </p>
                </div>
                {/* Unique ID Popup */}
                {showUniqueIdPopup && (
                    <div className="unique-id-modal-overlay" onClick={() => setShowUniqueIdPopup(false)}>
                        <div className="unique-id-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="unique-id-modal-close" onClick={() => setShowUniqueIdPopup(false)}>✖</button>
                            <form onSubmit={handleUniqueIdSubmit}>
                                <h2>{translations[modalLanguage].enterId}</h2>
                                <p>{translations[modalLanguage].promptId}</p>
                                <input
                                    type="text"
                                    value={uniqueIdInput}
                                    onChange={(e) => setUniqueIdInput(e.target.value)}
                                    placeholder={translations[modalLanguage].uniqueId}
                                    required
                                />
                                <button type="submit" className="unique-id-modal-submit">{translations[modalLanguage].download}</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Invalid ID Popup */}
                {showInvalidIdPopup && (
                    <div className="unique-id-modal-overlay" onClick={() => setShowInvalidIdPopup(false)}>
                        <div className="invalid-id-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{translations[modalLanguage].invalidId}</h2>
                            <button onClick={() => setShowInvalidIdPopup(false)}>{translations[modalLanguage].close}</button>
                        </div>
                    </div>
                )}
                {showDeleteConfirm && (
                    <div className="unique-id-modal-overlay" onClick={cancelDelete}>
                        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                            <h2>{translations[modalLanguage].confirmDelete}</h2>
                            <p>This action cannot be undone.</p>
                            <div className="delete-buttons">
                                <button onClick={confirmDelete}>{translations[modalLanguage].yes}</button>
                                <button onClick={cancelDelete}>{translations[modalLanguage].no}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChildSummaryModal;
