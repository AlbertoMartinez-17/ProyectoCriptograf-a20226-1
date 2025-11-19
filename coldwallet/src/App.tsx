import KeysPanel from "./components/KeysPanel";
import CreateTxPanel from "./components/CreateTxPanel";
import OutboxInboxPanel from "./components/OutboxInboxPanel";
import VerificationLogPanel from "./components/VerificationLogPanel";

import "./App.css";

function App() {
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