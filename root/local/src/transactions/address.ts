import {keccak256} from 'js-sha3';

/**
   * Derives an address from the publickey of the user, trying to copy the way Ethererum do this. Following the recommendations that the teacher told us
   *
   *
   * @param pK - A string that contains the public key of the user
   * @returns A slice of the hash of the pK, that will be the addres 
   *
*/
export function addressToPubKey(pK: Uint8Array): string {
  //The pK get transformed into byte to work as we excpect with keccak
  const bytes = Buffer.from(pK);
  const hashHex = keccak256(bytes); // 32 bytes

  // Returns the last 20 characters of the digest taking in count that we're working with HEX in the digest of the hash
  const addrHex = hashHex.slice(-40);
  return '0x' + addrHex.toLowerCase();
}
