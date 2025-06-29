export async function generateSymmetricKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true, // extractable
        ["encrypt", "decrypt"]
    );
}
