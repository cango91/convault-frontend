import { createContext, useState, useContext } from "react";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { arrayBufferToBase64 } from "../utilities/utils";

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
    const [publicKey,setPublicKey] = useState(null);

    const generateMnemonic = (strength = 128) => {
        const newMnemonic = bip39.generateMnemonic(wordlist, strength).split(' ');
        setMnemonic(newMnemonic);
    };
    const validateMnemonic = (mn) => bip39.validateMnemonic(mn, wordlist);
    const resetMnemonic = () => setMnemonic([]);
    const generateKeys = () => {
        if(privateKey && publicKey) return;
        window.crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: 4096,
            publicExponent: new Uint8Array([1,0,1]),
            hash: 'SHA-256',
        },
        true,
        ["encrypt","decrypt"]
        ).then(keyPair => {
            setPrivateKey(keyPair.privateKey);
            setPublicKey(keyPair.publicKey);
        });
    }

    const deleteKeys = () =>{
        setPrivateKey(null);
        setPublicKey(null);
    }

    const exportPrivateKey = async () => {
        if(!privateKey) return;
        try {
            const exported = await window.crypto.subtle.exportKey("pkcs8",privateKey);
            const exportedKeyBuffer = new Uint8Array(exported);
            const base64Key = arrayBufferToBase64(exportedKeyBuffer);
            const pemKey = `-----BEGIN PRIVATE KEY-----\n${base64Key}\n-----END PRIVATE KEY-----`;
            return pemKey;
        } catch (error) {
            console.error(error);
        }
    }

    const importKey = async (arrayBuffer) => {
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
        return privateKey;
      };
      

    const value = {
        generateKeys,
        deleteKeys,
        privateKey,
        publicKey,
        exportPrivateKey,
        importKey,
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