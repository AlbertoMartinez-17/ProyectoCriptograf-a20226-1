import { useState } from "react";
import { createWallet, loadWallet } from "../api";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [passphrase, setPassphrase] = useState("");
  const [directory, setDirectory] = useState("./simulation_data/Alice"); 
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: "create" | "load") {
    if (!passphrase.trim() || !directory.trim()) return alert("Populate all the fields");
    
    setIsLoading(true);
    try {
      let res;
      if (action === "create") {
        res = await createWallet(passphrase, directory);
      } else {
        res = await loadWallet(passphrase, directory);
      }

      if (res.ok) {
        sessionStorage.setItem("sessionId", res.sessionId); // WE NEED TO STORAGE THE SESSION IN MEMORY TO MAKE ABLE THE BACKEND LOGIC TO WORK
        
        sessionStorage.setItem("address", res.address);
        sessionStorage.setItem("publicKey", res.publicKey);
        onLogin(); 
      } else {
        alert("Error: " + res.error);
      }
    } catch (e) {
      alert("Error de conexión con el backend");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>🔐 Cold Wallet authentication and login</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label>
          Folder of the wallet (Simulation):
          <input
            type="text"
            value={directory}
            onChange={(e) => setDirectory(e.target.value)}
            placeholder="./data/Name"
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Secure password"
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button onClick={() => handleAction("load")} disabled={isLoading}>
          📂 Load existent Wallet
        </button>
        <button onClick={() => handleAction("create")} disabled={isLoading} style={{ backgroundColor: '#2196F3' }}>
          ✨ Create a new Wallet
        </button>
      </div>
      
      {isLoading && <p>...Procesing...</p>}
    </div>
  );
}