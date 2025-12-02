// Genera par de llaves Ed25519, las cifra con AES-256-GCM usando una llave derivada con Argon2id, y guarda el JSON en disco.

import sodium from 'libsodium-wrappers';
import argon2 from 'argon2';
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash
} from 'crypto';
import { writeFile, readFile } from 'fs/promises';

//***THIS IS THE ORIGINL KEYSTORE CREATED BY ADRI, IT WAS JUST TRANLATED TO TS TO ENSURE CLRAITY WITH THE TYPED AND MOVED TO THE ROOT DIR ***/

export const DEFAULT_KEYSTORE_PATH = './keystore.json';

// Parámetros para Argon2id
const ARGON2_PARAMS = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16, // 64 MiB
  timeCost: 3,
  parallelism: 1,
  hashLength: 32, 
  raw: true as const
};

//Genera un nuevo par de llaves Ed25519. Devuelve publicKey, secretKey
export async function generateEd25519Keypair() {
  await sodium.ready;
  const { publicKey, privateKey } = sodium.crypto_sign_keypair();
  // Renombramos privateKey a secretKey para conservar compatibilidad con tu código original
  return { publicKey, secretKey: privateKey };
}

//Llave simétrica de 32 bytes usando Argon2id.

export async function deriveKeyFromPassphrase(passphrase: string) {
  const salt = randomBytes(16); // 128 bits

  const key = await argon2.hash(passphrase, {
    ...ARGON2_PARAMS,
    salt
  }) as Buffer;

  const paramsPublicos = {
    salt_b64: salt.toString('base64'),
    t_cost: ARGON2_PARAMS.timeCost,
    m_cost: ARGON2_PARAMS.memoryCost,
    p: ARGON2_PARAMS.parallelism
  };

  return { key, salt, paramsPublicos };
}

//Cifra la private key usando AES-256-GCM.

export function encryptPrivateKeyAesGcm(key: Buffer, plaintext: Buffer) {
  const nonce = randomBytes(12); // 96 bits -> recomendado para GCM
  const cipher = createCipheriv('aes-256-gcm', key, nonce);

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext, nonce, tag };
}

//Construye el objeto JSON del keystore 
export function buildKeystoreJson({
  kdfParams,
  ciphertext,
  nonce,
  tag,
  publicKey
}: any) {
  const keystoreCore = {
    kdf: 'Argon2id',
    kdf_params: kdfParams,
    cipher: 'AES-256-GCM',
    cipher_params: {
      nonce_b64: nonce.toString('base64')
    },
    ciphertext_b64: ciphertext.toString('base64'),
    tag_b64: tag.toString('base64'),
    pubkey_b64: Buffer.from(publicKey).toString('base64'),
    created: new Date().toISOString(),
    scheme: 'Ed25519'
  };

  // Checksum 
  const checksum = createHash('sha256')
    .update(JSON.stringify(keystoreCore))
    .digest('base64');

  return {
    ...keystoreCore,
    checksum_b64: checksum
  };
}

//Nuevo keystore

export async function createNewKeystore(
  passphrase: string,
  path = DEFAULT_KEYSTORE_PATH
) {
  if (typeof passphrase !== 'string' || passphrase.length < 8) {
    throw new Error('La passphrase debe ser un string de al menos 8 caracteres.');
  }

  // Generar par de llaves
  const { publicKey, secretKey } = await generateEd25519Keypair();

  // Derivar llave simétrica con Argon2id
  const { key, paramsPublicos } = await deriveKeyFromPassphrase(passphrase);

  // Cifrar private key con AES-256-GCM
  const { ciphertext, nonce, tag } = encryptPrivateKeyAesGcm(
    key,
    Buffer.from(secretKey)
  );

  // Borrar key en memoria después de usarla
  key.fill(0);

  // 4) Construir JSON
  const keystoreJson = buildKeystoreJson({
    kdfParams: paramsPublicos,
    ciphertext,
    nonce,
    tag,
    publicKey
  });

  // Guardar archivo
  await writeFile(path, JSON.stringify(keystoreJson, null, 2), {
    encoding: 'utf8',
    flag: 'w'
  });

  return {
    path,
    keystore: keystoreJson,
    publicKey,
    secretKey
  };
}

//Carga un keystore existente y descifra la private key.

export async function loadKeystore(passphrase: string, path = DEFAULT_KEYSTORE_PATH) {
  const raw = await readFile(path, 'utf8');
  const ks = JSON.parse(raw);

  // Verificar checksum 
  const { checksum_b64, ...core } = ks;
  const expectedChecksum = createHash('sha256')
    .update(JSON.stringify(core))
    .digest('base64');

  if (checksum_b64 !== expectedChecksum) {
    throw new Error('Checksum del keystore no coincide (posible corrupción o modificación).');
  }

  //Reconstruir parámetros de Argon2id
  const { salt_b64, t_cost, m_cost, p } = ks.kdf_params;
  const salt = Buffer.from(salt_b64, 'base64');

  const key = await argon2.hash(passphrase, {
    type: argon2.argon2id,
    memoryCost: m_cost,
    timeCost: t_cost,
    parallelism: p,
    hashLength: 32,
    raw: true,
    salt
  }) as Buffer;

  //Descifrar con AES-256-GCM
  const nonce = Buffer.from(ks.cipher_params.nonce_b64, 'base64');
  const ciphertext = Buffer.from(ks.ciphertext_b64, 'base64');
  const tag = Buffer.from(ks.tag_b64, 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  // Borrar key en memoria
  key.fill(0);

  const secretKey = new Uint8Array(plaintext);
  const publicKey = new Uint8Array(Buffer.from(ks.pubkey_b64, 'base64'));

  return { publicKey, secretKey };
}