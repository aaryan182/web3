import { mnemonicToSeed } from "bip39";
import { useState } from "react";
import { Wallet, HDNodeWallet } from "ethers";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const EthWallet = ({ mnemonic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wallets, setWallets] = useState([]);

  const ALCHEMY_API_URL = process.env.ETH_URL;

  async function createAddress() {
    const seed = await mnemonicToSeed(mnemonic);
    const derivationPath = `m/44'/60'/${currentIndex}'/0`;
    const hdNode = HDNodeWallet.fromSeed(seed);
    const child = hdNode.derivePath(derivationPath);
    const wallet = new Wallet(child.privateKey);

    const response = await axios.post(`${ALCHEMY_API_URL}`, {
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [wallet.address, "latest"],
      id: 1,
    });

    const balance = parseInt(response.data.result, 16) / 1e18; 
    setCurrentIndex(currentIndex + 1);
    setWallets([...wallets, { address: wallet.address, balance }]);
  }

  return (
    <div>
      <h1>ETH Wallet</h1>
      <button onClick={createAddress}>Add ETH wallet</button>
      {wallets.map(({ address, balance }, index) => (
        <div key={index}>
          ETH - {address} | Balance: {balance.toFixed(4)} ETH
        </div>
      ))}
    </div>
  );
};
