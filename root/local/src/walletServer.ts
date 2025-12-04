import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { Wallet } from "./wallet";
const fileManager = require("./fileManager");

const app = express();
app.use(cors());
app.use(express.json());

//We're using a hash table to storage multiple wallet-sessions in the server, and use a hash_table to ensure a O(1) when the "backend" is changing the context 
const sessions = new Map<string, Wallet>(); //KEY OF THE SIMULATION

// Function to change the wallet depending on the session "tab" of the browser
function getWallet(req: any, res: any, next: any) {
  const sessionId = req.headers["x-session-id"];
  const wallet = sessions.get(sessionId);

  if (!wallet) {
    return res.status(401).json({ ok: false, error: "Sesión expirada o inválida" });
  }
  
  req.wallet = wallet;
  next();
}

fileManager.ensureDirs();

//****ENDPOINTS FOR THE LOGIN ****/

/**
* The sign up endpoint receives the directory of the user and their password to create a new wallet oject and a new KEYSTORE FILE system in the server
* 
* @param req  - is a posth that receives the dir addres for the simul and the passphrase
* @returns - return a "session token" to identify every user when using the hash table
*/
app.post("/api/wallet/create", async (req, res) => {
  try {
    const { passphrase, directory } = req.body;
    const wallet = await Wallet.create(passphrase, directory);
    
    const sessionId = randomUUID();
    sessions.set(sessionId, wallet); // Storage a new session:wallet (ket:val)

    res.json({
      ok: true,
      sessionId,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
* The login  endpoint receives the directory of the user and their password to create a new wallet oject retrieving from a KEYSTORE.JSON
* 
* @param req  - is a posth that receives the dir addres for the simul and the passphrase
* @returns - return a "session token" to identify every user when using the hash table
*/
app.post("/api/wallet/load", async (req, res) => {
  try {
    const { passphrase, directory } = req.body;
    const wallet = await Wallet.load(passphrase, directory);
    
    const sessionId = randomUUID();
    sessions.set(sessionId, wallet);// Storage a new session:wallet (ket:val) because in this case we have a new instance of a wallet in the memory too

    res.json({
      ok: true,
      sessionId,
      address: wallet.address,
      publicKey: wallet.publicKeyBase64
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

//****ENDPOINTS FOR TRANSACTIONS AND USE THE APP WITH EACH SIMULATED WALLET ****/

//WE NEED TO USE "getWallet" in every method because for any of this endpoints first we need to identifiy the wallet that needs a request

/**
* The use of this endpoint is to send transactions
* 
* @remark WE'RE USING GETWALLET TO GET FROM THE HEADERS OF THE REQ THE SESSION AND IDENTIFY THE RIGHT WALLET IN THE DICT
* 
* @param req  - is a post that receives all the data to create a transaction in the request: receiver address, amount, pasword, and "addres dir" for the simulation
* @returns - return true and the name of teh transaction or an error
*/
app.post("/api/wallet/send", getWallet, async (req: any, res: any) => {
  const { toAddress, amount, passphrase, receiverInboxPath } = req.body;
  try {
    // Usamos req.wallet (la 
    const filename = await req.wallet.sendTransaction(toAddress, amount, passphrase, receiverInboxPath);
    res.json({ ok: true, filename });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
* The use of this endpoint is to update the inbox of the wallet
* 
* @remark WE'RE USING GETWALLET TO GET FROM THE HEADERS OF THE REQ THE SESSION AND IDENTIFY THE RIGHT WALLET IN THE DICT
* 
* @param req  - is a gett that just need the headers to update the inbox of the wallet that we're viewing
* @returns - return true and the names of the current files in inbox
*/
app.get("/api/wallet/inbox", getWallet, (req: any, res: any) => {
  const inbox = req.wallet.getInboxFiles();
  res.json({ ok: true, inbox });
});

/**
* The use of this endpoint is to update the outbox of the wallet
* 
* @remark WE'RE USING GETWALLET TO GET FROM THE HEADERS OF THE REQ THE SESSION AND IDENTIFY THE RIGHT WALLET IN THE DICT
* 
* @param req  - is a get that just need the headers to update the outbox of the wallet that we're viewing
* @returns - return true and the names of the current files in outbox
*/
app.get("/api/wallet/outbox", getWallet, (req: any, res: any) => {
  const outbox = req.wallet.getOutboxFiles();
  res.json({ ok: true, outbox });
});

/**
* The use of this endpoint is to sign  transactions received in inbox
* 
* @remark WE'RE USING GETWALLET TO GET FROM THE HEADERS OF THE REQ THE SESSION AND IDENTIFY THE RIGHT WALLET IN THE DICT
* 
* @param req  - is a post that receives the name of the transaction to use the verify method of the wallet 
* @returns - return true for the petition and true if the transaction is valid
*/
app.post("/api/wallet/verify", getWallet, async (req: any, res: any) => {
  const { filename } = req.body;
  try {
    const result = await req.wallet.verifyInboxFile(filename);
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Servidor Multi-Sesión corriendo en puerto 3000")); //We put to listen the server in the port 3000