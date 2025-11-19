# Módulo `fileAndLocal`

**Proyecto:** Cold Wallet – Criptografía y Comunicación Segura  
**Versión:** 1.0.0  
---
## Descripción general

El módulo `fileAndLocal` se encarga de **gestionar los archivos locales** usados por la aplicación de la cold wallet.  
Su función principal es simular el **flujo de transacciones locales**, organizadas en tres carpetas:

| Carpeta | Descripción |
|----------|--------------|
| `inbox/` | Donde se colocan las transacciones **entrantes** para procesar o verificar. |
| `outbox/` | Donde se guardan las transacciones **firmadas o generadas localmente** listas para enviar. |
| `verified/` | Donde se mueven las transacciones **ya verificadas o procesadas exitosamente.** |

Estas carpetas se crean automáticamente la primera vez que se ejecuta cualquier función del módulo.

---

El módulo utiliza las bibliotecas estándar de Node.js:

- `fs` → Lectura y escritura de archivos.
- `path` → Manejo de rutas de archivos y carpetas.

Es por ello que se necesita npm (10.5.0) y node (20.12.2)

---

## Estructura del módulo
src/  
├── canonical.ts  
├── fileManager.ts  

## Funciones disponibles

### 1. `ensureDirs(): void`

Crea (si no existen) las carpetas base del sistema local: inbox/, outbox/, verified/ dentro del directorio actual del proyecto

### 2. `saveTxToOutbox(signedTx: object): string`

Guarda una transacción firmada dentro de la carpeta outbox/.
Retorna una ruta completa del archivo creado, por ejemplo, outbox/tx_1731032890313_a8b3f2.json

**Notas**
- El archivo se guarda en formato JSON legible.
- El nombre incluye un timestamp y un sufijo aleatorio para evitar colisiones.

### 3. `loadInbox(): object[]`

Lee todos los archivos .json de la carpeta inbox/ y devuelve sus contenidos como una lista de objetos.
Retorna un arreglo de objetos JavaScript con las transacciones entrantes.

### 4. `moveToVerified(filename: string): void`

Mueve un archivo desde inbox/ a verified/, una vez que la transacción ha sido validada.

## Notas generales
- No hay que modificar las carpetas inbox/, outbox/, verified/ manualmente (se recomienda agregarlas al .gitignore).
- Al integrar con otros módulos, usar la misma estructura de objeto Transaction. (después se puede definir dicha estructura)