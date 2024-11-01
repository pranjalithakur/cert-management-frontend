import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import DashboardPage from "./DashboardPage";
import IssuePage from "./IssueCertificate";
import VerifyPage from "./VerifyCertificate";
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { disconnect, publicKey } = useWallet();
  const [activePage, setActivePage] = useState("dashboard");

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-links">
        <button className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage("dashboard")}>Dashboard</button>
          <button className={`nav-link ${activePage === 'issue' ? 'active' : ''}`} onClick={() => setActivePage("issue")}>Issue</button>
          <button className={`nav-link ${activePage === 'verify' ? 'active' : ''}`} onClick={() => setActivePage("verify")}>Verify</button>
        </div>
        <div className="wallet-section">
          <div className="wallet-info" title={publicKey ? publicKey.toBase58() : "Not connected"}>
            Connected Wallet: {publicKey ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}` : "Not connected"}
          </div>
          <button className="disconnect-btn" onClick={handleDisconnect}>Disconnect Wallet</button>
        </div>
      </nav>

      <div>
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "issue" && <IssuePage />}
        {activePage === "verify" && <VerifyPage />}
      </div>
    </div>
  );
};

export default Dashboard;
