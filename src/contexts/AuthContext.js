import { createContext, useState, useContext,useEffect } from "react";
import { getAccessToken, getUser } from "../utilities/services/user-service";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [jwt, setJwt] = useState(null);
    const [hasPublicKey, setHasPublicKey] = useState(false);
    useEffect(()=>{
        const token = getAccessToken();
        if(token){
            setJwt(token);
            const user = getUser();
            if(user.publicKey){
                setHasPublicKey(true);
            }
        }
    },[]);
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