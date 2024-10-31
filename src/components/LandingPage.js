import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import '../styles/LandingPage.css';

const LandingPage = ({ onConnect }) => {
    return (
        <div className="landing-container">
            <h1 className="landing-title">Welcome to E-Certificate DApp</h1>
            <p className="landing-description">Issue and verify certificates on the Solana blockchain as NFTs, ensuring authenticity and easy access.</p>
            <WalletMultiButton className="connect-wallet-btn" onClick={onConnect}/>
        </div>
    );
};

export default LandingPage;
