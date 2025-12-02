export interface KeyStoreFile {
    kdf: "Argon2id";
    kdf_params: {
        salt_b64: string;
        t_cost: number;
        m_cost: number;
        p: number;
    };
    cipher: "AES-256-GCM";
    cipher_params: {
        nonce_b64: string;
    };
    ciphertext_b64: string;
    tag_b64: string;
    pubkey_b64: string;
    address: string;
    created: string;
    scheme: "Ed25519";
    checksum_b64?: string; // The checksum is added for verify integrity of the files
}