import sodium from 'libsodium-wrappers';
import { canonicalJson } from '../utils/canonicalJSON';
import { addressToPubKey } from './address';
import { SignedTransaction } from './signer';
//To smulate the avoidance of replay attacks
const nonceTracker = new Map<string, bigint>();

export interface VerificationResult {
    valid: boolean;
    reason?: string;
}

  /**
   * Returns true if all the parameters of the transacion are valid with focus on the authentication of the sender
   *
   * @param SignedTransaction - object or dict that contains the signed transaction of the sender
   * @returns true if the trsanaction was successfully authenticated
   *
   * @beta
   */

export async function verifySignedTransaction(signedTx: SignedTransaction): Promise<VerificationResult> {
    try {
        await sodium.ready;

        const { tx, sig_scheme, signature_b64, pubkey_b64 } = signedTx;

        if (sig_scheme !== 'Ed25519') {
            return { valid: false, reason: 'Esquema de firma no soportado (se requiere Ed25519)' };
        }

        const canonical = canonicalJson(tx);
        const msg = sodium.from_string(canonical);

        const sig = Buffer.from(signature_b64, 'base64');
        const pub = Buffer.from(pubkey_b64, 'base64');

        //This part is the one that verifies the sign using libsodium and the priv/pub scheme
        const isValidSignature = sodium.crypto_sign_verify_detached(sig, msg, pub);

        if (!isValidSignature) {
            return { valid: false, reason: 'Firma inválida' };
        }

        //This part ensures that the direction is from who we think, derives the pubKey for do this
        const derivedAddr = addressToPubKey(pub);
        if (derivedAddr !== tx.from.toLowerCase()) {
            return {
                valid: false,
                reason: `Dirección no coincide (from?${tx.from}, derivada=${derivedAddr})`
            };
        }

        //Protección contra replay
        const currentNonce = BigInt(tx.nonce);
        const lastNonce = nonceTracker.get(derivedAddr) ?? BigInt(-1);

        if (currentNonce <= lastNonce) {
            return { 
                valid: false, 
                reason: `'Replay o nonce obsoleto'  ${currentNonce}, Esperado > ${lastNonce})` 
            };
        }

        //If the transaction is valid, we update the last nonce
        nonceTracker.set(derivedAddr, currentNonce);

        return { valid: true };

    } catch (err: any) {
        return { valid: false, reason: `Error interno de verificación: ${err.message}` };
    }
}