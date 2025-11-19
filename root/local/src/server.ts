import express from "express";
import cors from "cors";

const fileManager = require("./fileManager");

const app = express();
app.use(cors());
app.use(express.json());

// Asegura carpetas antes de empezar
fileManager.ensureDirs();

app.get("/api/outbox", (req: any, res: any) => {
  res.json({ files: fileManager.loadOutbox?.() || [] });
});

app.post("/api/outbox", (req: any, res: any) => {
  const filename = fileManager.saveTxToOutbox(req.body);
  res.json({ ok: true, filename });
});

app.post("/api/inbox", (req: any, res: any) => {
  const filename = req.body.filename;
  fileManager.moveToVerified(filename);
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Servidor local corriendo en http://localhost:3000");
});
