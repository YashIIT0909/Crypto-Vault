// import * as ethSigUtil from '@metamask/eth-sig-util';

// export async function encryptSymmetricKeyWithPublicKey(
//     walletAddress: string,
//     symmetricKey: string
// ): Promise<string> {
//     // 1. Get public encryption key from MetaMask
//     const publicKey = await window.ethereum.request({
//         method: 'eth_getEncryptionPublicKey',
//         params: [walletAddress],
//     });

//     // 2. Encrypt the symmetric key
//     const encrypted = ethSigUtil.encrypt({
//         publicKey,
//         data: symmetricKey, // should be base64 string
//         version: 'x25519-xsalsa20-poly1305',
//     });

//     // 3. Encode the encrypted key (object) to base64 (browser-safe)
//     const encryptedKeyBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(encrypted))));
//     return encryptedKeyBase64;
// }
