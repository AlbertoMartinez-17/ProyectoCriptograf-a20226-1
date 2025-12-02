import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ensureDirs, saveTxToOutbox, loadInbox, moveToVerified } from "../src/fileManager";
import * as fs from "fs";

describe("fileManager", () => {
  beforeAll(() => {
    ensureDirs();
  });

  it("debe crear las carpetas necesarias", () => {
    const dirs = ["inbox", "outbox", "verified"];
    dirs.forEach(dir => {
      expect(fs.existsSync(dir)).toBe(true);
    });
  });

  it("debe guardar una transacción en outbox", () => {
    const tx = { from: "A", to: "B", value: 10 };
    const file = saveTxToOutbox(tx);
    expect(fs.existsSync(file)).toBe(true);
  });

  it("debe leer transacciones desde inbox", () => {
    // Copiamos un archivo de outbox a inbox
    const outboxFile = fs.readdirSync("outbox")[0];
    fs.copyFileSync(`outbox/${outboxFile}`, `inbox/${outboxFile}`);

    const inboxTxs = loadInbox();
    expect(inboxTxs.length).toBeGreaterThan(0);
    expect(inboxTxs[0]).toHaveProperty("from");
  });

  it("debe mover el archivo a verified", () => {
    const fileName = fs.readdirSync("inbox")[0];
    moveToVerified(fileName);

    expect(fs.existsSync(`verified/${fileName}`)).toBe(true);
    expect(fs.existsSync(`inbox/${fileName}`)).toBe(false);
  });

  afterAll(() => {
    ["inbox", "outbox", "verified"].forEach(dir => {
      fs.rmSync(dir, { recursive: true, force: true });
    });
  });
});

