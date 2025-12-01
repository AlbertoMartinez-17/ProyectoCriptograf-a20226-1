/**
   * This function create the "canonical JSON" for one JSON. Transforms the whole JSON to string, sort the "key:val" into an array and return it. This create a canonical JSON no matter
   *the librarys used to process it or unpackage it.
   * 
   * @remarks
   * This method is part of the the utils for the project, is required for make tha hash of the transactions
   *
   * @param value - Receives any type of object that could be the JSON
   * @returns The array with the "key:val" pairs sorted
   *
   * @beta
*/
function normalizeValue(value: any): any {
  if (value === null) {
    return null;
  }

  const t = typeof value; //storage the data type of the received object to make some comparisons

  //These following to evaluations are for when you're unpacking other objects o "key:val" in the JSON
  if (t === 'string' || t === 'boolean') {
    return value;
  }

  if (t === 'number' || t === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  //If the type of object is a dict
  if (t === 'object') {
    const out: { [key: string]: any } = {};
    const keys = Object.keys(value).sort();

    // The cycle storage in a sorted array  all the elements of the JSON normalized 
    for (const k of keys) {
      out[k] = normalizeValue(value[k]);
    }
    return out;
  }

  throw new Error(`Tipo no soportado en canonicalJson: ${t}`);
}

  /**
   * Returns a canonical JSON
   *
   * @remarks
   * This method is part of the the utils for the project, is required for make tha hash of the transactions
   *
   * @param obj - The JSON that needs to be canonical
   * @returns Tha canonical JSON in a string object.
   *
   * @beta
   */
export function canonicalJson(obj: any): string {
  const normalized = normalizeValue(obj);
  return JSON.stringify(normalized); //Using the normalize function, it returns a canonical JSON in a string
}