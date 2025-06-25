// /**
//  * Decrypts a previously encrypted symmetric key using eth_decrypt (MetaMask)
//  */
// export async function decryptSymmetricKeyWithPrivateKey(
//     encryptedKeyBase64: string,
//     walletAddress: string
// ): Promise<string> {
//     const encryptedKeyString = decodeURIComponent(escape(atob(encryptedKeyBase64)));
//     const decrypted = await window.ethereum.request({
//         method: 'eth_decrypt',
//         params: [encryptedKeyString, walletAddress],
//     });

//     return decrypted; // the original symmetric AES key
// }
