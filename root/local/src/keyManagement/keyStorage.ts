import * as fs from 'fs';
import * as crypto from 'crypto'; //Symmetric functions
import * as argon2 from 'argon2'; //Hashes
import sodium from 'libsodium-wrappers'; //ECC Keys
import { addressToPubKey } from '../transactions/address';
import { encryptAESGCM, decryptAESGCM } from './cipher';
import { KeyStoreFile } from './keyStoreFile';

export class KeystoreFile {
    
    // Initialize globally libsodium
    static async init() {
        await sodium.ready;
    }
  /**
   *
   * @remarks
   * This static method works for create a pair of keys, cipher the private key with symmetric encryption and storage it secure.
   *
   * @param passphrase - The "password" of the user to access the wallet/vault
   * @param filepath  - Dir where the JSON will be storaged
   * @returns the address of the created wallet and the public key of the wallet
   *
   */
    static async create(passphrase: string, filepath: string): Promise<{ address: string, pubkey: string }> {
        await this.init(); //This awaits is for give time to the libsodium library

        // Key generation using Ed25519 (libsodium)
        const keypair = sodium.crypto_sign_keypair();
        const publicKey = Buffer.from(keypair.publicKey);
        const privateKey = Buffer.from(keypair.privateKey);

        //Derive symmetric key from password using Argon2id (KFD-HASH)
        const salt = crypto.randomBytes(16); //8*16 = 128 KEY
        const kdfPublicParams = { 
            salt_b64: salt.toString('base64'), 
            t_cost: 3, 
            m_cost: 65536, 
            p: 1 
        };

        const ARGON2_PARAMS = {
          type: argon2.argon2id,
          memoryCost: kdfPublicParams.m_cost, // 64 MiB
          timeCost: kdfPublicParams.t_cost,
          parallelism: kdfPublicParams.p,
          hashLength: 32, 
          raw: true as const
        };

        const derivedKey = await argon2.hash(passphrase, {
            ...ARGON2_PARAMS,
            salt
        }) as Buffer; 

        //Cipher the private key
        const { ciphertext, nonce, authTag } = encryptAESGCM(derivedKey, privateKey);

        // Zeroize the derived key for symmetri encryption and the plain privateKey
        derivedKey.fill(0);
        privateKey.fill(0);

        //Build the JSON using the interface created for this object
        const ksData: KeyStoreFile = {
            kdf: "Argon2id",
            kdf_params: kdfPublicParams,
            cipher: "AES-256-GCM",
            cipher_params: { nonce_b64: nonce.toString('base64') },
            ciphertext_b64: ciphertext.toString('base64'), //cipher private key
            tag_b64: authTag.toString('base64'),
            pubkey_b64: publicKey.toString('base64'),
            address: addressToPubKey(keypair.publicKey),
            created: new Date().toISOString(),
            scheme: "Ed25519"
        };

        // Checksum of the JSON file to ensure integrity
        ksData.checksum_b64 = crypto.createHash('sha256')
            .update(JSON.stringify(ksData)).digest('base64');

        // Storage the JSON file in the indicated path
        fs.writeFileSync(filepath, JSON.stringify(ksData, null, 2));

        return { address: ksData.address, pubkey: ksData.pubkey_b64 }; //We're returning this parameters to create an object "wallet"
    }

  /**
   *
   * @remarks
   * This static method works for load the private key in a secure wey, decipher the private key with symmetric encryption, give it to the wallet for transactions and zeorize the secrets
   *
   * @param passphrase - The "password" of the user to access the wallet/vault
   * @param filepath  - Dir where the JSON is  storaged
   * @returns the address and the public key of the wallet, and most important, the private key for transactions
   *
   */
    static async load(passphrase: string, filepath: string): Promise<{ secretKey: Uint8Array, publicKey: Uint8Array, address: string }> {
        if (!fs.existsSync(filepath)) throw new Error(`Keystore no encontrado en: ${filepath}`);

        const raw = fs.readFileSync(filepath, 'utf-8');
        const ksf: KeyStoreFile = JSON.parse(raw);
        
        //Verify the integrity of the storage file
        const { checksum_b64, ...core } = ksf; //unpackage the hash of the file and the other parameters
        const expected = crypto.createHash('sha256').update(JSON.stringify(core)).digest('base64');
        if (checksum_b64 !== expected) throw new Error("KeystoreFile corrupto (Checksum inválido)");

        //Derive yhe symmetric again from key from password and the kdf_params using Argon2id (KFD-HASH)
        const salt = Buffer.from(ksf.kdf_params.salt_b64, 'base64');
        const derivedKey = await argon2.hash(passphrase, {
            type: argon2.argon2id,
            memoryCost: ksf.kdf_params.m_cost,
            timeCost: ksf.kdf_params.t_cost,
            parallelism: ksf.kdf_params.p,
            hashLength: 32,
            raw: true,
            salt: salt
        });

        // Decrypts the private key after derive the symmetryc key
        try {
            const nonce = Buffer.from(ksf.cipher_params.nonce_b64, 'base64');
            const ciphertext = Buffer.from(ksf.ciphertext_b64, 'base64');
            const tag = Buffer.from(ksf.tag_b64, 'base64');

            const secretKeyBuffer = decryptAESGCM(derivedKey, nonce, ciphertext, tag);
            derivedKey.fill(0); // Limpiar

            return {
                secretKey: new Uint8Array(secretKeyBuffer), //THIS NEEDS TO BE ZEROIZE IN THE NEXT MODULE THAT USE IS (TRANSACTIONS?)
                publicKey: new Uint8Array(Buffer.from(ksf.pubkey_b64, 'base64')),
                address: ksf.address
            };
        } catch (e) {
            throw new Error("Contraseña incorrecta o archivo dañado.");
        }
    }
}