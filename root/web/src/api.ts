const API = "http://localhost:3000/api";

export async function getOutbox() {
  const r = await fetch(${API}/outbox);
  return r.json();
}

export async function saveToOutbox(tx: any) {
  const r = await fetch(${API}/outbox, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });
  return r.json();
}

export async function moveToVerified(filename: string) {
  const r = await fetch(${API}/inbox, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  return r.json();
}