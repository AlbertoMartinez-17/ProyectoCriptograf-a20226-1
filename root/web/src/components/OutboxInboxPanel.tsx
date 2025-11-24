import { useEffect, useState } from "react";
import { getOutbox, moveToVerified } from "../api";

export default function OutboxInboxPanel() {
  const [files, setFiles] = useState([]);

  async function load() {
    const data = await getOutbox();
    setFiles(data.files);
  }

  async function verify(filename: string) {
    await moveToVerified(filename);
    alert("Movido a VERIFIED: " + filename);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="panel">
      <h2>📤
 Outbox</h2>
      {files.length === 0 && <p>No hay archivos.</p>}

      {files.map((f) => (
        <div key={f}>
          {f}
          <button onClick={() => verify(f)}>Mover a Verified</button>
        </div>
      ))}
    </div>
  );
}