// Firma de transacciones con Ed25519

import nacl from 'tweetnacl';
import { canonicalJson } from '../util/canonicalJson.js';

//Firma una transacción.

export function signTransaction(secretKey, txObj, pubKey) {
  if (!(secretKey instanceof Uint8Array) || secretKey.length !== 64) {
    throw new Error('secretKey debe ser Uint8Array de 64 bytes (Ed25519).');
  }

  const canonical = canonicalJson(txObj);
  const msg = new TextEncoder().encode(canonical);

  const sig = nacl.sign.detached(msg, secretKey);

  let publicKey = pubKey;
  if (!publicKey) {
    const kp = nacl.sign.keyPair.fromSecretKey(secretKey);
    publicKey = kp.publicKey;
  }

  const signed = {
    tx: JSON.parse(canonical),
    sig_scheme: 'Ed25519',
    signature_b64: Buffer.from(sig).toString('base64'),
    pubkey_b64: Buffer.from(publicKey).toString('base64')
  };

  return signed;
}
