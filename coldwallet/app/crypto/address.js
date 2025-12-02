//Derivación de dirección a partir de la llave pública (Ed25519)

// IMPORT CommonJS:
import pkg from 'js-sha3';
const { keccak256 } = pkg;

export function addressFromPubKey(publicKey) {
  const bytes = Buffer.from(publicKey);
  const hashHex = keccak256(bytes); // 32 bytes

  // Tomamos los últimos 20 bytes 
  const addrHex = hashHex.slice(-40);
  return '0x' + addrHex.toLowerCase();
}

