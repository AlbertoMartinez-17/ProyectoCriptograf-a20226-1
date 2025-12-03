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
export async function sendTx(toAddress, amount, passphrase, receiverInboxPath) {
  const r = await fetch(`${API}/wallet/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toAddress,
      amount,
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
