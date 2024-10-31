import React, { useState, useMemo } from "react";
import { WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import './styles/App.css';

import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard/Dashboard";

const App = () => {
  // Define network endpoint (you can use the Solana Devnet endpoint for testing)
  const endpoint = "https://api.devnet.solana.com";

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const AppContent = () => {
  const { connected } = useWallet();

  return connected ? <Dashboard /> : <LandingPage />;
};

export default App;
