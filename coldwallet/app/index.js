// app/index.js
// CLI simple para la wallet


import { createNewKeystore, loadKeystore, DEFAULT_KEYSTORE_PATH } from './crypto/keystore.js';
import { addressFromPubKey } from './crypto/address.js';
import { ensureBaseFolders } from './util/fsSetup.js';
import { createTransaction } from './tx/transaction.js';
import { signTransaction } from './tx/signer.js';
import { verifySignedTransaction } from './tx/verifier.js';

import { readFile, writeFile, readdir, rename, stat } from 'fs/promises';
import { basename, join, resolve } from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

async function askPassphrase(prompt = 'Passphrase: ') {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(prompt);
  await rl.close();
  return answer.trim();
}

async function cmdInit() {
  await ensureBaseFolders('.');
  const pass = await askPassphrase('Nueva passphrase (no se oculta): ');
  const { path, keystore } = await createNewKeystore(pass, DEFAULT_KEYSTORE_PATH);
  console.log('Keystore creado en:', path);
  console.log('PubKey (b64):', keystore.pubkey_b64);
}

async function cmdAddress() {
  const pass = await askPassphrase('Passphrase: ');
  const { publicKey } = await loadKeystore(pass, DEFAULT_KEYSTORE_PATH);
  const addr = addressFromPubKey(publicKey);
  console.log('Address:', addr);
}

async function cmdSign(txPath) {
  if (!txPath) {
    console.error('Uso: node app/index.js sign ruta/tx.json');
    process.exit(1);
  }

  const pass = await askPassphrase('Passphrase: ');
  const { publicKey, secretKey } = await loadKeystore(pass, DEFAULT_KEYSTORE_PATH);

  const raw = await readFile(txPath, 'utf8');
  const txObj = JSON.parse(raw);

  const { tx } = createTransaction({
    from: txObj.from,
    to: txObj.to,
    value: txObj.value,
    nonce: txObj.nonce,
    gasLimit: txObj.gas_limit,
    dataHex: txObj.data_hex,
    timestamp: txObj.timestamp
  });

  const signed = signTransaction(secretKey, tx, publicKey);

  const fileName = basename(txPath, '.json') + '.signed.json';
  const outPath = resolve('outbox', fileName);

  await writeFile(outPath, JSON.stringify(signed, null, 2), 'utf8');
  console.log('Transacción firmada guardada en:', outPath);
}

async function cmdRecv() {
  await ensureBaseFolders('.');
  const inboxDir = resolve('inbox');
  const verifiedDir = resolve('verified');

  const files = await readdir(inboxDir);
  if (files.length === 0) {
    console.log('No hay archivos en inbox/.');
    return;
  }

  for (const f of files) {
    const fullPath = join(inboxDir, f);
    const st = await stat(fullPath);
    if (!st.isFile() || !f.endsWith('.json')) continue;

    try {
      const raw = await readFile(fullPath, 'utf8');
      const signed = JSON.parse(raw);

      const result = verifySignedTransaction(signed);
      if (result.valid) {
        console.log(`${f}: OK`);
        const dest = join(verifiedDir, f);
        await rename(fullPath, dest); // mover archivo validado
      } else {
        console.log(`${f}: INVALIDO -> ${result.reason}`);
      }
    } catch (err) {
      console.log(`${f}: error leyendo o verificando -> ${err.message}`);
    }
  }
}

async function main() {
  const [, , cmd, arg1] = process.argv;

  switch (cmd) {
    case 'init':
      await cmdInit();
      break;
    case 'address':
      await cmdAddress();
      break;
    case 'sign':
      await cmdSign(arg1);
      break;
    case 'recv':
      await cmdRecv();
      break;
    default:
      console.log('Comandos disponibles:');
      console.log('  init              -> crear keystore');
      console.log('  address           -> mostrar dirección');
      console.log('  sign <tx.json>    -> firmar transacción');
      console.log('  recv              -> verificar transacciones en inbox/');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
