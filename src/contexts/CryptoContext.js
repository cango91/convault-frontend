import { createContext, useState, useContext, useCallback } from "react";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { arrayBufferToBase64, base64ToArrayBuffer } from "../utilities/utils";

const CryptoContext = createContext();

export function useCrypto() {
    const context = useContext(CryptoContext);
    if (!context) {
        throw new Error('useCrypto must be used within a CryptoProvider');
    }
    return context;
}

export function CryptoProvider({ children }) {
    const [mnemonic, setMnemonic] = useState([]);
    const [privateKey, setPrivateKey] = useState(null);
    const [publicKey, setPublicKey] = useState(null);
    const [dhKeysMap, setDhKeysMap] = useState({});
    const [aesKeysMap, setAesKeysMap] = useState({});

    const generateMnemonic = (strength = 128) => {
        const newMnemonic = bip39.generateMnemonic(wordlist, strength).split(' ');
        setMnemonic(newMnemonic);
    };
    const validateMnemonic = (mn) => bip39.validateMnemonic(mn, wordlist);
    const resetMnemonic = () => setMnemonic([]);
    const generateKeys = () => {
        if (privateKey && publicKey) return;
        window.crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
            true,
            ["encrypt", "decrypt"]
        ).then(keyPair => {
            setPrivateKey(keyPair.privateKey);
            setPublicKey(keyPair.publicKey);
        });
    }

    const deleteKeys = () => {
        setPrivateKey(null);
        setPublicKey(null);
    }

    const exportPrivateKey = async () => {
        if (!privateKey) return;
        try {
            const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
            const exportedKeyBuffer = new Uint8Array(exported);
            const base64Key = arrayBufferToBase64(exportedKeyBuffer);
            const pemKey = `-----BEGIN PRIVATE KEY-----\n${base64Key}\n-----END PRIVATE KEY-----`;
            return pemKey;
        } catch (error) {
            console.error(error);
        }
    }

    const exportPublicKey = async () => {
        if (!publicKey) return;
        try {
            const exported = await window.crypto.subtle.exportKey("spki", publicKey);
            const exportedKeyBuffer = new Uint8Array(exported);
            const base64Key = arrayBufferToBase64(exportedKeyBuffer);
            const pemKey = `-----BEGIN PUBLIC KEY-----\n${base64Key}\n-----END PUBLIC KEY-----`;
            return pemKey;
        } catch (error) {
            console.error(error);
        }
    }

    const importPrivateKey = async (arrayBuffer) => {

        try {
            const privateKey = await window.crypto.subtle.importKey(
                "pkcs8",
                arrayBuffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["decrypt"]
            );
            setPrivateKey(privateKey);
            return privateKey;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const importPublicKey = async (arrayBuffer) => {
        try {
            const publicKey = await window.crypto.subtle.importKey(
                "spki", // SubjectPublicKeyInfo format
                arrayBuffer,
                {
                    name: "RSA-OAEP",
                    hash: "SHA-256",
                },
                true,
                ["encrypt"]
            );
            setPublicKey(publicKey);
            return publicKey;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /** SYMMETRIC ENCRYPTION */
    const importRecipientKey = async (spkiKey) => {
        //console.log(`Type: ${typeof spkiKey}, Value: ${spkiKey}`);
        const strippedKey = spkiKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, "");
        return await window.crypto.subtle.importKey(
            "spki",
            base64ToArrayBuffer(strippedKey),
            {
                name: "RSA-OAEP",
                hash: { name: "SHA-256" },
            },
            true,
            ["encrypt"]
        );
    }

    const generateSymmetricKey = async () => {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    const encryptSymmetrickey = useCallback(async (aesKey, recipientPublicKey) => {
        const exportedAESKey = await window.crypto.subtle.exportKey("raw", aesKey);
        const publicKey = await importRecipientKey(recipientPublicKey)
        const encryptedAESKey = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            exportedAESKey
        );

        return arrayBufferToBase64(encryptedAESKey);
    },[]);

    const generateSymmetricKeyForSession = useCallback(async (userId, userPublicKey) => {
        if (userId in aesKeysMap) return aesKeysMap[userId];
        const aesKey = await generateSymmetricKey();
        const encryptedAesKey = await encryptSymmetrickey(aesKey, userPublicKey);
        setAesKeysMap(prev => ({ ...prev, [userId]: {aesKey, encryptedAesKey} }));
        return aesKeysMap[userId];
    }, [aesKeysMap,encryptSymmetrickey]);

    const decryptSymmetricKey = async (encryptedAESKey, ownPrivateKey) => {
        const decryptedAESKeyBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            ownPrivateKey,
            base64ToArrayBuffer(encryptedAESKey)
        );

        const decryptedAESKey = await window.crypto.subtle.importKey(
            "raw",
            decryptedAESKeyBuffer,
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        );

        //return arrayBufferToBase64(decryptedAESKey);
        return decryptedAESKey;
    }

    const encryptAESGCM = async (data, key) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const enc = new TextEncoder();
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            enc.encode(data)
        );

        // Concatenate and encode
        const fullBuffer = new Uint8Array(encryptedData.byteLength + iv.length);
        fullBuffer.set(new Uint8Array(encryptedData));
        fullBuffer.set(iv, encryptedData.byteLength);

        return arrayBufferToBase64(fullBuffer.buffer);
    }

    const decryptAESGCM = async (encryptedData, key) => {
        const fullBuffer = base64ToArrayBuffer(encryptedData);

        // Deconcatenate
        const iv = fullBuffer.slice(-12);
        const trueEncryptedData = fullBuffer.slice(0, -12);

        const dec = new TextDecoder();
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            trueEncryptedData
        );

        return dec.decode(decryptedData);
    }

    const deleteAesKeys = () => setAesKeysMap({});


    // ephemeral key generation. 1 pair per user-pair per session (for perfect forward secrecy feature - icebox)
    const generateDHKeys = () => {
        return window.crypto.subtle.generateKey({
            name: "ECDH",
            namedCurve: "P-256"
        }, true,
            ["deriveKey"]);
    }

    const deriveSharedSecret = async (dhPublicKey, dhPrivateKey) => {
        return await window.crypto.subtle.deriveKey(
            { name: "ECDH", public: dhPublicKey },
            dhPrivateKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    }

    const encryptSharedSecret = async (recipientPublicKey, sharedSecret) => {
        return await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            recipientPublicKey,
            sharedSecret
        );
    }

    const decryptSharedSecret = async (recipientPrivateKey, sharedSecret) => {
        return await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            recipientPrivateKey,
            sharedSecret);
    }

    const wrapPublicKey = async (recipientPublicKey, dhPublicKey) => {
        return await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            recipientPublicKey,
            dhPublicKey
        );
    }

    const unwrapPublicKey = async (ownPrivateKey, wrappedPublicKey) => {
        return await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            ownPrivateKey,
            wrappedPublicKey
        );
    }

    const generateDHKeysForSession = async (userId) => {
        if (userId in dhKeysMap) return dhKeysMap[userId];
        const ecdh = await generateDHKeys();
        setDhKeysMap(prev => ({
            ...prev, [userId]: {
                dhPrivateKey: ecdh.privateKey,
                dhPublicKey: ecdh.publicKey,
            }
        }));
        return dhKeysMap[userId];
    }

    // Maybe if a chat is deleted? Otherwise just delete all keys at the end of session
    const deleteDHKeysForSession = (userId) => {
        if (!dhKeysMap[userId]) return;
        setDhKeysMap(prev => ({ ...prev, [userId]: {} }));
    }

    const deleteDHKeys = () => {
        setDhKeysMap({});
    }

    const value = {
        /** PFS */
        generateDHKeysForSession,
        deleteDHKeysForSession,
        deleteDHKeys,
        generateKeys,
        deleteKeys,
        deriveSharedSecret,
        encryptSharedSecret,
        decryptSharedSecret,
        wrapPublicKey,
        unwrapPublicKey,
        /** Symmetric */
        privateKey,
        publicKey,
        exportPrivateKey,
        exportPublicKey,
        importPrivateKey,
        importPublicKey,
        generateSymmetricKey,
        generateSymmetricKeyForSession,
        deleteAesKeys,
        encryptAESGCM,
        decryptAESGCM,
        encryptSymmetrickey,
        decryptSymmetricKey,
        importRecipientKey,
        /** BIP39 */
        mnemonic,
        generateMnemonic,
        validateMnemonic,
        resetMnemonic,
    }
    return (
        <CryptoContext.Provider value={value}>
            {children}
        </CryptoContext.Provider>
    );
}