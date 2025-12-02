import { describe, it, expect } from "vitest";
import { canonicalJSON } from "../src/canonical";

describe("canonicalJSON()", () => {
  it("debe producir la misma salida para objetos con diferente orden de llaves", () => {
    const obj1 = { to: "A", from: "B", value: 5 };
    const obj2 = { value: 5, to: "A", from: "B" };

    const result1 = canonicalJSON(obj1);
    const result2 = canonicalJSON(obj2);

    expect(Buffer.from(result1).toString()).toEqual(Buffer.from(result2).toString());
  });

  it("debe convertir correctamente a Uint8Array", () => {
    const obj = { from: "X", to: "Y", value: 10 };
    const result = canonicalJSON(obj);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});

