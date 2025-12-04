# ProyectoCriptograf-a20226-1

## Descripción general
Este proyecto implementa una Cold Wallet funcional para la gestión segura de claves, creación de transacciones, firma digital, verificación criptográfica y simulación de transferencia de archivos.

Incluye:

- Backend (Cold Wallet Server) en Node.js + TypeScript
- Frontend (Web UI) en React + Vite
- Generación y almacenamiento de claves usando Ed25519
- Protección de la llave privada con Argon2id + AES-256-GCM
- Transacciones firmadas, transferidas y verificadas
- Simulación de Outbox / Inbox
- Verificación con prevención de replay attacks

## Características Principales

### Seguridad
- Derivación de llaves Argon2id
- Cifrado de la llave privada en reposo con AES-256-GCM
- Firmas digitales con Ed25519 (libsodium)
- Checksum SHA-256 del keystore
- Nonces monotónicos para prevenir replay attacks
### Gestión de Wallet
- Crear wallet nueva
- Cargar una wallet existente
- Directorios automáticos:
    1. /keystore.json
    2. /inbox/
    3. /outbox/
### Transacciones

- Crear transacción canónica
- Firmar con Ed25519
- Guardar en outbox
- Simular el envío copiando la transacción al inbox del receptor

### Verificación

- Validar firma digital
- Validar dirección derivada
- Validar nonce
- Mostrar resultado en la UI

### Interfaz Web

- Crear / cargar wallet
- Enviar transacciones
- Ver outbox / inbox
- Verificar archivos recibidos
- Registro de eventos

## Instalación y Ejecución
### Backend

`cd local`

`npm install`

`npm run dev:wallet`

Servidor en:
http://localhost:3000

### Frontend

`cd web`

`npm install`

`npm run dev`

Interfaz web en:
http://localhost:5173

## Endpoints del Backend

| Método  | Endpoint | Descripción |
| ------- |:-------------:|:-------------:|
| POST      | /api/wallet/create | Crea wallet nueva |
| POST      | /api/wallet/load   | Carga wallet existente |
| POST      | /api/wallet/send   | Crea y envía una transacción |
| GET       | /api/wallet/inbox  | Lista archivos recibidos |
| POST      | /api/wallet/verify | Verifica transacción del inbox |


## Diseño de Seguridad

Argon2id para derivación de claves a partir de la contraseña

AES-256-GCM para cifrado autenticado del private key

Nonce aleatorio por archivo

Checksum SHA-256 del keystore

Ed25519 para firma digital

Nonce monotónico para prevenir replays

No se exponen claves privadas en el servidor

Toda la criptografía se ejecuta en ambiente local

