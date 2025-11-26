// Verificación de transacciones firmadas

import nacl from 'tweetnacl';
import { canonicalJson } from '../util/canonicalJson.js';
import { addressFromPubKey } from '../crypto/address.js';

// Mapa en memoria
const nonceTracker = new Map();

//Verifica transacción firmada.

export function verifySignedTransaction(signedTx) {
  try {
    const { tx, sig_scheme, signature_b64, pubkey_b64 } = signedTx;

    if (sig_scheme !== 'Ed25519') {
      return { valid: false, reason: 'sig_scheme no soportado' };
    }

    const canonical = canonicalJson(tx);
    const msg = new TextEncoder().encode(canonical);

    const sig = new Uint8Array(Buffer.from(signature_b64, 'base64'));
    const pub = new Uint8Array(Buffer.from(pubkey_b64, 'base64'));

    const ok = nacl.sign.detached.verify(msg, sig, pub);
    if (!ok) {
      return { valid: false, reason: 'Firma inválida' };
    }

    // Verificar que la dirección coincida con tx.from
    const derivedAddr = addressFromPubKey(pub);
    if (derivedAddr !== tx.from.toLowerCase()) {
      return {
        valid: false,
        reason: `Dirección no coincide (from=${tx.from}, derivada=${derivedAddr})`
      };
    }

    // Protección contra replay
    const addr = derivedAddr;
    const seen = nonceTracker.get(addr) ?? -1n;
    const nonce = BigInt(tx.nonce);

    if (nonce <= seen) {
      return { valid: false, reason: 'Replay o nonce obsoleto' };
    }

    nonceTracker.set(addr, nonce);

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `Error en verificación: ${err.message}` };
  }
}
