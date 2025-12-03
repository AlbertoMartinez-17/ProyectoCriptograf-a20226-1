import express from "express";
import cors from "cors";
import path from "path";
import { Wallet } from "./wallet"; // ruta correcta según tu proyecto

const app = express();
app.use(cors());
app.use(express.json());

// Instancia global de Wallet (se inicializa después)
let wallet: Wallet | null = null;

//Crear wallet
app.post("/api/wallet/create", async (req, res) => {
  const { passphrase, directory } = req.body;

  try {
    wallet = await Wallet.create(passphrase, directory);
    res.json({
      ok: true,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//Cargar wallet existente
app.post("/api/wallet/load", async (req, res) => {
  const { passphrase, directory } = req.body;

  try {
    wallet = await Wallet.load(passphrase, directory);

    res.json({
      ok: true,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//Enviar transacción
app.post("/api/wallet/send", async (req, res) => {
  if (!wallet) return res.status(400).json({ ok: false, error: "Wallet not loaded" });

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

  const files = wallet.getInboxFiles();
  res.json({ ok: true, inbox: files });
});

//Verificar transacción
app.post("/api/wallet/verify", async (req, res) => {
  if (!wallet) return res.status(400).json({ ok: false, error: "Wallet not loaded" });

  const { filename } = req.body;

  try {
    const result = await wallet.verifyInboxFile(filename);
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//Server
app.listen(3000, () => {
  console.log("Cold Wallet API running on http://localhost:3000");
});
