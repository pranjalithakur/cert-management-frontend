import React, { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import '../styles/ConnectWallet.css';

const ConnectWallet = () => {
  const { connected, publicKey } = useWallet();

  const handleConnect = useCallback(() => {
    if (connected) {
      alert(`Connected with wallet: ${publicKey.toBase58()}`);
    } else {
      alert("Please connect your wallet.");
    }
  }, [connected, publicKey]);

  return (
    <div className="connect-wallet-container">
      <h2>Connect Your Wallet</h2>
      <WalletMultiButton />
      <button className="proceed-btn" onClick={handleConnect} disabled={!connected}>
        Proceed with Connected Wallet
      </button>
    </div>
  );
};

export default ConnectWallet;
