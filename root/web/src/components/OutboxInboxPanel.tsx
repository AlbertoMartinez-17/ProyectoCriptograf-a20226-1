import { useEffect, useState } from "react";
import { getInbox, verifyTx } from "../api";

export default function OutboxInboxPanel() {
  const [inboxFiles, setInboxFiles] = useState<string[]>([]);

  // This function is to refresh the inbox
  async function refreshInbox() {
    try {
      const res = await getInbox();
      if (res.ok) {
        setInboxFiles(res.inbox);
      }
    } catch (e) {
      console.error("Error loading inbox");
    }
  }

  // This functons is to start verify a transaction
  async function handleVerify(filename: string) {
    try {
      const res = await verifyTx(filename);
      if (res.ok && res.result.valid) {
        alert("✅ AMOUNT RECEIVED: The transaction is authentic.");
      } else {
        const razon = res.result?.reason || res.error || "UNknown";
        alert(`❌ WARNING:\nThe transactios is not valid.\nRazón: ${razon}`);
      }
    } catch (e) {
      alert("Error verificando archivo");
    }
  }

  // Load when starting and use the function "refreshInbox" to refresh the new transactions
  useEffect(() => {
    refreshInbox();
    const interval = setInterval(refreshInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>(Inbox)</h2>
        <button onClick={refreshInbox} style={{padding: '5px 10px', fontSize: '0.8em'}}>🔄</button>
      </div>

      {inboxFiles.length === 0 && <p style={{color: '#666'}}>You don't have new transactions.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {inboxFiles.map((file) => (
          <li key={file} style={{ 
            background: '#1e1e1e', 
            margin: '5px 0', 
            padding: '10px', 
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontFamily: 'monospace' }}>{file}</span>
            <button onClick={() => handleVerify(file)} style={{ background: '#4CAF50', border: 'none' }}>
              🔍 Verify
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}