import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FaBell, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getUserTransactions } from "./api";
import type { Transaction } from "./api";
import { io, Socket } from "socket.io-client";

import EmptyState from "./EmptyState";
import illCoin1 from "./assets/vecteezy_flat-vector-illustration-of-gold-icon-suitable-for-design_6607020 1.svg";
import illCoin2 from "./assets/vecteezy_coin-vector-icon-design_21225566 1.svg";
import btcBg from "./assets/Lines.svg";
import BottomNav from "./BottomNav";

import BTC from "./assets/BTC - Bitcoin.svg";
import ETH from "./assets/ETC - Binance-Peg Ethereum Classic.svg";

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  // const [navOpen, setNavOpen] = useState(false); // 👈 toggle state for nav

  const trackRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate(); // ✅ initialize navigate

  const scrollPrev = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({
        left: -trackRef.current.offsetWidth * 0.85,
        behavior: "smooth",
      });
    }
  };

  const scrollNext = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({
        left: trackRef.current.offsetWidth * 0.85,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!authToken || !userId) {
      console.warn("⚠️ No auth token or userId found, redirecting to sign-in");
      navigate("/signin"); // ✅ redirect if not found
      return;
    }

    if (!userId) {
      console.warn("⚠️ No userId found in localStorage");
      setLoading(false);
      return;
    }

    // ✅ Fetch initial transactions
    const fetchTransactions = async () => {
      try {
        const res = await getUserTransactions(userId);
        if (res.data?.transactions) {
          setTransactions(res.data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();

    // ✅ Setup socket connection
    const SOCKET_URL =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000" // 👉 local dev server
      : import.meta.env.VITE_API_BASE_URL || "https://swap24.onrender.com"; // 👉 fallback to Render

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("connect", () => {
      console.log("🔗 Connected to socket:", socketRef.current?.id);
      socketRef.current?.emit("joinRoom", userId); // join personal room
    });

    // ✅ Listen for new transactions
    socketRef.current.on("newTransaction", (transaction: Transaction) => {
      console.log("📩 New transaction received:", transaction);
      setTransactions((prev) => [transaction, ...prev]); // prepend new tx
    });

    // ✅ Cleanup on unmount
    return () => {
      socketRef.current?.off("newTransaction");
      socketRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-info">
          <img
            src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIANMAwwMBIgACEQEDEQH/xAAaAAACAwEBAAAAAAAAAAAAAAAAAQMEBQIG/9oACAEBAAAAANVtjGwAAEISAbGMXUEMzUwIQhNsZUKscMKnh1dEEhCbYzAq8y1Tq7nS+ktIEhNsVDPzZHTmJps/e2xCQmxYUENZxc9N3qWjsXhCEx5OfU4jUTDqTiSx6W2kIG8zDrxxdPp9z90S7q7QkJt0PMQ86mtz1xzy4MKX0G0JCbOPK5ur6GSOLhc89YdX115COW2ebxPW0aHG08SObZo1vVyCQmx0vP69PiexWo8F+SxrCEctsoZmisGzp0s+rvczc7EgkJsPPGqYF+9RpwancuPtaaEk2zPhsqKcqcycd9ZPpZRI5bb5zkddcwczQqxatoSOW2x52fFq0KHffF7eaEhJjbOcWfjqhDzPt3BCQkNt8eeztixDT5kgp720CEkNsoePuX5+4oJ8WK76ydIS56G6XWZdoGdDLYrW572l0hLltlaEjpWKlGMk0XZ1ukkctupk6a4pMr1odjvmvY3RI5OucXELuqUnFDo851CPQ9HfEuXzFgVFxqFuDO1oquby5trStI5dZ+drFzbop5d+txZxzvYs6zQq6wKsXo7tKzFRqzu952F69nWmX//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/9oACgICEAMQAAAAlAAixQASazopLLkUQms6ssLBAAzssULmyADG7ee5SzpjWEAM6x0m4rU1z1zqAOffGt88b1d80nTp54Am+HcsU3jWd8iCjOuHo1nTN68NZCCjOsb59K68tYsCCs2XHXHTeN43yslIFlTOvP6tO3m3iwIJaI59ZrtwSgiUohc76cooI//EADoQAAICAQIDBQYDBwMFAAAAAAECAAMRBCESMUEFEyIwURAyQmFxgRRSciAjMzRAkaEVJHNDUIKx4f/aAAgBAQABPwD/ALECDnHsNpDlSv0n4wA4Ii6ipjjihtUPgnaJ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"
            alt="User"
            className="avatar"
          />
        </div>
        <ConnectButton showBalance={false} />
        <FaBell className="icon bell" />
      </header>

      {/* Banner Carousel */}
      <div className="banner-carousel">
        <div className="banner-track" ref={trackRef}>
          {[
            {
              title: "Carl Wants to sell 0.5 BTC",
              subtitle: "In Naira → ₦4,500.00",
              bg: btcBg,
            },
            {
              title: "Carl Wants to sell 0.5 BTC",
              subtitle: "In Naira → ₦4,500.00",
              bg: btcBg,
            },
            {
              title: "Carl Wants to sell 0.5 BTC",
              subtitle: "In Naira → ₦4,500.00",
              bg: btcBg,
            },
            {
              title: "Carl Wants to sell 0.5 BTC",
              subtitle: "In Naira → ₦4,500.00",
              bg: btcBg,
            },
          ].map((ad, idx) => (
            <div
              className="banner"
              key={idx}
              // style={{ backgroundImage: `url(${ad.bg})` }}
            >
              <img src={ad.bg} alt="background" className="bgImg" />
              <div className="contentFlex">
                <div className="content1">
                  <p>
                    <strong>{ad.title}</strong>
                  </p>
                  <p>{ad.subtitle}</p>
                  <button className="buy-btn">Buy Now</button>
                </div>
                <div className="content2">
                  <img src={illCoin2} alt="background" className="illuImg1" />
                  <img src={illCoin1} alt="background" className="illuImg2" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-controls">
          <button className="arrow-btn" onClick={scrollPrev}>
            <FaChevronLeft className="btnCOnt" />
          </button>
          <button className="arrow-btn" onClick={scrollNext}>
            <FaChevronRight className="btnCOnt" />
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="transactions">
        <h4>Recent Transactions</h4>
        <div className="transaction-list">
          {loading ? (
            <p>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <EmptyState message="No transactions yet" />
          ) : (
            transactions.map((tx: Transaction, idx) => (
              <div className="transaction-item" key={idx}>
                <span className="tx-icon">
                  <img src={tx.asset === "BTC" ? BTC : ETH} alt={tx.asset} />
                </span>
                <div className="tx-details">
                  <p className="tx-type">
                    {tx.transactionDescription || tx.type}
                  </p>
                  <p className="tx-date">
                    {new Date(tx.date).toLocaleString()}
                  </p>
                </div>
                <div
                  className={`tx-amount ${
                    tx.type === "adCancellation" ? "positive" : "negative"
                  }`}
                >
                  <p>
                    {tx.type === "credit" ? "+" : "-"} {tx.amount} {tx.asset}
                  </p>
                  {tx.valueInNaira && (
                    <span>₦{tx.valueInNaira.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Bottom Navigation */}
      {/* <nav className={`bottom-nav ${navOpen ? "open" : ""}`}>
        <button className="toggle-btn" onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <FaChevronDown /> : <FaChevronUp />}
        </button>

        <div className="nav-item active">
          <img src={homeIcon} className="customIcon" />
          <span>Home</span>
        </div>
        <div className="nav-item">
          <img src={tradeIcon} className="customIcon" />
          <span>Trade</span>
        </div>
        <div className="nav-item">
          <img src={marketIcon} className="customIcon" />
          <span>Market</span>
        </div>
        <div className="nav-item">
          <img src={profileIcon} className="customIcon" />
          <span>Profile</span>
        </div>
      </nav> */}
      <BottomNav />
    </div>
  );
};

export default Dashboard;
