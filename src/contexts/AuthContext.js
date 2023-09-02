import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [jwt, setJwt] = useState(null);
    const [hasPublicKey, setHasPublicKey] = useState(false);
    const value = {
        jwt,
        hasPublicKey,
        setJwt,
        setHasPublicKey
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}