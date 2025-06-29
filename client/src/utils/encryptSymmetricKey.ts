const encoder = new TextEncoder();

export async function encryptSymmetricKey(key: CryptoKey, password: string): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const derivedKey = await deriveKeyFromPassword(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        rawKey
    );

    // Combine: salt + iv + encryptedKey → base64
    const combined = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.byteLength);
    combined.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

    return btoa(String.fromCharCode(...combined)); // Base64
}


async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}
