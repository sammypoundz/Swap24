import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./AcctCreationSuccess.css";

const AcctCreationSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleDone = () => {
    // Navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="acctcreationsuccess-container">
      <div className="acctcreationsuccess-body">
        <div className="acctcreationsuccess-icon">
          <span className="acctcreationsuccess-check">✔</span>
        </div>
        <h2 className="acctcreationsuccess-title">All done</h2>
        <p className="acctcreationsuccess-message">
          Congratulations! Your account has been successfully added
        </p>
      </div>

      <div className="acctcreationsuccess-footer">
        <button
          className="acctcreationsuccess-button"
          onClick={handleDone}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AcctCreationSuccess;
