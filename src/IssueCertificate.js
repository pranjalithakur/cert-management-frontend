import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import idl from '';
import '../../styles/IssuePage.css';

import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";

import {
	findMasterEditionPda,
	findMetadataPda,
	mplTokenMetadata,
	MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
	TOKEN_PROGRAM_ID,
	ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";


const network = process.env.REACT_APP_SOLANA_NETWORK || clusterApiUrl("devnet");
// const programID = new PublicKey(process.env.REACT_APP_PROGRAM_ID);
const { SystemProgram, Keypair } = web3;
const programID = new PublicKey(idl.metadata.address);
console.log(programID);

const IssuePage = () => {
  const wallet = useWallet();
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

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Code to mint certificate as NFT on Solana blockchain
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      console.log("Establishing connection...");
      const connection = new Connection(network, "processed");
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      console.log("Provider initialized.", provider);
      anchor.setProvider(provider);

      if (!programID) {
        throw new Error("Program ID is undefined. Check your .env file.");
      }
      console.log("Program ID:", programID.toString());

      if (!wallet.publicKey) {
        throw new Error("Wallet public key is undefined. Make sure the wallet is connected.");
      }
      console.log("Wallet Public Key:", wallet.publicKey.toString());
      console.log(idl);
      let program;
      try {
        console.log("Program in progress...")
        program = new Program(idl, programID, provider);
        console.log("Program initialized.");
      } catch (error) {
        console.error("Error initializing program:", error);
      }
      
      // const program = new Program(idl, programID, provider);
      // console.log("Program initialized.");
     
      // Generate new keypair for mint account
      const mintKeypair = Keypair.generate();
      console.log("Mint Keypair generated:", mintKeypair.publicKey.toString());

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      console.log("Associated Token Account:", associatedTokenAccount.toString());
      // const associatedTokenAddress = await web3.PublicKey.findProgramAddress(
      //   [
      //     wallet.publicKey.toBuffer(),
      //     TOKEN_PROGRAM_ID.toBuffer(),
      //     mintKeypair.publicKey.toBuffer(),
      //   ],
      //   ASSOCIATED_TOKEN_PROGRAM_ID
      // );

      // derive the metadata PDA
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      );
      console.log("Metadata Account:", metadataAccount.toString());

      //derive the master edition pda
      const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
          Buffer.from("edition"),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID
      );
      
      
      // Call smart contract to mint certificate NFT
      const tx = await program.methods
        .initNft(formData.certName, "CERT", formData.description)
        .accounts({
          signer: wallet.publicKey,
          mint: mintKeypair.publicKey,
          // associatedTokenAccount: associatedTokenAddress[0],
          associatedTokenAccount,
          // metadataAccount: findMetadataPda({ mint: mintKeypair.publicKey })[0],
          // masterEditionAccount: findMasterEditionPda({
          //   mint: mintKeypair.publicKey,
          // })[0],
          metadataAccount,
          masterEditionAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mintKeypair])
        .rpc();
      
      console.log("Issuing certificate:", formData);
      alert("Certificate Issued Successfully!");
      console.log(
        `mint nft tx: https://explorer.solana.com/tx/${tx}?cluster=devnet`
      );
      console.log(
        `minted nft: https://explorer.solana.com/address/${mintKeypair.publicKey}?cluster=devnet`
      );
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate.");
    }
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
