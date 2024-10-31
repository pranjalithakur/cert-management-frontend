import React, { useState } from "react";
import '../../styles/IssuePage.css';

const IssuePage = () => {
  const [formData, setFormData] = useState({
    certName: "",
    description: "",
    issueDate: "",
    recipientAddress: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Code to mint certificate as NFT on Solana blockchain
    console.log("Issuing certificate:", formData);
    alert("Certificate Issued Successfully!");
  };

  return (
    <div className="issue-form-container">
      <h2>Issue a Certificate</h2>
      <form onSubmit={handleSubmit} className="issue-form">
        <input
          className="form-input"
          type="text"
          name="certName"
          placeholder="Certificate Name"
          value={formData.certName}
          onChange={handleChange}
          required
        />
        <input
          className="form-input"
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          className="form-input"
          type="date"
          name="issueDate"
          placeholder="Issue Date"
          value={formData.issueDate}
          onChange={handleChange}
          required
        />
        <input
          className="form-input"
          type="text"
          name="recipientAddress"
          placeholder="Recipient Wallet Address"
          value={formData.recipientAddress}
          onChange={handleChange}
          required
        />
        <button className="submit-btn" type="submit">Issue Certificate</button>
      </form>
    </div>
  );
};

export default IssuePage;
