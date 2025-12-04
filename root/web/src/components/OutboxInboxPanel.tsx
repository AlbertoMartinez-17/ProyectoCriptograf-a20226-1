import { useEffect, useState } from "react";
import { getInbox } from "../api";

export default function OutboxInboxPanel() {
  const [inboxFiles, setInboxFiles] = useState<string[]>([]);

  // Refresh inbox
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

  // Load on start + refresh every 5 seconds
  useEffect(() => {
    refreshInbox();
    const interval = setInterval(refreshInbox, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h2>Inbox</h2>
        <button
          onClick={refreshInbox}
          style={{ padding: "5px 10px", fontSize: "0.8em" }}
        >
          🔄
        </button>
      </div>

      {inboxFiles.length === 0 && (
        <p style={{ color: "#666" }}>You don't have new transactions.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {inboxFiles.map((file) => (
          <li
            key={file}
            style={{
              background: "#1e1e1e",
              margin: "5px 0",
              padding: "10px",
              borderRadius: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontFamily: "monospace" }}>{file}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
