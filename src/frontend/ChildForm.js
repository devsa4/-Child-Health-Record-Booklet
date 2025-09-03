import React, { useState, useEffect, useRef } from "react";
import { Form, Alert, Button } from "react-bootstrap";
import { FaUpload, FaCamera, FaSave, FaChild, FaMapMarkerAlt, FaBars } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import "./ChildForm.css";

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

  // --- EFFECTS ---
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
    if (!navigator.geolocation) return setLocation({ city: "N/A", country: "N/A" });

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

  const handleChange = (e) => {
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

    const updatedValue = type === "checkbox" ? checked : type === "file" ? files[0] : value;

    setFormData((prev) => {
      const newData = { ...prev, [name]: updatedValue };
      if (name === "dob") newData.age = calculateAge(updatedValue).toString();
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.consent) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);

    const savedRecords = JSON.parse(localStorage.getItem("childRecords")) || [];
    const updatedRecords = [...savedRecords, formData];
    localStorage.setItem("childRecords", JSON.stringify(updatedRecords));

    console.log("Saved:", formData);

    setShowSuccess(true);
  };

  // --- CAMERA FUNCTIONS ---
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
    canvas.toBlob((blob) => {
      if (!blob) return;
      setFormData((prev) => ({
        ...prev,
        photo: new File([blob], "photo.jpg", { type: "image/jpeg" }),
      }));
      setPhotoCaptured(true);
    });
    stopCamera();
    setShowCamera(false);
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  // --- CONTENT ---
  const content = {
    en: {
      title: "GROWTH GUARDIAN",
      register: "Register a Child",
      update: "Update Registered Child",
      formTitle: "REGISTER A CHILD",
      consentWarning: "Parental consent is required to proceed.",
      labels: {
        name: "Child's Name",
        photo: "Face Photo (Capture or Upload)",
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
      title: "विकास संरक्षक",
      register: "नया बच्चा पंजीकृत करें",
      update: "पंजीकृत बच्चे को अपडेट करें",
      formTitle: "नया बाल डेटा संग्रह फ़ॉर्म",
      consentWarning: "जारी रखने के लिए अभिभावक की सहमति आवश्यक है।",
      labels: {
        name: "बच्चे का नाम",
        photo: "चेहरे की फोटो (कैप्चर या अपलोड करें)",
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

  return (
    <div className="video-background-wrapper">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/backgroundChildForm.mp4" type="video/mp4" />
      </video>
      <div className="background-overlay"></div>

      <div className="top-left-brand">
        <MdFamilyRestroom className="brand-icon" />
        <h1 className="brand-title">{content[language].title}</h1>
        <FaBars className="menu-icon" onClick={() => setSidebarOpen(true)} />
      </div>

      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul className="sidebar-links">
          <li onClick={() => { navigate("/"); setSidebarOpen(false); }}>Home</li>
          <li onClick={() => { navigate("/register"); setSidebarOpen(false); }}>{content[language].register}</li>
          <li onClick={() => setSidebarOpen(false)}>{content[language].update}</li>
          <li onClick={() => { navigate("/view-records"); setSidebarOpen(false); }}>View Child Record</li>
          <li onClick={() => setSidebarOpen(false)}>Your Profile</li>
        </ul>
        <button className="logout-button" onClick={() => setSidebarOpen(false)}>Logout</button>
      </div>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="top-bar">
        <div className="language-card">
          <button className={`lang-btn ${language === "en" ? "active" : ""}`} onClick={() => setLanguage("en")}>English</button>
          <button className={`lang-btn ${language === "hi" ? "active" : ""}`} onClick={() => setLanguage("hi")}>हिन्दी</button>
        </div>
      </div>

      <div className="child-form-container glass-card hover-card fade-in-card">
        <div className="child-form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FaChild className="title-icon" /> {content[language].formTitle}
          </h2>
          <div className={`online-indicator ${isOnline ? "online" : "offline"}`} style={{ fontSize: '0.9rem', padding: '4px 12px', borderRadius: '8px' }}>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {location.city && location.country && (
          <div className="offline-location" style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaMapMarkerAlt /> <em>{location.city}, {location.country}</em>
          </div>
        )}

        {showAlert && <Alert variant="danger">{content[language].consentWarning}</Alert>}

        <Form onSubmit={handleSubmit}>
          {["name", "dob", "age", "weight", "height", "guardian", "illnesses"].map((key) => {
            const isTextarea = key === "illnesses";
            return (
              <Form.Group controlId={key} className="form-entry" key={key}>
                <Form.Label>{content[language].labels[key]}</Form.Label>
                {isTextarea ? (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    placeholder={content[language].labels.placeholder}
                  />
                ) : (
                  <Form.Control
                    type={key === "dob" ? "date" : "text"}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    required={key === "name"}
                    readOnly={key === "age"}
                  />
                )}

                {key === "name" && (
                  <>
                    <div className="photo-button-row mt-2">
                      <label htmlFor="choose-photo" className="btn-purple">
                        <FaUpload className="photo-icon" /> Upload Photo
                      </label>
                      <input
                        type="file"
                        id="choose-photo"
                        name="photo"
                        accept="image/*"
                        onChange={(e) => {
                          handleChange(e);
                          setPhotoCaptured(false);
                        }}
                        style={{ display: "none" }}
                      />
                      <button type="button" className="btn-blue" onClick={openCamera}>
                        <FaCamera className="photo-icon" /> Capture Photo
                      </button>
                    </div>

                    {formData.photo && (
                      <div className="photo-preview mt-3">
                        <img
                          src={URL.createObjectURL(formData.photo)}
                          alt="Child"
                          style={{ width: "200px", height: "200px", borderRadius: "8px", objectFit: "cover" }}
                        />
                        {photoCaptured && (
                          <button
                            type="button"
                            className="btn-retake mt-2"
                            onClick={() => {
                              setShowCamera(true);
                              setPhotoCaptured(false);
                            }}
                          >
                            Retake Photo
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
                    <Form.Control
                      as="select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Others">Others</option>
                    </Form.Control>
                  </Form.Group>
                )}
              </Form.Group>
            );
          })}

          {/* malnutrition */}
          <Form.Group controlId="malnutrition" className="form-entry">
            <Form.Label>{content[language].labels.malnutrition}</Form.Label>
            <div className="toggle-group">
              <input type="radio" id="malnutrition-yes" name="malnutrition" value="yes" checked={formData.malnutrition.hasSigns === "yes"} onChange={handleChange} />
              <label htmlFor="malnutrition-yes">Yes</label>

              <input type="radio" id="malnutrition-no" name="malnutrition" value="no" checked={formData.malnutrition.hasSigns === "no"} onChange={handleChange} />
              <label htmlFor="malnutrition-no">No</label>
            </div>
            {formData.malnutrition.hasSigns === "yes" && (
              <Form.Control
                as="textarea"
                rows={2}
                name="malnutritionDetails"
                value={formData.malnutrition.details}
                onChange={handleChange}
                placeholder={content[language].labels.placeholder}
                className="mt-2"
              />
            )}
          </Form.Group>

          {/* consent */}
          <Form.Group controlId="consent" className="consent-line form-entry">
            <label className="custom-checkbox">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
              <span className="checkbox-box"></span>
              {content[language].labels.consent}
            </label>
          </Form.Group>

          {/* submit button */}
          <div className="form-button-wrapper form-entry">
            <Button type="submit" className="save-record-btn">
              <FaSave className="save-icon" /> Save Record
            </Button>
          </div>
        </Form>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <div className={`camera-modal show`}> 
          <div className="camera-content">
            <video ref={videoRef} autoPlay></video>
            <div className="camera-buttons">
              <Button type="button" className="btn-blue" onClick={capturePhoto}>Take Photo</Button>
              <Button type="button" className="btn-red" onClick={() => { stopCamera(); setShowCamera(false); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccess && (
        <div className="success-popup">
          <div className="success-content">
            <div className="tick-animation" style={{
              fontSize: '4rem',
              color: '#008ab8ff',
              animation: 'scaleUp 0.5s ease forwards'
            }}>&#10004;</div>
            <p>Record Saved Successfully!</p>
            <div className="success-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
              <button className="btn btn-close" onClick={() => setShowSuccess(false)}>Close</button>
              <button className="btn btn-view" onClick={() => { navigate("/view-records"); setShowSuccess(false); }}>View Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChildForm;
