// Manejo de carpetas base para la wallet

import { mkdir } from 'fs/promises';
import { resolve } from 'path';

export const WALLET_DIRS = ['inbox', 'outbox', 'verified'];

//Crea las carpetas base si no existen.
 
export async function ensureBaseFolders(basePath = '.') {
  const tasks = WALLET_DIRS.map((name) =>
    mkdir(resolve(basePath, name), { recursive: true })
  );
  await Promise.all(tasks);
}
