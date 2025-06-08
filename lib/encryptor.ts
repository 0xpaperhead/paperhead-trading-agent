import 'server-only';
import { createCipheriv, createDecipheriv, createHash } from "crypto";
import base58 from 'bs58';

export class Encryptor {
    private salt: Buffer;
    private rounds: number;

    constructor(salt: string, rounds: number) {
        this.salt = Buffer.from(salt, 'utf-8');
        this.rounds = rounds;
    }

    private generateSalt(): Buffer {
        let hashedSalt = createHash('md5').update(this.salt).digest();
        for (let i = 0; i < this.rounds; i++) {
            hashedSalt = createHash('md5').update(hashedSalt).digest();
        }
        return hashedSalt;
    }

    private generateKey(password: string): Buffer {
        return createHash('sha256').update(password).digest();
    }

    encryptBytes(inputBytes: Buffer, password: string): Buffer {
        const salt = this.generateSalt();
        const key = this.generateKey(password);
        let encrypted = Buffer.from(inputBytes);

        for (let i = 0; i < this.rounds; i++) {
            const cipher = createCipheriv('aes-256-cfb', key, salt);
            // @ts-expect-error - cipher.update() expects string or Buffer but can actually handle both parameters and return types properly at runtime
            encrypted = cipher.update(encrypted);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
        }

        return encrypted;
    }

    decryptBytes(inputBytes: Buffer, password: string): Buffer {
        const salt = this.generateSalt();
        const key = this.generateKey(password);
        let decrypted = Buffer.from(inputBytes);

        for (let i = 0; i < this.rounds; i++) {
            const decipher = createDecipheriv('aes-256-cfb', key, salt);
            // @ts-expect-error - decipher.update() expects string or Buffer but can actually handle both parameters and return types properly at runtime
            decrypted = decipher.update(decrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
        }

        return decrypted;
    }

    encrypt(text: string, password: string): string {
        const textToHex = Buffer.from(base58.decode(text)).toString('hex');
        const encrypted = this.encryptBytes(Buffer.from(textToHex, 'utf-8'), password);
        return encrypted.toString('base64');
    }

    decrypt(text: string, password: string): string {
        const decrypted = this.decryptBytes(Buffer.from(text, 'base64'), password);
        const decryptedHexString = decrypted.toString('utf-8');
        
        return base58.encode(Buffer.from(decryptedHexString, 'hex'));
    }
}