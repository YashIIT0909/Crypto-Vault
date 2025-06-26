// export async function decryptSymmetricKeyWithPrivateKey(
//     encryptedKeyBase64: string,
//     walletAddress: string
// ): Promise<string> {
//     const encryptedKey = JSON.parse(decodeURIComponent(escape(atob(encryptedKeyBase64))));

//     const decrypted = await window.ethereum.request({
//         method: 'eth_decrypt',
//         params: [JSON.stringify(encryptedKey), walletAddress],
//     });

//     return decrypted;
// }
