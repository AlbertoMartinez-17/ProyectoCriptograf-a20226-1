// JSON de transacción
import { canonicalJson } from '../utils/canonicalJSON';

export interface Transaction {
  from: string;
  to: string;
  value: string;
  nonce: string;
  timestamp: string;
  gas_limit?: string; 
  data_hex?: string;
}

  /**
   *
   * @remarks
   * This static method create the JSON for a transaction when the user in the GUI selects send a transaction
   *
   * @param from  - derivated address from the public key of the sender
   * @param to -  derivated addres from the public key of the receiver
   * @param value - amount of the transaction
   * @param nonce - nonce to ensure that the transaction is unique and avoid replay attacks
   * @param gasLimit - 
   * @param dataHex
   * @param timestamp - timestamp for non.repudiation and ensure the unicity of the transaction
   * @returns the canoical JSON for propierty works the transaction (sign, verify)
   *
   */

export function createTransaction(params: {
  from: string;
  to: string;
  value: string | number;
  nonce: string | number;
  gasLimit?: string | number;
  dataHex?: string;
  timestamp?: string
}) {
  const tx: Transaction =  {
    from: params.from.toLowerCase(),
    to: params.to.toLowerCase(),
    value: params.value.toString(),
    nonce: params.nonce.toString(), //NONCE FOR MAKE UNIQUE TRANSACTIONS
    timestamp: params.timestamp ?? new Date().toISOString()
  };

  if (params.gasLimit !== undefined) {
    tx.gas_limit = params.gasLimit.toString();
  }

  if (params.dataHex) {
    tx.data_hex = params.dataHex.toLowerCase();
  }

  const canonical = canonicalJson(tx);
  return { tx, canonical };
}