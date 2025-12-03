const API = "http://localhost:3000/api";

// Crear wallet
export async function createWallet(passphrase: string, directory: string) {
  const r = await fetch(`${API}/wallet/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase, directory }),
  });
  return r.json();
}

// Cargar wallet
export async function loadWallet(passphrase: string, directory: string) {
  const r = await fetch(`${API}/wallet/load`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase, directory }),
  });
  return r.json();
}

// Enviar transacción
export async function sendTx(toAddress: string, amount: number, passphrase: string, receiverInboxPath: string) {
  const r = await fetch(`${API}/wallet/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toAddress,
      amount: Number(amount),
      passphrase,
      receiverInboxPath,
    }),
  });
  return r.json();
}

// Listar inbox
export async function getInbox() {
  const r = await fetch(`${API}/wallet/inbox`);
  return r.json();
}

// Verificar archivo del inbox
export async function verifyTx(filename: string) {
  const r = await fetch(`${API}/wallet/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  return r.json();
}

export async function saveToOutbox(tx: any) {
  const r = await fetch(`${API}/outbox`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });
  return r.json();
}

export async function getOutbox() {
  const r = await fetch(`${API}/outbox`);
  return r.json();
}

export async function moveToVerified(filename: string) {
  const r = await fetch(`${API}/wallet/moveToVerified`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  return r.json();
}

export async function getSession() {
  const r = await fetch(`${API}/session`);
  return r.json();
}