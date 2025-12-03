import { useEffect, useState } from "react";
import KeysPanel from "./components/KeysPanel";
import CreateTxPanel from "./components/CreateTxPanel";
import OutboxInboxPanel from "./components/OutboxInboxPanel";
import VerificationLogPanel from "./components/VerificationLogPanel";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let sessionId = localStorage.getItem("sessionId");

    if (sessionId) {
      setIsLoggedIn(true);
      console.log("Sesión existente:", sessionId);
    }
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="container">
      <h1>Cold Crypto Wallet</h1>

      <div className="grid">
        <KeysPanel />
        <CreateTxPanel />
        <OutboxInboxPanel />
        <VerificationLogPanel />
      </div>
    </div>
  );
}

export default App;
