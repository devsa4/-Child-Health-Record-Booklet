import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaEdit } from "react-icons/fa";
import { jsPDF } from 'jspdf';

import { FaWhatsapp } from "react-icons/fa";
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

// Register Chart.js components
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
    const modalRef = useRef(null);
    const [popupMessage, setPopupMessage] = useState("");
const [showPopup, setShowPopup] = useState(false);

    const [showWhatsappPopup, setShowWhatsappPopup] = useState(false);
const [whatsappNumber, setWhatsappNumber] = useState("");
const [whatsappLinkToOpen, setWhatsappLinkToOpen] = useState(null);

    const [showNutritionTips, setShowNutritionTips] = useState(false);
    const [showUniqueIdPopup, setShowUniqueIdPopup] = useState(false);
    const [uniqueIdInput, setUniqueIdInput] = useState("");
    const [modalLanguage, setModalLanguage] = useState(language);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showInvalidIdPopup, setShowInvalidIdPopup] = useState(false);
    const [selectedMood, setSelectedMood] = useState(null);

    const navigate = useNavigate();

    // Use a unique key for the modal to reset state on child change
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
    useEffect(() => {
    if (showWhatsappPopup && modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, [showWhatsappPopup]);

useEffect(() => {
    if (showUniqueIdPopup && modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, [showUniqueIdPopup]);

useEffect(() => {
    if (showDeleteConfirm && modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, [showDeleteConfirm]);

useEffect(() => {
    if (showInvalidIdPopup && modalRef.current) {
        modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, [showInvalidIdPopup]);

useEffect(() => {
    if (showWhatsappPopup) {
        const modalContent = document.getElementById("modal-content-to-print");
        const popup = document.querySelector(".whatsapp-popup-card");
        if (modalContent && popup) {
            // Calculate vertical center relative to modal
            const modalRect = modalContent.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();
            const scrollTop = popup.offsetTop - (modalRect.height / 2) + (popupRect.height / 2);
            modalContent.scrollTo({ top: scrollTop, behavior: "smooth" });
        }
    }
}, [showWhatsappPopup]);

    // Data for charts including historical records
    const allRecords = [...(child.history || []), { date: new Date().toLocaleDateString('en-GB'), weight: child.weight, height: child.height }];

    const weightData = {
        labels: allRecords.map(record => record.date),
        datasets: [
            {
                label: "Child Weight (kg)",
                data: allRecords.map(record => record.weight),
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.2)",
                fill: true
            },
            {
                label: "Average Weight (kg)",
                data: allRecords.map((_, index) => {
                    // This is a simplified average. A real-world app would use age-specific growth charts.
                    return 10 + (child.age - (allRecords.length - 1 - index)) * 2;
                }),
                borderColor: "red",
                borderDash: [5, 5]
            }
        ]
    };

    const heightData = {
        labels: allRecords.map(record => record.date),
        datasets: [
            {
                label: "Child Height (cm)",
                data: allRecords.map(record => record.height),
                borderColor: "green",
                backgroundColor: "rgba(0,255,0,0.2)",
                fill: true
            },
            {
                label: "Average Height (cm)",
                data: allRecords.map((_, index) => {
                    // Simplified average
                    return 70 + (child.age - (allRecords.length - 1 - index)) * 7;
                }),
                borderColor: "orange",
                borderDash: [5, 5]
            }
        ]
    };

    // Translations for multiple languages
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
            malnutrition: "Visible Signs of Malnutrition",
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
            whatsapp: "Send On WhatsApp",
            tips: " 🍎 See Nutrition Tips",
            green: "🥦 Add more green vegetables to meals.",
      milk: "🥛 Ensure at least 2 glasses of milk per day.",
      vitamin: "🍊 Include vitamin-rich fruits like oranges & papaya.",
      protein: "🥚 Add protein sources: eggs, beans, pulses.",
      hydrate: "💧 Keep your child hydrated throughout the day.",
      nutritiontips: "Nutrition Tips",
            updateTimeline: "Update Record to see the timeline of the progress.",
            chartSubtitle: "This chart tracks your child's growth over time.",
            recommendationsTitle: "Actionable Recommendations",
            noRecs: "Great job! Keep up the good work on monitoring your child's growth.",
            lowWeightRec: "Consider adding more protein and calorie-rich foods like lentils, eggs, and nuts to support healthy weight gain.",
            lowHeightRec: "Ensure your child is getting enough calcium and Vitamin D from sources like milk, fortified cereals, and sunlight to support bone growth.",
            illnessRec: "Remember to follow the doctor's instructions for any recent illness. Adequate rest and hydration are crucial for recovery.",
            malnutritionRec: "It's vital to follow a healthcare professional's advice. Regular check-ups are highly recommended.",
            malnutritionEncouragement: "Remember that every step you take to provide nutritious food and care makes a huge difference. You're doing a great job!"
        },
        hi: {
            download: "रिकॉर्ड डाउनलोड करें",
            delete: "रिकॉर्ड हटाएँ",
            update: "रिकॉर्ड अपडेट करें",
            nutritiontips: "पोषण सुझाव",
            confirmDelete: "क्या आप वाकई इस बच्चे का रिकॉर्ड हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
            enterId: "अद्वितीय आईडी दर्ज करें",
            promptId: "रिकॉर्ड डाउनलोड करने के लिए अद्वितीय आईडी दर्ज करें।",
           
            close: "बंद करें",
            tips: " 🍎 पोषण सुझाव देखें",
            green: "🥦 भोजन में अधिक हरी सब्जियाँ शामिल करें।",
            milk: "🥛 दिन में कम से कम 2 गिलास दूध सुनिश्चित करें।",
            vitamin: "🍊 संतरे और पपीता जैसे विटामिन युक्त फल शामिल करें।",
            protein: "🥚 प्रोटीन स्रोत जोड़ें: अंडे, बीन्स, दालें।",
            hydrate: "💧 पूरे दिन अपने बच्चे को हाइड्रेटेड रखें।",
            invalidId: "अमान्य अद्वितीय आईडी।",
            yes: "हाँ",
            whatsapp: "व्हाट्सएप पर भेजें",
            updateTimelie: "प्रगति की समयरेखा देखने के लिए रिकॉर्ड अपडेट करें।",
            no: "नहीं",
            uniqueId: "अद्वितीय आईडी",
            moodLabel: "बच्चे का मूड चुनें:",
            age: "उम्र",
            gender: "लिंग",
            guardian: "अभिभावक",
            weight: "वज़न",
            height: "कद",
            illness: "हाल की बीमारी",
            malnutrition: "कुपोषण के दृश्य संकेत",
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
            chartSubtitle: "यह चार्ट आपके बच्चे की समय के साथ वृद्धि को ट्रैक करता है।",
            recommendationsTitle: "कार्ययोग्य सुझाव",
            noRecs: "बहुत बढ़िया! अपने बच्चे की वृद्धि पर नज़र रखना जारी रखें।",
            lowWeightRec: "स्वस्थ वज़न बढ़ाने में मदद के लिए, दालों, अंडों और मेवों जैसे प्रोटीन और कैलोरी से भरपूर खाद्य पदार्थ शामिल करें।",
            lowHeightRec: "सुनिश्चित करें कि आपके बच्चे को दूध और हरी पत्तेदार सब्जियों जैसे स्रोतों से पर्याप्त कैल्शियम और विटामिन डी मिल रहा है।",
            illnessRec: "हाल की किसी भी बीमारी के लिए डॉक्टर के निर्देशों का पालन करना याद रखें। पर्याप्त आराम और हाइड्रेशन स्वास्थ्य के लिए महत्वपूर्ण हैं।",
            malnutritionRec: "स्वास्थ्य पेशेवर की सलाह का पालन करना महत्वपूर्ण है। नियमित जांच की सलाह दी जाती है।",
            malnutritionEncouragement: "याद रखें कि पौष्टिक भोजन और देखभाल प्रदान करने के लिए आप जो भी कदम उठा रहे हैं, वह बहुत बड़ा बदलाव लाएगा। आप बहुत अच्छा काम कर रहे हैं!"
        }
    };

    const t = translations[modalLanguage];

    // Functions for downloading, deleting, and updating
    const handleDownloadClick = () => setShowUniqueIdPopup(true);

    const handleUniqueIdSubmit = async (e) => {
        e.preventDefault();
        const childIdKey = child.child_id || child._id || child.id;

        if (uniqueIdInput === String(childIdKey)) {
            setShowUniqueIdPopup(false);
            setUniqueIdInput("");

            setTimeout(async () => {
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
                let y = 0.5;

                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(22);
                pdf.text("GROWTH GUARDIAN", 4.25, y, { align: 'center' });
                y += 0.3;

                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(10);
                pdf.text("Empowering every child's journey", 4.25, y, { align: 'center' });
                y += 0.5;
                pdf.setFont("helvetica", "normal");

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
                            generatePdfContent(pdf, y, t);
                        };
                    } catch (error) {
                        console.error("Failed to load image for PDF:", error);
                        generatePdfContent(pdf, y, t);
                    }
                } else {
                    generatePdfContent(pdf, y, t);
                }
            }, 800);
        } else {
            setShowInvalidIdPopup(true);
        }
    };

    const generatePdfContent = (pdf, y, t) => {
        // Child details section
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

        // Progress status section
        pdf.setFontSize(16);
        pdf.text("Progress Status", 4.25, y, { align: 'center' });
        y += 0.3;
        pdf.line(0.5, y, 8.0, y);
        y += 0.3;

        const encouragement = getActionableRecommendations(child, translations[modalLanguage]);
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
        const childIdKey = child?.child_id || child?._id || child?.id;
        if (!childIdKey) {
            console.error("❌ Child ID not found!");
            return;
        }
        try {
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
  const avgWeight = 10 + child.age * 2;
  const avgHeight = 70 + child.age * 7;

  // If malnutrition signs present → Attention
  if (child.malnutrition?.hasSigns === "yes") return "attention";

  // If no illness & no malnutrition → Healthy
  if ((!child.illnesses || child.illnesses.toLowerCase() === "N/A"||child.illnesses.toLowerCase() === "Skip") &&
      (!child.malnutrition || child.malnutrition.hasSigns !== "yes")) {
    return "healthy";
  }

  // Otherwise check growth progress
  if (child.weight >= avgWeight && child.height >= avgHeight) return "healthy";

  return "improving";
};

    const progressStatusKey = getProgressStatusKey();

    // New function for actionable recommendations, including encouragement messages
    const getActionableRecommendations = (child, t) => {
        const recommendations = [];
        const avgWeight = 10 + child.age * 2;
        const avgHeight = 70 + child.age * 7;

        if (child.malnutrition?.hasSigns === "yes") {
            recommendations.push(t.malnutritionRec);
            recommendations.push(t.malnutritionEncouragement);
            recommendations.push(t.encouragement2); // Added general encouragement for malnutrition
            recommendations.push(t.encouragement3); // Added professional advice encouragement
        } else {
            if (child.weight < avgWeight * 0.95) {
                recommendations.push(t.lowWeightRec);
            }
    
            if (child.height < avgHeight * 0.95) {
                recommendations.push(t.lowHeightRec);
            }
            
            if (child.illnesses) {
                recommendations.push(t.illnessRec);
            }

            if (recommendations.length > 0) {
                 recommendations.unshift(t.encouragement1); // Add a general encouragement message at the beginning
            }
        }


        if (recommendations.length === 0) {
            recommendations.push(t.noRecs);
        }

        return recommendations;
    };
    
    const recommendations = getActionableRecommendations(child, t);


const handleWhatsappShare = async () => {
    if (!whatsappNumber) {
        setPopupMessage(modalLanguage === "en" ? 
            "Please enter a valid phone number." : 
            "कृपया मान्य फ़ोन नंबर दर्ज करें।"
        );
        setShowPopup(true);
        return;
    }

    const weightEmoji = "⚖️";
    const heightEmoji = "📏";
    const malnutritionEmoji = "⚠️";
    const heartEmoji = "💖";
    const smileEmoji = "😊";
    const phoneEmoji = "📲";

    const recsEn = recommendations.map((rec) => `• ${rec}`).join("\n");
    const recsHi = recommendations.map((rec) => {
        if (rec === t.lowWeightRec) return "• स्वस्थ वज़न बढ़ाने के लिए प्रोटीन और कैलोरी से भरपूर भोजन शामिल करें।";
        if (rec === t.lowHeightRec) return "• हड्डियों की वृद्धि के लिए पर्याप्त कैल्शियम और विटामिन डी लें।";
        if (rec === t.illnessRec) return "• हाल की बीमारी के लिए डॉक्टर के निर्देशों का पालन करें। पर्याप्त आराम और हाइड्रेशन ज़रूरी।";
        if (rec === t.malnutritionRec) return "• स्वास्थ्य पेशेवर की सलाह का पालन करें। नियमित जांच करें।";
        if (rec === t.malnutritionEncouragement) return "• पौष्टिक भोजन और देखभाल से बड़ा बदलाव आता है। आप बहुत अच्छा कर रहे हैं!";
        if (rec === t.encouragement1) return "• छोटे प्रयास बड़े परिणाम लाते हैं — स्वस्थ भविष्य के लिए बढ़िया काम!";
        if (rec === t.encouragement2) return "• कुपोषण के संकेत मिले? सही कदम उठा रहे हैं।";
        if (rec === t.encouragement3) return "• व्यक्तिगत सलाह के लिए स्वास्थ्य विशेषज्ञ से संपर्क करें।";
        return `• ${rec}`;
    }).join("\n");

    const fullMsg = `
${heartEmoji} *Greetings from _Growth Guardian_! This is your child's growth report!* ${phoneEmoji}

${smileEmoji} Child: ${child.name}
${weightEmoji} Weight: ${child.weight} kg
${heightEmoji} Height: ${child.height} cm
${malnutritionEmoji} Malnutrition: ${child.malnutrition?.hasSigns || "No"}

🌟 Recommendations:
${recsEn}

*_ग्रोथ गार्जियन_ की ओर से नमस्कार! यह आपके बच्चे की विकास रिपोर्ट है!* ${phoneEmoji}

${smileEmoji} बच्चा: ${child.name}
${weightEmoji} वज़न: ${child.weight} kg
${heightEmoji} कद: ${child.height} cm
${malnutritionEmoji} कुपोषण: ${child.malnutrition?.hasSigns || "नहीं"}

🌟 सुझाव:
${recsHi}
`.trim();

    try {
        await navigator.clipboard.writeText(fullMsg);
        
        setShowPopup(true);
        window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    } catch (err) {
        setPopupMessage(modalLanguage === "en" ? 
            "Failed to copy message. Please try manually." : 
            "संदेश कॉपी नहीं हुआ। कृपया मैन्युअल रूप से प्रयास करें।"
        );
        setShowPopup(true);
        window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    }

    setShowWhatsappPopup(false);
    setWhatsappNumber("");
};


    return (
        
        <div className="modal-overlay" onClick={onClose}>
         <div className="modal-content animate-popup" ref={modalRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
<div className="modal-buttons-top" style={{ display: "flex", justifyContent: "center", gap: "1rem", position: "relative" }}>
   
                    <button className="modal-close" onClick={onClose}>✖</button>
                    <button className="modal-download-btn" onClick={handleDownloadClick}>
                        <FaDownload style={{ marginRight: "6px" }} /> {t.download}
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
                    {t[progressStatusKey]}
                </div>
                <p className="unique-id-label"><strong>{t.uniqueId}:</strong> {child.child_id || child._id || child.id}</p>
                <div className="language-toggle">
                    <button onClick={() => setModalLanguage(modalLanguage === "en" ? "hi" : "en")}>
                        {modalLanguage === "en" ? "हिन्दी में पढ़िए" : "Read in English"}
                    </button>
                </div>

                <div className="gradient-card">
                    <div className="mood-tracker">
                        <label className="mood-label">{t.moodLabel}</label>
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
                    
                    <p><strong>{t.guardianName}:</strong> <span className="field-value">{child.guardian}</span></p>
                    <p><strong>{t.age}:</strong> <span className="field-value">{child.age} years</span></p>
                    <p><strong>{t.gender}:</strong> <span className="field-value">{child.gender}</span></p>
                    <p><strong>{t.weight}:</strong> <span className="field-value">{child.weight} kg</span></p>
                    <p><strong>{t.height}:</strong> <span className="field-value">{child.height} cm</span></p>
                    <p><strong>{t.illness}:</strong> <span className="field-value">{child.illnesses || "None"}</span></p>
                   {(() => {
  const hasMalnutrition =
    child.malnutrition?.hasSigns &&
    String(child.malnutrition.hasSigns).toLowerCase() === "yes";

  return (
    <p>
      <strong>{t.malnutrition}:</strong>
      <span className="field-value">
        {hasMalnutrition ? child.malnutrition.details : "No"}
      </span>
    </p>
  );
})()}

                </div>
<div className="share-buttons" style={{ position: "relative", display: "inline-block" }}>
  <button
      className="whatsapp-btn"
      onClick={() => setShowWhatsappPopup(true)}
  >
      <FaWhatsapp style={{ marginRight: "6px" }} /> {t.whatsapp}
  </button>
{showWhatsappPopup && (
  <div
    className="whatsapp-popup-card"
    style={{
      position: "absolute",
      top: "-110%", // places it above the button
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fff",
      padding: "1.5rem",
      borderRadius: "12px",
      width: "300px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      zIndex: 10,
    }}
  >
    <h2>{modalLanguage === "en" ? "Enter WhatsApp Number" : "व्हाट्सएप नंबर दर्ज करें"}</h2>
    <input
      type="text"
      value={whatsappNumber}
      onChange={(e) => setWhatsappNumber(e.target.value)}
      placeholder={modalLanguage === "en" ? "eg. 919550456805" : "eg. 919550456805"}
      style={{ padding: "0.5rem", width: "80%", margin: "1rem 0" }}
    />

    {/* Message below input field */}
    <div
      style={{
        fontSize: "0.9rem",
        color: "#555",
        marginBottom: "1rem",
      }}
    >
      {modalLanguage === "en"
        ? "The message will be automatically copied"
        : "संदेश स्वचालित रूप से कॉपी किया जाएगा"}
    </div>

    {/* Buttons */}
    <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
      <button
        onClick={handleWhatsappShare}
        style={{
          backgroundColor: "#25D366",
          color: "#fff",
          border: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          display: "flex",
          alignItems: "center"
        }}
      >
        <FaWhatsapp style={{ marginRight: "6px" }} /> {modalLanguage === "en" ? "Send" : "भेजें"}
      </button>
      <button
        onClick={() => setShowWhatsappPopup(false)}
        style={{
          backgroundColor: "#dc2626",
          color: "#fff",
          border: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        {modalLanguage === "en" ? "Cancel" : "रद्द करें"}
      </button>
    </div>
  </div>
)}

</div>


{/* Encouragement Section */}
<div className="encouragement-container">
  {recommendations
    .filter(
      rec => rec.startsWith("🎉") || rec.startsWith("⚠️") || rec.startsWith("👩‍⚕️")
    )
    .map((enc, index) => {
      // Split encouragement into first line + rest
      const [firstLine, ...rest] = enc.split("\n");

      // Decide color for first line
      let firstLineColor = "#1e40af"; // default blue
      if (firstLine.startsWith("⚠️")) {
        firstLineColor = "red";
      } else if (firstLine.startsWith("🎉")) {
        firstLineColor = "green";
      }

      return (
        <div key={index} className="encouragement-text">
          <p>
            <span style={{ color: firstLineColor }}>{firstLine}</span>
            {rest.length > 0 && (
              <>
                <br />
                <span style={{ color: "#1e40af" }}>{rest.join(" ")}</span>
              </>
            )}
          </p>
        </div>
      );
    })}
</div>
         <div className="recommendations-container">
    <h3>{t.recommendationsTitle}</h3>
    <ul className="recommendations-list">
        {recommendations
            .filter(rec => !rec.startsWith("🎉") && !rec.startsWith("⚠️") && !rec.startsWith("👩‍⚕️"))
            .map((rec, index) => (
                <li key={index} className="recommendation-item">
                    <span className="recommendation-icon">💡</span> {rec}
                </li>
            ))}
    </ul>
  {/* See Nutrition Tips Button */}
  <button
    className="nutrition-tips-btn"
    onClick={() => setShowNutritionTips(true)}
  >
<h7>{t.tips}</h7>
  </button>
</div>
{showNutritionTips && (
  <div className="nutrition-tips-card">
    <h4>{t.nutritiontips}</h4>
    <ul>
    <div>{t.green}</div>
<div>{t.milk}</div>
<div>{t.vitamin}</div>
<div>{t.protein}</div>
<div>{t.hydrate}</div>
    </ul>
    <button
      className="close-tips-btn"
      onClick={() => setShowNutritionTips(false)}
    >
      <div>{t.close}</div>
    </button>
  </div>
)}

                {/* Historical Data Trends Graphs */}
          <h3>{t.weightProgress}</h3>
<p style={{ fontStyle: "italic", color: "#555555a2", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
  {modalLanguage === "en"
    ? "(Update Record to see the timeline of the progress)."
    : "(प्रगति का टाइमलाइन देखने के लिए रिकॉर्ड अपडेट करें।)"}
</p>
<div className="graph-wrapper">
    <Line data={weightData} height={300} options={{ maintainAspectRatio: false }} />
</div>

<h3>{t.heightProgress}</h3>
<p style={{ fontStyle: "italic", color: "#555555a2", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
  {modalLanguage === "en"
    ? "(Update Record to see the timeline of the progress)."
    : "(प्रगति का टाइमलाइन देखने के लिए रिकॉर्ड अपडेट करें।)"}
</p>
<div className="graph-wrapper">
    <Line data={heightData} height={300} options={{ maintainAspectRatio: false }} />
</div>

<div className="modal-actions">
    <button className="delete-button" onClick={handleDeleteClick}>{t.delete}</button>
    <button className="update-card-btn" onClick={handleAddRecordClick}>
        <FaEdit style={{ marginRight: "6px" }} /> {t.update}
    </button>
</div>

<div className="footer-message">
    <p><strong>{t.futureGrowth}</strong> </p>
</div>


                {/* Popups for Unique ID and Deletion */}
                {showUniqueIdPopup && (
                    <div className="unique-id-modal-overlay" onClick={() => setShowUniqueIdPopup(false)}>
                        <div className="unique-id-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="unique-id-modal-close" onClick={() => setShowUniqueIdPopup(false)}>✖</button>
                            <form onSubmit={handleUniqueIdSubmit}>
                                <h2>{t.enterId}</h2>
                                <p>{t.promptId}</p>
                                <input
                                    type="text"
                                    value={uniqueIdInput}
                                    onChange={(e) => setUniqueIdInput(e.target.value)}
                                    placeholder={t.uniqueId}
                                    required
                                />
                                <button type="submit" className="unique-id-modal-submit">{t.download}</button>
                            </form>
                        </div>
                    </div>
                )}
                {showInvalidIdPopup && (
                    <div className="unique-id-modal-overlay" onClick={() => setShowInvalidIdPopup(false)}>
                        <div className="invalid-id-modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>{t.invalidId}</h2>
                            <button onClick={() => setShowInvalidIdPopup(false)}>{t.close}</button>
                        </div>
                    </div>
                )}
         {showPopup && (
    <div className="custom-popup">
        <p>{popupMessage}</p>
        <button onClick={() => {
            setShowPopup(false);
            if (whatsappLinkToOpen) {
                window.open(whatsappLinkToOpen, "_blank");
                setWhatsappLinkToOpen(null);
            }
        }}>
            OK
        </button>
    </div>
)}


                {showDeleteConfirm && (
                    <div className="unique-id-modal-overlay" onClick={cancelDelete}>
                        <div className="popup-card" onClick={(e) => e.stopPropagation()}>
                            <h2>{t.confirmDelete}</h2>
                            <p>This action cannot be undone.</p>
                            <div className="delete-buttons">
                                <button onClick={confirmDelete}>{t.yes}</button>
                                <button onClick={cancelDelete}>{t.no}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChildSummaryModal;
