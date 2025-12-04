import { useEffect, useState } from "react";

export default function KeysPanel() {
  const [address, setAddress] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const addr = sessionStorage.getItem("address") || "";
    const pub = sessionStorage.getItem("publicKey") || "";
    setAddress(addr);
    setPublicKey(pub);
  }, []);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  return (
    <div className="panel">
      <h2>Your Keys</h2>

      <div className="key-line">
        <strong>Address:</strong>
        <span>{address}</span>
        <button onClick={() => copy(address)}>Copy</button>
      </div>

      <div className="key-line">
        <strong>Public Key:</strong>
        <span className="public-key">{publicKey}</span>
        <button onClick={() => copy(publicKey)}>Copy</button>
      </div>
    </div>
  );
}
