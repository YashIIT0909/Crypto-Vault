// import * as ethSigUtil from '@metamask/eth-sig-util';

// export async function encryptSymmetricKeyWithPublicKey(
//     walletAddress: string,
//     symmetricKey: string
// ): Promise<string> {
//     const publicKey = await window.ethereum.request({
//         method: 'eth_getEncryptionPublicKey',
//         params: [walletAddress],
//     });

//     const encrypted = ethSigUtil.encrypt({
//         publicKey,
//         data: symmetricKey,
//         version: 'x25519-xsalsa20-poly1305',
//     });

//     const encryptedString = JSON.stringify(encrypted);
//     const encryptedBase64 = btoa(unescape(encodeURIComponent(encryptedString))); // base64 without Buffer

//     return encryptedBase64;
// }
