export async function decryptFileWithKey(blob: Blob, key: CryptoKey): Promise<ArrayBuffer> {
    const buffer = await blob.arrayBuffer();
    const data = new Uint8Array(buffer);

    const iv = data.slice(0, 12);
    const encryptedData = data.slice(12);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        encryptedData
    );

    return decryptedBuffer;
}
