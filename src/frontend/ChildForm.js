import React, { useState, useEffect, useRef } from "react";
import { Form, Alert, Button } from "react-bootstrap";
import { FaUpload, FaCamera, FaSave, FaChild, FaMapMarkerAlt, FaBars } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./ChildForm.css";

// ✅ Helper function to convert image files to base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function ChildForm() {
  const [language, setLanguage] = useState("en");
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState({ city: null, country: null });
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef();
  const canvasRef = useRef();

  const [formData, setFormData] = useState({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: "",
    photo: null,
    dob: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    guardian: "",
    malnutrition: { hasSigns: "", details: "" },
    illnesses: "",
    consent: false,
  });

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      getGeoLocation();
    };
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    getGeoLocation();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  const getGeoLocation = () => {
    if (!navigator.geolocation)
      return setLocation({ city: "N/A", country: "N/A" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          setLocation({
            city: data.address.city || data.address.town || data.address.village || "Unknown",
            country: data.address.country || "Unknown",
          });
        } catch (err) {
          setLocation({ city: "Unknown", country: "Unknown" });
        }
      },
      () => setLocation({ city: "Unknown", country: "Unknown" })
    );
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "malnutrition") {
      setFormData((prev) => ({
        ...prev,
        malnutrition: {
          ...prev.malnutrition,
          hasSigns: value,
          details: value === "yes" ? prev.malnutrition.details : "",
        },
      }));
      return;
    }

    if (name === "malnutritionDetails") {
      setFormData((prev) => ({
        ...prev,
        malnutrition: { ...prev.malnutrition, details: value },
      }));
      return;
    }

    if (type === "file") {
      if (files && files[0]) {
        try {
          const base64Image = await toBase64(files[0]);
          setFormData((prev) => ({ ...prev, [name]: base64Image }));
        } catch (error) {
          console.error("Error converting file to base64", error);
        }
      }
      return;
    }

    const updatedValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: updatedValue };
      if (name === "dob") newData.age = calculateAge(updatedValue).toString();
      return newData;
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.consent) {
    setShowAlert(true);
    return;
  }
  setShowAlert(false);

  try {
    const response = await fetch("/child", { // <-- replace with your cloud endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        child_id: formData.id,
        name: formData.name,
        dateOfBirth: formData.dob,
        age: Number(formData.age || 0),
        gender: formData.gender,
        guardian: formData.guardian,
        weight: Number(formData.weight || 0),
        height: Number(formData.height || 0),
        illnesses: formData.illnesses,
        malnutrition: formData.malnutrition,
        photo: formData.photo,
        consent: formData.consent,
        geo: { city: location.city, country: location.country },
      }),
    });

    if (!response.ok) throw new Error("Failed to save record to cloud");

    console.log("Saved to cloud:", formData);
    setShowSuccess(true);
  } catch (error) {
    console.error("❌ Cloud Save Error:", error);
    alert("Failed to save to cloud. Please try again.");
  }
};

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Cannot access camera: " + err.message);
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg");

    setFormData((prev) => ({ ...prev, photo: base64Image }));
    setPhotoCaptured(true);
    stopCamera();
    setShowCamera(false);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const content = {
    en: {
      home:"Home",
      title: "GROWTH GUARDIAN",
      register: "Register a Child",
      update: "Update Registered Child",
      formTitle: "REGISTER A CHILD",
      consentWarning: "Parental consent is required to proceed.",
      view:'View Child Record',
      profile:'Your Profile',
      uid:"Unique ID",
      online:"Online",
      offline:"Offline",
      uphoto:"Upload Photo",
      cphoto:"Capture Photo",
      retake:"Retake Photo",
      cancel:"Cancel",
      take:"Take Photo",
      slgen:"Select Gender",
      m:"Male",
      f:"Female",
      o:"Other",
      srec:"Save Record",
      y:"Yes",
      n:"No",
      logout:'Log Out',
      ss:"Saved Successfully!",
      close:"Close",
      labels: {
        name: "Child's Name",
        photo: "Face Photo (Capture or Upload)",
        uid:"Unique ID",
        dob: "Date of Birth",
        age: "Age",
        weight: "Weight (kg)",
        height: "Height (cm)",
        gender: "Gender",
        guardian: "Parents/Guardian’s Name",
        malnutrition: "Visible Signs of Malnutrition",
        illnesses: "Recent Illnesses",
        consent: "I confirm that I have parental consent to collect this data.",
        placeholder: "Enter details or type 'N/A' or 'Skip'",
      },
    },
    hi: {
      home:"होम",
      title: "विकास संरक्षक",
      register: "नया बच्चा पंजीकृत करें",
      update: "पंजीकृत बच्चे को अपडेट करें",
      formTitle: "नया बाल डेटा संग्रह फ़ॉर्म",
      consentWarning: "जारी रखने के लिए अभिभावक की सहमति आवश्यक है।",
      view:'बच्चों के रिकॉर्ड देखें',
      profile:'अपनी प्रोफ़ाइल देखें',
      uid:"विशिष्ट पहचान",
      online:"ऑनलाइन",
      offline:"ऑफलाइन",
      uphoto:"फोटो अपलोड करें",
      cphoto:"फोटो खींचो",
      retake:"फ़ोटो दोबारा लें",
      cancel:"बंद करें",
      take:"फोटो खिचिये",
      slgen:"लिंग चुनें",
      m:"पुरुष",
      f:"महिला",
      o:"अन्य",
      srec:"रिकॉर्ड सेव कर्रे",
      y:"हाँ",
      n:"नहीं",
      logout:'लॉग आउट',
      ss:"सफलतापूर्वक सेव!",
      close:"बंद करें",
      labels: {
        name: "बच्चे का नाम",
        photo: "चेहरे की फोटो (कैप्चर या अपलोड करें)",
        uid:"विशिष्ट पहचान",
        dob: "जन्म तिथि",
        age: "आयु",
        weight: "वजन (किग्रा)",
        height: "ऊंचाई (सेमी)",
        gender: "लिंग",
        guardian: "अभिभावक का नाम",
        malnutrition: "कुपोषण के लक्षण",
        illnesses: "हाल की बीमारियाँ",
        consent: "मैं पुष्टि करता हूँ कि मुझे यह डेटा एकत्र करने के लिए अभिभावक की सहमति प्राप्त है।",
        placeholder: "'N/A' या 'Skip' लिखें यदि लागू नहीं",
      },
    },
  };

  const fields = [
    { key: "name", type: "text", required: true },
    { key: "dob", type: "date" },
    { key: "age", type: "text", readOnly: true },
    { key: "weight", type: "text" },
    { key: "height", type: "text" },
    { key: "guardian", type: "text" },
    { key: "illnesses", type: "textarea" }, // ✅ Recent Illness field
  ];

  return (
    <div className="video-background-wrapper">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/backgroundChildForm.mp4" type="video/mp4" />
      </video>
      <div className="background-overlay"></div>

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
          <li onClick={() => navigate('/add-record/:childId')}>{content[language].update}</li>
          <li onClick={() => { navigate("/view-records"); setSidebarOpen(false); }}>{content[language].view}</li>
          <li onClick={() => setSidebarOpen(false)}>{content[language].profile}</li>
        </ul>
        <button className="logout-button" onClick={() => setSidebarOpen(false)}>{content[language].logout}</button>
      </div>

      <div className="top-left-brand">
        <MdFamilyRestroom className="brand-icon" />
        <h1 className="brand-title">{content[language].title}</h1>
        <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
      </div>

      <div className="top-bar">
        <div className="language-card">
          <button className={`lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>English</button>
          <button className={`lang-btn ${language === "hi" ? "active" : ""}`} onClick={() => setLanguage("hi")}>हिन्दी</button>
        </div>
      </div>

      <div className="child-form-container glass-card hover-card fade-in-card">
        <div className="child-form-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <FaChild className="title-icon" /> {content[language].formTitle}
          </h2>
          <div className={`online-indicator ${isOnline ? "online" : "offline"}`} style={{ fontSize: "0.9rem", padding: "4px 12px", borderRadius: "8px" }}>
            {isOnline ? content[language].online : content[language].offline}
          </div>
        </div>

        {location.city && location.country && (
          <div className="offline-location" style={{ fontSize: "0.9rem", color: "#fff", display: "flex", alignItems: "center", gap: "4px" }}>
            <FaMapMarkerAlt /> <em>{location.city}, {location.country}</em>
          </div>
        )}

        {showAlert && <Alert variant="danger">{content[language].consentWarning}</Alert>}

        <Form onSubmit={handleSubmit}>
          {fields.map(({ key, type, required, readOnly }) => (
            <Form.Group controlId={key} className="form-entry" key={key}>
              <Form.Label>{content[language].labels[key]}</Form.Label>
              {type === "textarea" ? (
                <Form.Control as="textarea" rows={2} name={key} value={formData[key]} onChange={handleChange} placeholder={content[language].labels.placeholder} />
              ) : (
                <Form.Control type={type} name={key} value={formData[key]} onChange={handleChange} required={required} readOnly={readOnly} />
              )}

              {key === "name" && (
                <>
                  <Form.Group controlId="uniqueId" className="form-entry mt-2">
                    <Form.Label>{content[language].uid}</Form.Label>
                    <Form.Control type="text" name="id" value={formData.id} readOnly />
                  </Form.Group>

                  <div className="photo-button-row mt-2">
                    <label htmlFor="choose-photo" className="btn-purple">
                      <FaUpload className="photo-icon" /> {content[language].uphoto}
                    </label>
                    <input type="file" id="choose-photo" name="photo" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
                    <button type="button" className="btn-blue" onClick={openCamera}>
                      <FaCamera className="photo-icon" /> {content[language].cphoto}
                    </button>
                  </div>
                  {formData.photo && (
                    <div className="photo-preview mt-3">
                      <img src={formData.photo} alt="Child" style={{ width: "200px", height: "200px", borderRadius: "8px", objectFit: "cover" }} />
                      {photoCaptured && (
                        <button type="button" className="btn-retake mt-2" onClick={() => { setShowCamera(true); setPhotoCaptured(false); }}>
                          {content[language].retake}
                        </button>
                      )}
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                </>
              )}

              {key === "age" && (
                <Form.Group controlId="gender" className="form-entry mt-2">
                  <Form.Label>{content[language].labels.gender}</Form.Label>
                  <Form.Select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">{content[language].slgen}</option>
                    <option value="Male">{content[language].m}</option>
                    <option value="Female">{content[language].f}</option>
                    <option value="Other">{content[language].o}</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Form.Group>
          ))}

          {/* Malnutrition */}
          <Form.Group controlId="malnutrition" className="form-entry">
            <Form.Label>{content[language].labels.malnutrition}</Form.Label>
            <div className="toggle-group">
              <input type="radio" id="malnutrition-yes" name="malnutrition" value="yes" checked={formData.malnutrition.hasSigns === "yes"} onChange={handleChange} />
              <label htmlFor="malnutrition-yes">{content[language].y}</label>

              <input type="radio" id="malnutrition-no" name="malnutrition" value="no" checked={formData.malnutrition.hasSigns === "no"} onChange={handleChange} />
              <label htmlFor="malnutrition-no">{content[language].n}</label>
            </div>
            {formData.malnutrition.hasSigns === "yes" && (
              <Form.Control as="textarea" rows={2} name="malnutritionDetails" value={formData.malnutrition.details} onChange={handleChange} placeholder={content[language].labels.placeholder} className="mt-2" />
            )}
          </Form.Group>

          {/* Consent */}
          <Form.Group controlId="consent" className="consent-line form-entry">
            <label className="custom-checkbox">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
              <span className="checkbox-box"></span>
              {content[language].labels.consent}
            </label>
          </Form.Group>

          <div className="form-button-wrapper form-entry">
            <Button type="submit" className="save-record-btn">
              <FaSave className="save-icon" /> {content[language].srec}
            </Button>
          </div>
        </Form>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal show">
          <div className="camera-content">
            <video ref={videoRef} autoPlay></video>
            <div className="camera-buttons">
              <Button type="button" className="btn-blue" onClick={capturePhoto}>{content[language].take}</Button>
              <Button type="button" className="btn-red" onClick={() => { stopCamera(); setShowCamera(false); }}>{content[language].cancel}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14 27 L 22 35 L 38 19" />
            </svg>
            <h3>{content[language].ss}</h3>

            <div className="popup-buttons mt-3">
              <button className="btn-blue" onClick={() => { setShowSuccess(false); navigate("/view-records"); }}>{content[language].view}</button>
              <button className="btn-red" onClick={() => setShowSuccess(false)}>{content[language].close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChildForm;
