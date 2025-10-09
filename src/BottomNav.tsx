import React, { useState } from "react";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
// import "./BottomNav.css";

// import homeIcon from "./assets/homeIcon.svg";
// import tradeIcon from "./assets/tradeIcon.svg";
// import marketIcon from "./assets/marketIcon.svg";
// import profileIcon from "./assets/profileIcon.svg";

import homeIcon from "./assets/Home_light (1).svg";
import tradeIcon from "./assets/Spot v4.svg";
import marketIcon from "./assets/market.svg";
import profileIcon from "./assets/User_fill.svg";

const BottomNav: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <nav className={`bottom-nav ${navOpen ? "open" : ""}`}>
      <button className="toggle-btn" onClick={() => setNavOpen(!navOpen)}>
        {navOpen ? <FaChevronDown /> : <FaChevronUp />}
      </button>

      <div
        className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
        onClick={() => handleNavigate("/dashboard")}
      >
        <img src={homeIcon} className="customIcon" alt="Home" />
        <span>Home</span>
      </div>

      <div
        className={`nav-item ${location.pathname === "/trade" ? "active" : ""}`}
        onClick={() => handleNavigate("/place-ads")}
      >
        <img src={tradeIcon} className="customIcon" alt="Trade" />
        <span>Trade</span>
      </div>

      <div
        className={`nav-item ${location.pathname === "/market" ? "active" : ""}`}
        onClick={() => handleNavigate("/market")}
      >
        <img src={marketIcon} className="customIcon" alt="Market" />
        <span>Market</span>
      </div>

      <div
        className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
        onClick={() => handleNavigate("/profile")}
      >
        <img src={profileIcon} className="customIcon" alt="Profile" />
        <span>Profile</span>
      </div>
    </nav>
  );
};

export default BottomNav;
