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
    const generateMnemonic = (strength = 128) => {
        const newMnemonic = bip39.generateMnemonic(wordlist, strength).split(' ');
        setMnemonic(newMnemonic);
    };
    const validateMnemonic = (mn) => bip39.validateMnemonic(mn, wordlist);
    const resetMnemonic = () => setMnemonic([]);
    return (
        <CryptoContext.Provider value={{ mnemonic, generateMnemonic, validateMnemonic, resetMnemonic }}>
            {children}
        </CryptoContext.Provider>
    );
}