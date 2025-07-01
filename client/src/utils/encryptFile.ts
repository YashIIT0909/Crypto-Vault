export async function encryptFileWithKey(file: File, key: CryptoKey): Promise<Blob> {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
    const fileBuffer = await file.arrayBuffer();

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        fileBuffer
    );

    // Combine IV + Encrypted data
    const combined = new Uint8Array(iv.byteLength + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.byteLength);

    return new Blob([combined], { type: file.type });
}
