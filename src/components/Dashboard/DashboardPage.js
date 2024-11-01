import React, { useState } from "react";
import '../../styles/DashboardPage.css';

const DashboardPage = () => {
  const issuedCerts = [
    { id: 1, name: "Cert A", recipient: "Recipient Address 1" },
    { id: 2, name: "Cert B", recipient: "Recipient Address 2" },
    // Add other mock certs or fetch from the blockchain
  ];

  const receivedCerts = [
    { id: 2, name: "Cert B", issuer: "Issuer Address 1" },
    // Add other mock certs or fetch from the blockchain
  ];

  return (
    <div className="dashboard-page-container">
      <div className="cert-section">
        <h2>Your Issued Certificates</h2>
        <ul className="cert-list">
          {issuedCerts.map((cert) => (
            <li key={cert.id} className="cert-card">
              <span className="cert-title">{cert.name} - {cert.recipient}</span>
              <button className="cert-action-button" onClick={() => console.log("Show details for", cert)}>View Details</button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="cert-section">
        <h2>Your Received Certificates</h2>
        <ul className="cert-list">
          {receivedCerts.map((cert) => (
            <li key={cert.id} className="cert-card">
              <span className="cert-title">{cert.name} - {cert.issuer}</span>
              <button className="cert-action-button" onClick={() => console.log("Show details for", cert)}>View Details</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
