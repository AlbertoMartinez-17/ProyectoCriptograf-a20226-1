const { saveTxToOutbox, loadInbox, moveToVerified, ensureDirs } = require("./fileManager");
const fs = require("fs");

ensureDirs();

const tx = { from: "0xA1", to: "0xB2", value: "50" };
const savedPath = saveTxToOutbox(tx);
console.log("Archivo guardado:", savedPath);

fs.copyFileSync(savedPath, savedPath.replace("outbox", "inbox"));

const inboxTxs = loadInbox();
console.log("Transacciones en inbox:", inboxTxs);

const fileName = fs.readdirSync("inbox")[0];
moveToVerified(fileName);
console.log("Archivo movido a verified:", fileName);
