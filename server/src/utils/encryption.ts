import { encrypt } from '@metamask/eth-sig-util';
import { Buffer } from 'buffer';

export function encryptSymmetricKey(publicKey: string, symmetricKeyBase64: string): string {
    const encrypted = encrypt({
        publicKey,
        data: symmetricKeyBase64,
        version: 'x25519-xsalsa20-poly1305',
    });

    return Buffer.from(JSON.stringify(encrypted), 'utf8').toString('base64');
}
