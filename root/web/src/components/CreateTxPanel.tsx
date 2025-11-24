import { useState } from "react";
import { saveToOutbox } from "../api";

export default function CreateTxPanel() {
  const [msg, setMsg] = useState("");

  async function handleSave() {
    const tx = { message: msg, timestamp: Date.now() };
    const result = await saveToOutbox(tx);
    alert("Guardado en OUTBOX como: " + result.filename);
  }

  return (
    <div className="panel">
      <h2>📝
 Create Transaction</h2>

      <input
        type="text"
        placeholder="Mensaje"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button onClick={handleSave}>Guardar en OUTBOX</button>
    </div>
  );
}