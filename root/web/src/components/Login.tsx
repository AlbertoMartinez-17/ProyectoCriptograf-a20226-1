import { useState } from "react";
import { getSession } from "../api";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [passphrase, setPassphrase] = useState("");

  async function handleLogin() {
    if (!passphrase.trim()) return alert("Ingresa una contraseña");

    // Aquí puedes usar getSession o llamar a tu API de login
    const data = await getSession();

    localStorage.setItem("sessionId", data.sessionId);
    localStorage.setItem("passphrase", passphrase);

    onLogin(); // avisamos al App que ya inició sesión
  }

  return (
    <div className="login-container">
      <h2>Inicia Sesión</h2>

      <input
        type="password"
        placeholder="Passphrase"
        value={passphrase}
        onChange={(e) => setPassphrase(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}
