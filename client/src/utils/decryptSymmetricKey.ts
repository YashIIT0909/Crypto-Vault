const encoder = new TextEncoder();

export async function decryptSymmetricKey(encrypted: string, password: string | null): Promise<CryptoKey> {
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedKey = combined.slice(28);

    const derivedKey = await deriveKeyFromPassword(password, salt);

    const rawKey = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        derivedKey,
        encryptedKey
    );

    return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}
async function deriveKeyFromPassword(password: string | null, salt: Uint8Array): Promise<CryptoKey> {
    if (password === null) {
        throw new Error("Password must not be null");
    }
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
