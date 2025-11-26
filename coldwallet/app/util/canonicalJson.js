//JSON canónico: claves ordenadas, números como string.

function normalizeValue(value) {
  if (value === null) return null;

  const t = typeof value;

  if (t === 'string' || t === 'boolean') {
    return value;
  }

  if (t === 'number' || t === 'bigint') {
    // Para evitar diferencias de representación, todo número va como string
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (t === 'object') {
    const out = {};
    const keys = Object.keys(value).sort();
    for (const k of keys) {
      out[k] = normalizeValue(value[k]);
    }
    return out;
  }

  throw new Error(`Tipo no soportado en canonicalJson: ${t}`);
}

/**
 * Devuelve un string JSON determinista.
 */
export function canonicalJson(obj) {
  const normalized = normalizeValue(obj);
  return JSON.stringify(normalized);
}
