import React from "react";
import "./EmptyState.css"; // 👈 import css

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="empty-container">
      <div className="empty-icon">
        <span role="img" aria-label="empty">📂</span>
      </div>
      <p className="empty-text">{message || "No data available"}</p>
    </div>
  );
};

export default EmptyState;
