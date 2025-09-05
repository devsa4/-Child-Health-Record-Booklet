// YourProfile.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getUserByEmail } from "./db";

function YourProfile({ loggedInEmail }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loggedInEmail) return;

    const fetchFromBackend = async () => {
      try {
        // Try fetching from backend first
        const res = await axios.get(`http://localhost:5000/api/profile/${loggedInEmail}`);
        setUser(res.data);
        setLoading(false);
      } catch (backendErr) {
        // If backend fails, fallback to IndexedDB
        try {
          const localUser = await getUserByEmail(loggedInEmail);
          if (localUser) {
            setUser(localUser);
            setLoading(false);
          } else {
            setError("User not found in backend or IndexedDB.");
            setLoading(false);
          }
        } catch (dbErr) {
          setError("Error accessing IndexedDB.");
          setLoading(false);
        }
      }
    };

    fetchFromBackend();
  }, [loggedInEmail]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="profile-page" style={styles.container}>
      <h2 style={styles.heading}>Your Profile</h2>
      <div style={styles.card}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Age:</strong> {user.age}</p>
        <p><strong>Gender:</strong> {user.gender}</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "2rem auto", padding: "2rem", fontFamily: "Arial, sans-serif" },
  heading: { textAlign: "center", marginBottom: "1.5rem" },
  card: { padding: "1rem", border: "1px solid #ccc", borderRadius: "12px", backgroundColor: "#f9f9f9" },
};

export default YourProfile;
