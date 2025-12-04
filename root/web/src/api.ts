const API = "http://localhost:3000/api";

function getHeaders() {
  const sessionId = sessionStorage.getItem("sessionId") || "";
  return {
    "Content-Type": "application/json",
    "x-session-id": sessionId
  };
}

export async function createWallet(passphrase: string, directory: string) {
  const r = await fetch(`${API}/wallet/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase, directory }),
  });
  return r.json();
}

export async function loadWallet(passphrase: string, directory: string) {
  const r = await fetch(`${API}/wallet/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase, directory }),
  });
  return r.json();
}

export async function sendTx(toAddress: string, amount: number, passphrase: string, receiverInboxPath: string) {
  const r = await fetch(`${API}/wallet/send`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ toAddress, amount, passphrase, receiverInboxPath }),
  });
  return r.json();
}

export async function getInbox() {
  const r = await fetch(`${API}/wallet/inbox`, { headers: getHeaders() });
  return r.json();
}

export async function getOutbox() {
  const r = await fetch(`${API}/wallet/outbox`, { headers: getHeaders() });
  return r.json();
}

export async function verifyTx(filename: string) {
  const r = await fetch(`${API}/wallet/verify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ filename }),
  });
  return r.json();
}

export async function readAddress(path: string) {
  const r = await fetch(`${API}/wallet/readAddress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  return r.json();
}
