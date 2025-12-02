// Firma de transacciones con Ed25519

import sodium from 'libsodium-wrappers';
import { canonicalJson } from '../utils/canonicalJSON';
import { Transaction } from './transaction';

export interface SignedTransaction {
    tx: Transaction;
    sig_scheme: 'Ed25519';
    signature_b64: string;
    pubkey_b64: string;
}
//Firma una transacción.

  /**
   * Returns a SignedTransaction object after use the private key of the user and built the objetc.
   *
   * @param secretKey - private key of the user to sign the trsansaction
   * @param txObj - Transaction JSON
   * @param pubKey - public key of the user to add to the signed transaction
   * @returns a SIgnedTRansaction objet
   *
   */

export async function signTransaction(
    secretKey: Uint8Array, 
    txObj: Transaction, 
    pubKey?: Uint8Array
): Promise<SignedTransaction> {
    
    await sodium.ready;

    const canonical = canonicalJson(txObj);
    const msg = sodium.from_string(canonical); 

    const sig = sodium.crypto_sign_detached(msg, secretKey);

    secretKey.fill(0)//zeorize the secret, ZEROIZE AGAIN IN THE PLACE WHERE THIS FUNCTION IS CALLED AND THE SECRET IS LOADED

    let publicKey = pubKey;
    if (!publicKey) {
        publicKey = secretKey.subarray(32, 64);
    }

    const signed: SignedTransaction = {
        tx: txObj,
        sig_scheme: 'Ed25519',
        signature_b64: Buffer.from(sig).toString('base64'),
        pubkey_b64: Buffer.from(publicKey).toString('base64')
    };

    return signed
}
