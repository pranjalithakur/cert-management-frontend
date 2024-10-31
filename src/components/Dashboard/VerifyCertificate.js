import React, { useState } from "react";
import '../../styles/VerifyPage.css';

const VerifyPage = () => {
  const [certId, setCertId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");


  const handleVerify = () => {
    // Placeholder for certificate verification logic
    console.log("Verifying certificate with ID:", certId);
    // Simulate a verification result
    if (certId === "123456") {
      setVerificationStatus("success");
    } else {
      setVerificationStatus("error");
    }
  };

  return (
    <div className="verify-container">
      <h2>Verify a Certificate</h2>
      <input
        className="verify-input"
        type="text"
        placeholder="Enter Certificate ID or Solana Scan Link"
        value={certId}
        onChange={(e) => setCertId(e.target.value)}
      />
      <button className="verify-btn" onClick={handleVerify}>Verify</button>
      {verificationStatus && (
        <div className={`result-message ${verificationStatus}`}>
          {verificationStatus === "success" ? "Certificate Verified Successfully!" : "Verification Failed. Invalid Certificate."}
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
