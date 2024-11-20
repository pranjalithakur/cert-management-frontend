import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import idl from '../../solana_nft_anchor_hackernoon.json';
import { SolanaNftAnchorHackernoon } from '../../solana_nft_anchor_hackernoon'
import '../../styles/IssuePage.css';
import { PinataSDK } from "pinata-web3";


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
import { Buffer } from 'buffer';
window.Buffer = Buffer;


const network = process.env.REACT_APP_SOLANA_NETWORK || clusterApiUrl("devnet");
const { SystemProgram, Keypair } = web3;
const programID = new PublicKey(idl.metadata.address);

const pinata = new PinataSDK({
  pinataJwt: process.env.REACT_APP_PINATA_JWT,
  pinataGateway: process.env.REACT_APP_PINATA_GATEWAY,
});

const GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/";

const IssuePage = () => {
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    certName: "",
    description: "",
    issueDate: "",
    recipientAddress: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [ipfsImageLink, setIpfsImageLink] = useState("");
  const [metadataLink, setMetadataLink] = useState("");
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const uploadImageToIPFS = async (image) => {
    try { 
      // Upload the image to Pinata
      const upload = await pinata.upload.file(image)
      console.log("Uploaded:", upload);

      const ipfsUrl = `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${upload.IpfsHash}`;   // hardcoded gateway
      console.log(ipfsUrl)
      return ipfsUrl
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      alert("Failed to upload image to IPFS.");
    }
  };

  const uploadMetadataToIPFS = async (metadata) => {
    try {
      const metadataBlob = new Blob([JSON.stringify(metadata)], {type: 'application/json'});
      const file = new File([metadataBlob], "metadata.json");
      const upload = await pinata.upload.file(file);
      const ipfsMetadataUrl = `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${upload.IpfsHash}`;
      console.log("Uploaded metadata to IPFS:", ipfsMetadataUrl);
      return ipfsMetadataUrl
      
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      alert("Failed to upload metadata to IPFS.");
    }
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    // Code to mint certificate as NFT on Solana blockchain
    if (!wallet.connected || !wallet.publicKey) {
      alert("Please connect your wallet.");
      return;
    }

    if (!imageFile) {
      alert("Please upload an image.");
      return;
    }

    try {
// -------------------------------------------------------------------------------------------------------------
      console.log("Establishing connection...");
      const connection = new Connection(network, "processed");
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });
      anchor.setProvider(provider);

      if (!programID) {
        throw new Error("Program ID is undefined. Check your .env file.");
      }

      if (!wallet.publicKey) {
        throw new Error("Wallet public key is undefined. Make sure the wallet is connected.");
      }
      console.log("Wallet Public Key:", wallet.publicKey.toString());
      
      let program;
      try {
        console.log("Program in progress...")
        program = new Program(idl, programID);
        console.log("Program initialized.");
        console.log(program)
      } catch (error) {
        console.error("Error initializing program:", error);
      }
// ------------------------------------------------------------------------------------------------------------- 
      // Upload the image to IPFS
      console.log("Uploading image to Pinata...");
      const imageUri = await uploadImageToIPFS(imageFile);
      // console.log("Image uploaded to IPFS at:", imageUri);
      setIpfsImageLink(imageUri)
      // Create metadata for upload

      // Create metadata object
      const metadata = {
        name: formData.certName,
        symbol: formData.certSymbol,   // formData.symbol
        description: formData.description,
        image: imageUri,
        attributes: [
          { trait_type: "Issuer", value: wallet.publicKey.toString() },  // value: formData.issuer
          { trait_type: "Recipient", value: formData.recipientAddress },   // value: formData.recipient
          { trait_type: "Date of Issue", value: formData.issueDate },   // value: formData.dateOfIssue
          { trait_type: "Program", value: "cybersec" },   // value: formData.program
        ],
        properties: {
          category: "image",
          files: [{ uri: imageUri, type: imageFile.type }],
        },
      };

      // Upload the metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      const metadataUri = await uploadMetadataToIPFS(metadata);
      setMetadataLink(metadataUri);
      console.log("Metadata CID:", metadataUri);
      alert("Image and metadata uploaded successfully!");

// -------------------------------------------------------------------------------------------------------------
     
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

      const signer = provider.wallet;
      const umi = createUmi("https://api.devnet.solana.com")
        .use(walletAdapterIdentity(signer))
        .use(mplTokenMetadata());

      // derive the metadata account
      let metadataAccount = findMetadataPda(umi, {
        mint: publicKey(mintKeypair.publicKey),
      })[0];

      //derive the master edition pda
      let masterEditionAccount = findMasterEditionPda(umi, {
        mint: publicKey(mintKeypair.publicKey),
      })[0];

      // Sample metadata
      const metadata_main = {
        name: formData.certName,
        symbol: formData.certSymbol,
        uri: metadataUri,
      };
      
      
      // Call smart contract to mint certificate NFT
      console.log("Minting NFT...");
      const tx = await program.methods
        .initNft(metadata_main.name, metadata_main.symbol, metadata_main.uri)
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
          name="certSymbol"
          placeholder="Certificate Symbol"
          value={formData.certSymbol}
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
        <input
          className="form-input"
          type="file"
          name="image"
          accept="image/*"
          onChange={handleImageUpload}
          required
        />
        <button className="submit-btn" type="submit">Issue Certificate</button>
      </form>
    </div>
  );
};

export default IssuePage;
