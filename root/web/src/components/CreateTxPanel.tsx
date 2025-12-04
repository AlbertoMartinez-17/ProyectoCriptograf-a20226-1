import { useState } from "react";
import { sendTx } from "../api";

export default function CreateTxPanel() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("0");
  const [passphrase, setPassphrase] = useState("");
  const [receiverPath, setReceiverPath] = useState("./simulation_data/Name/inbox"); // Path of the other wallet to create the network simualtion

  async function handleSend() {
    if (!toAddress || !amount || !passphrase) return alert("Faltan datos");

    try {
      const res = await sendTx(toAddress, Number(amount), passphrase, receiverPath);
      
      if (res.ok) {
        alert(`Transaction SNed!\nArchivo: ${res.filename}`);
        setAmount("0");
        setPassphrase(""); //Zeroize password? after use it
      } else {
        alert("❌ Error: " + res.error);
      }
    } catch (e) {
      alert("Error enviando transacción");
    }
  }

  return (
    <div className="panel">
      <h2>💸 Enviar Transacción</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input 
          placeholder="Crypto address of the receiver (0x...)" 
          value={toAddress} 
          onChange={e => setToAddress(e.target.value)} 
        />
        
        <input 
          type="number" 
          placeholder="Amount" 
          value={amount} 
          onChange={e => setAmount(e.target.value)} 
        />

        <input 
          type="password" 
          placeholder="Insert your password to authorize the transaction" 
          value={passphrase} 
          onChange={e => setPassphrase(e.target.value)} 
        />

        <small>Inbox address of the receiver</small>
        <input 
          placeholder="./data/Name/inbox" 
          value={receiverPath} 
          onChange={e => setReceiverPath(e.target.value)} 
          style={{ fontSize: '0.8em', color: '#aaa' }}
        />

        <button onClick={handleSend}>Authorize and send</button>
      </div>
    </div>
  );
}