import { useState } from "react";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export function SolanaWallet({ mnemonic }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);

  const ALCHEMY_API_URL =
    process.env.SOLANA_URL;

  async function createSolAddress() {
    const seed = await mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    const publicKey = keypair.publicKey;

    const response = await axios.post(`${ALCHEMY_API_URL}`, {
      jsonrpc: "2.0",
      method: "getBalance",
      params: [publicKey.toBase58()],
      id: 1,
    });

    const balance = response.data.result.value / 1e9; 
    setCurrentIndex(currentIndex + 1);
    setWallets([...wallets, { publicKey: publicKey.toBase58(), balance }]);
  }

  return (
    <div>
      <h1>SOL Wallet</h1>
      <button onClick={createSolAddress}>Add SOL wallet</button>
      {wallets.map(({ publicKey, balance }, index) => (
        <div key={index}>
          SOL - {publicKey} | Balance: {balance.toFixed(4)} SOL
        </div>
      ))}
    </div>
  );
}
