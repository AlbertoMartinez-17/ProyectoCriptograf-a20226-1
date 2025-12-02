import * as crypto from 'crypto';

export interface EncryptedData {
    ciphertext: Buffer;
    nonce: Buffer;
    authTag: Buffer;
}

  /**
   *
   * @remarks
   * This method is part fo the isolated crypto module just to cipher private key with symmetric encryption
   * We're using GCM because the private keys are very long and need from a "stream function" to encrypt all the key, but we're using AES as a standard
   *
   * @param key - Simmetric key in bytes, remembering for the class that the ciphers only use bits or bytes
   * @param plaintext - plaintext in bytes, remembering for the class that the ciphers only works with bits or bytes
   * @returns interface or dict that contains th cipherkey, nonce and authTag
   *
   */
export function encryptAESGCM(key: Buffer, plaintext: Buffer):  EncryptedData {
    const nonce = crypto.randomBytes(12) // 8*12=96 bits the standard for AES GCM counter
    const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce)

    const ciphertext = Buffer.concat([
        cipher.update(Buffer.from(plaintext)),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    return {ciphertext, nonce, authTag} //REVISAR SI ES CORRECTO CUARDAR EL NONCE, AUTHTAG SOLO ESTA HACIENDO AUTENTICAICIÓN DE HMAC
}

  /**
   *
   * @remarks
   * This method is part fo the isolated crypto module just to decryot a private key with symmetric encryption
   * We're using GCM because the private keys are very long and need from a "stream function" to encrypt all the key, but we're using AES as a standard
   *
   * @param key - Simmetric key in bytes, remembering for the class that the ciphers only use bits or bytes
   * @param ciphertext - ciphertext in bytes, remembering for the class that the ciphers only works with bits or bytes
   * @param nonce - the nonce used for cipher the private key, in bytes
   * @param authTag - the hash created for authentication that GCM needs, in bytes
   * @param ciphertext
   * @returns interface or dict that contains th cipherkey, nonce and authTag
   *
   */
export function decryptAESGCM(key: Buffer, ciphertext: Buffer, nonce: Buffer, authTag: Buffer):  Buffer {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
}