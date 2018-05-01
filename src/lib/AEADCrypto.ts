import * as crypto from "crypto";
import * as semver from "semver";

/**
 * Starting with NodeJS 10, we can use the official crypto API to do AEAD encryption
 * because authTagLength is now configurable. This module is a wrapper around either
 * node-aead-crypto or the native methods
 */
export interface EncryptionResult {
	ciphertext: Buffer;
	auth_tag: Buffer;
}
export interface DecryptionResult {
	plaintext: Buffer;
	auth_ok: boolean;
}

export interface AEADEncryptionInterface {
	encrypt: (
		key: Buffer,
		iv: Buffer,
		plaintext: Buffer,
		additionalData: Buffer,
		authTagLength?: number,
	) => EncryptionResult;

	decrypt: (
		key: Buffer,
		iv: Buffer,
		ciphertext: Buffer,
		additionalData: Buffer,
		authTag: Buffer,
	) => DecryptionResult;
}

let CCMInterface: AEADEncryptionInterface;
let GCMInterface: AEADEncryptionInterface;

function encryptNative(
	mode: "ccm" | "gcm",
	key: Buffer,
	iv: Buffer,
	plaintext: Buffer,
	additionalData: Buffer,
	authTagLength: number,
): EncryptionResult {

	// prepare encryption
	const algorithm = `aes-${key.length * 8}-${mode}`;
	// @ts-ignore The 4th parameter is available starting in NodeJS 10+
	const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength });
	// @ts-ignore The 2nd parameter is available starting in NodeJS 10+
	cipher.setAAD(additionalData, { plaintextLength: plaintext.length });

	// do encryption
	const ciphertext = cipher.update(plaintext);
	cipher.final();
	const auth_tag = cipher.getAuthTag();

	return { ciphertext, auth_tag };
}

function decryptNative(
	mode: "ccm" | "gcm",
	key: Buffer,
	iv: Buffer,
	ciphertext: Buffer,
	additionalData: Buffer,
	authTag: Buffer,
): DecryptionResult {

	// prepare decryption
	const algorithm = `aes-${key.length * 8}-${mode}`;
	// @ts-ignore The 4th parameter is available starting in NodeJS 10+
	const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength });
	decipher.setAuthTag(authTag);
	// @ts-ignore The 2nd parameter is available starting in NodeJS 10+
	decipher.setAAD(additionalData, { plaintextLength: ciphertext.length });

	// do decryption
	const plaintext = decipher.update(ciphertext);
	// verify decryption
	let auth_ok: boolean = false;
	try {
		decipher.final();
		auth_ok = true;
	} catch (e) {/* nothing to do */ }
	return { plaintext, auth_ok };
}

if (semver.satisfies(process.version, ">=10")) {
	// We can use the native methods
	CCMInterface = {
		encrypt: encryptNative.bind(undefined, "ccm"),
		decrypt: decryptNative.bind(undefined, "ccm"),
	};
	GCMInterface = {
		encrypt: encryptNative.bind(undefined, "gcm"),
		decrypt: decryptNative.bind(undefined, "gcm"),
	};
} else {
	// import from the node-aead-crypto module
	({ ccm: CCMInterface, gcm: GCMInterface } = require("node-aead-crypto"));
}

export { CCMInterface as ccm, GCMInterface as gcm };
