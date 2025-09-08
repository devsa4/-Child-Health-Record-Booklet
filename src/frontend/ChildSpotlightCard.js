import React from "react";
import "./ChildSpotlightCard.css";

const ChildSpotlightCard = ({ child, language = "en" }) => {
  if (!child) return null;

  const quotes = {
    en: "“Growing stronger every day!”",
    hi: "“हर दिन और मजबूत बन रहा है!”"
  };

  return (
    
    <div className="spotlight-card">
      <h4>🌟 {language === "hi" ? "प्रमुख बच्चा" : "Spotlight Child"}</h4>
      <p>
        <strong>{child.name}</strong> — {child.age} {language === "hi" ? "वर्ष" : "yrs"},{" "}
        {child.gender}
      </p>
      <p className="spotlight-quote">{quotes[language]}</p>
    </div>
    
  );
};

export default ChildSpotlightCard;
