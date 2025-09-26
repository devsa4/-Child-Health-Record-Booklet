import React, { useEffect, useState, useRef } from 'react';
import { MdFamilyRestroom, MdVerified, MdMenu } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import './YourProfile.css';
import { MdLogout, MdHome } from 'react-icons/md';
import { MdPerson } from 'react-icons/md';
function YourProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }
        
const res = await fetch(`http://localhost:5000/user/profile`, {
   mode: "cors",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

       
if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    console.log("Fetched profile:", data);
    setProfile(data);
    setLoading(false);
  } catch (err) {
    console.error('Error fetching profile:', err);
    setLoading(false);
  }
};


    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    console.log('User logged out');
    navigate('/login');
  };

  const goHome = () => {
    navigate('/home');
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (loading) return <p className="profile-loading">Loading profile...</p>;

  return (
    <div
      className="profile-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgroundYourProfile.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        backgroundColor: '#7d7c7ca7',
      }}
    >
      {/* 🔰 Top-left brand */}
      <div className="top-left-brand">
        <MdFamilyRestroom className="brand-icon" />
        <h1 className="brand-title">GROWTH GUARDIAN</h1>
        <MdMenu className="menu-icon" onClick={() => setSidebarOpen(true)} />
      </div>

      {/* 🧭 Sidebar */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-links">
          <li onClick={() => { navigate("/home"); closeSidebar(); }}>Home</li>
          <li onClick={() => { navigate("/register"); closeSidebar(); }}>Register a Child</li>
          <li onClick={() => { navigate("/add-record"); closeSidebar(); }}>Update Registered Child</li>
          <li onClick={() => { navigate("/view-records"); closeSidebar(); }}>View Child Records</li>
          <li onClick={() => { navigate("/profile"); closeSidebar(); }}>Your Profile</li>
        </ul>
        <button className="logout-button" onClick={() => { handleLogout(); closeSidebar(); }}>
          Logout
        </button>
      </div>

      {/* 👤 Profile Card */}
      <div className="profile-container">
        <div className="bottom-vignette" />

        <div className="profile-card">
             <MdPerson className="profile-title-icon" />
             <h2 className="profile-title">YOUR PROFILE</h2>
            
          <div className="initial-badge">
            {profile?.fullName?.charAt(0).toUpperCase()}
          </div>

          <p className="welcome-message">Welcome back. Your profile is looking great!</p>

          <p><strong>Full Name:</strong> {profile?.fullName || 'N/A'}</p>
          <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>

          <p className="verified-line">
            <strong>National ID:</strong> {profile?.nationalId || 'N/A'}
            {profile?.nationalId && (
              <span className="verified-badge" title="Verified by Growth Guardian">
                <MdVerified className="verified-icon" />
                Verified
              </span>
            )}
          </p>

        <div className="profile-buttons">
  <button className="logout4" onClick={handleLogout}>
    <MdLogout className="button-icon" />
    Logout
  </button>
  <button className="home5" onClick={goHome}>
    <MdHome className="button-icon" />
    Go To Home
  </button>
</div>

        </div>
      </div>
    </div>
  );
}

export default YourProfile;
