// canonical.ts
/**
 * Este código convierte un objeto JSON en una forma canónica y determinista.
 * - Ordena las claves alfabéticamente
 * - Convierte números a strings
 * - Devuelve un Uint8Array para usar en firmas
 */

function canonicalJSON(obj: any): Uint8Array {
  const normalize = (o: any): any => {
    if (Array.isArray(o)) return o.map(normalize);
    if (o && typeof o === "object") {
      return Object.keys(o)
        .sort()
        .reduce((r, k) => {
          r[k] = normalize(o[k]);
          return r;
        }, {} as any);
    }
    if (typeof o === "number") return o.toString();
    return o;
  };

  const normalized = normalize(obj);
  const json = JSON.stringify(normalized);
  return new TextEncoder().encode(json);
}

// Export estilo CommonJS
module.exports = { canonicalJSON };

