import { createContext, useState, useContext } from "react";
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

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
    const value = {
        generateKeys,
        privateKey,
        publicKey,
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