import React, { useEffect, useState } from "react";
import "./InlineSuccessMessage.css";

interface InlineSuccessMessageProps {
  message: string;
  duration?: number; // in ms, default 3s
  onClose?: () => void;
}

const InlineSuccessMessage: React.FC<InlineSuccessMessageProps> = ({
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return <div className="inline-success">{message}</div>;
};

export default InlineSuccessMessage;
