import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FaPlus, FaBars } from 'react-icons/fa';
import { MdFamilyRestroom } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const sidebarRef = useRef();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

useEffect(() => {
  const timer = setTimeout(() => {
    setLoading(false); // triggers fade-out
    const cleanup = setTimeout(() => {
      setShowLoader(false); // removes loader from DOM
    }, 1000); // matches fade-out duration
    return () => clearTimeout(cleanup);
  }, 3000); // initial loader duration
  return () => clearTimeout(timer);
}, []);


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
       home:"Home",
      title: 'GROWTH GUARDIAN',
      subtitle: 'Empowering every child\'s journey',
      description:
        'A simple way to track your child\'s growth and well-being. Easily record their height and weight to see their progress over time and make sure they\'re on a healthy path.',
      register: 'Register a Child',
      update: 'Update Registered Child',
      view:'View Child Record',
      profile:'Your Profile',
      logout:'Log Out'
    },
    hi: {
      home:"होम",
      title: 'विकास संरक्षक',
      subtitle: 'हर बच्चे की यात्रा को सशक्त बनाना',
      description:
        'अपने बच्चे की वृद्धि और स्वास्थ्य को ट्रैक करने का एक सरल तरीका। उनकी ऊंचाई और वजन को आसानी से रिकॉर्ड करें और सुनिश्चित करें कि वे एक स्वस्थ रास्ते पर हैं।',
      register: 'नया बच्चा पंजीकृत करें',
      update: 'पंजीकृत बच्चे को अपडेट करें',
      view:'बच्चों के रिकॉर्ड देखें',
      profile:'अपनी प्रोफ़ाइल देखें',
      logout:'लॉग आउट'
    },
  };

  return (
    <div className={`home-container ${!loading ? 'fade-in' : ''}`}>
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/backgroundhome.mp4" type="video/mp4" />
      </video>

      {showLoader && (
        <div className={`loader-overlay ${loading ? 'blur-active' : 'blur-fade-out'}`}>
          <MdFamilyRestroom className={`loader-animation ${!loading ? 'icon-fade-out' : ''}`} />
        </div>
      )}

      {!loading && (
        <>
          <div className="background-overlay"></div>

          <div className="top-left-brand">
            <MdFamilyRestroom className="brand-icon" />
            <h1 className={`brand-title ${language === 'hi' ? 'hindi-title' : ''}`}>
              {content[language].title}
            </h1>
            <FaBars className="menu-icon" onClick={toggleSidebar} />
          </div>

          <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <ul className="sidebar-links">
              <li onClick={() => { navigate("/home"); setSidebarOpen(false); }}>{content[language].home}</li>
              <li onClick={() => navigate('/register')}>{content[language].register}</li>
              <li onClick={() => navigate('/add-record/:childId')}>{content[language].update}</li>
              <li onClick={() => navigate('/view-records')}>{content[language].view}</li>
              <li onClick={() => navigate('/home')}>{content[language].profile}</li>
            </ul>
            <button className="logout-button">{content[language].logout}</button>
          </div>

          <div className="language-card">
            <div className="language-toggle">
              <button
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                onClick={() => setLanguage('hi')}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <div className="home-content">
            <div className="home-title-wrapper">
              <MdFamilyRestroom className="home-icon" />
              <h1 className={`home-title ${language === 'hi' ? 'hindi-title' : ''}`}>
                {content[language].title}
              </h1>
            </div>

            <p className="home-subtitle">
              <em>{content[language].subtitle}</em>
            </p>

            <p className="home-description">{content[language].description}</p>

            <div className="button-group">
              <Button
                variant="primary"
                className="register-button"
                onClick={() => navigate('/register')}
              >
                <div className="button-content">
                  <FaPlus className="register-icon" />
                  <span className="register-text">{content[language].register}</span>
                </div>
              </Button>

              <Button variant="outline-light" className="update-button"
              onClick={() => navigate('/add-record/:childId')}>
                {content[language].update}
              </Button>
            </div>
          </div>

          <div className="bottom-vignette"></div>
        </>
      )}
    </div>
  );
}

export default Home;
