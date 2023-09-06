import { createContext, useState, useContext, useEffect } from "react";
import { getAccessToken, getUser } from "../utilities/services/user-service";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [jwt, setJwt] = useState(null);
    const [hasPublicKey, setHasPublicKey] = useState(false);
    const refreshUserToken = async () => {
        const token = getAccessToken();
        if (token) {
            setJwt(token);
            const user = getUser();
            if (user.hasPublicKey) {
                setHasPublicKey(true);
            }
        }
    }
    useEffect(() => {
        refreshUserToken();
    }, []);
    const value = {
        jwt,
        hasPublicKey,
        setJwt,
        setHasPublicKey,
        refreshUserToken,
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}