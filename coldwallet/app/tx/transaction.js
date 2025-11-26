// JSON de transacción

import { canonicalJson } from '../util/canonicalJson.js';

export function createTransaction({
  from,
  to,
  value,
  nonce,
  gasLimit,
  dataHex,
  timestamp
}) {
  const tx = {
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    value: value.toString(),
    nonce: nonce.toString(),
    timestamp: timestamp ?? new Date().toISOString()
  };

  if (gasLimit !== undefined) {
    tx.gas_limit = gasLimit.toString();
  }

  if (dataHex) {
    tx.data_hex = dataHex.toLowerCase();
  }

  const canonical = canonicalJson(tx);
  return { tx, canonical };
}
