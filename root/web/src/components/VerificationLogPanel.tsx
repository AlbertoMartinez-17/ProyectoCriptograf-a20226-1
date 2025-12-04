import { useState } from "react";
import { verifyTx } from "../api";

export default function VerificationLogPanel() {
  const [logs, setLogs] = useState<string[]>([]);
  const [filename, setFilename] = useState("");

  async function handleVerify() {
    const file = filename.trim();
    if (!file) {
      alert("You must enter the file name (eg: tx_123.json)");
      return;
    }

    try {
      const res = await verifyTx(file);

      // --- Validación combinada ---
      const isValid = res.result?.valid ?? res.result === true;
      const reason = res.result?.reason || res.error || "Unknown";

      if (res.ok && isValid) {
        alert("✅ AMOUNT RECEIVED: The transaction is authentic.");

        setLogs(prev => [
          `✅ ${file} → VALID`,
          ...prev
        ]);
      } else {
        alert(`❌ WARNING:\nThe transaction is NOT valid.\nReason: ${reason}`);

        setLogs(prev => [
          `❌ ${file} → INVALID (${reason})`,
          ...prev
        ]);
      }

    } catch (err) {
      alert("❌ Error verifying file");
      setLogs(prev => [`Error verifying ${filename}`, ...prev]);
    }
  }

  return (
    <div className="panel">
      <h2>Verification Log</h2>

      <input
        placeholder="File name in Inbox (eg: tx_123.json)"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />

      <button onClick={handleVerify}>Verify</button>

      <div className="log-box">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
