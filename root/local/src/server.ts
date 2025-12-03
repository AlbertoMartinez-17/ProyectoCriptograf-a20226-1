import express from "express";
import cors from "cors";
import path from "path";
import { randomUUID } from "crypto";

const fileManager = require("./fileManager");
const { Wallet } = require("./wallet");

const app = express();
app.use(cors());
app.use(express.json());

fileManager.ensureDirs();

let wallet:any = null;

/* ------------------ WALLET API ------------------ */

// Crear wallet
app.post("/api/wallet/create", async (req, res) => {
  const { passphrase, directory } = req.body;

  try {
    wallet = await Wallet.create(passphrase, directory);

    res.json({
      ok: true,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64,
      inboxPath: wallet.inboxPath,
      outboxPath: wallet.outboxPath,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Cargar wallet
app.post("/api/wallet/load", async (req, res) => {
  const { passphrase, directory } = req.body;

  try {
    wallet = await Wallet.load(passphrase, directory);

    res.json({
      ok: true,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64,
      inboxPath: wallet.inboxPath,
      outboxPath: wallet.outboxPath,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Enviar transacción
app.post("/api/wallet/send", async (req, res) => {
  if (!wallet)
    return res.status(400).json({ ok: false, error: "Wallet not loaded" });

  const { toAddress, amount, passphrase, receiverInboxPath } = req.body;

  try {
    const filename = await wallet.sendTransaction(
      toAddress,
      amount,
      passphrase,
      receiverInboxPath
    );

    res.json({ ok: true, filename });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Listar inbox
app.get("/api/wallet/inbox", (req, res) => {
  if (!wallet) return res.json({ ok: false, inbox: [] });

  const inbox = wallet.getInboxFiles();
  res.json({ ok: true, inbox });
});

// Verificar transacción
app.post("/api/wallet/verify", async (req, res) => {
  if (!wallet)
    return res.status(400).json({ ok: false, error: "Wallet not loaded" });

  const { filename } = req.body;

  try {
    const result = await wallet.verifyInboxFile(filename);
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* ---------------- OUTBOX / INBOX SIMPLIFICADO ---------------- */

app.get("/api/outbox", (req, res) => {
  res.json({ files: fileManager.loadOutbox?.() || [] });
});

app.post("/api/outbox", (req, res) => {
  const filename = fileManager.saveTxToOutbox(req.body);
  res.json({ ok: true, filename });
});

app.post("/api/inbox", (req, res) => {
  const filename = req.body.filename;
  fileManager.moveToVerified(filename);
  res.json({ ok: true });
});

/* ---------------- SERVER ---------------- */

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});

app.get("/api/session", (req: any, res: any) => {
  const sessionId = randomUUID(); // crea id único
  res.json({ sessionId });
});
