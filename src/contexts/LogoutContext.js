import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useCrypto } from "./CryptoContext";
import * as api from '../utilities/api/users-api';

const LogoutContext = createContext();

export const useLogout = () => useContext(LogoutContext);

export function LogoutProvider({ children }) {
    const navigate = useNavigate();
    const { setJwt, setHasPublicKey } = useAuth();
    const { resetMnemonic, deleteKeys } = useCrypto();

    const logout = async () => {
        await api.logout();
        setJwt(null);
        resetMnemonic();
        deleteKeys();
        setHasPublicKey(false);
        navigate('/');
    }

    return (
        <LogoutContext.Provider value={logout}>
            {children}
        </LogoutContext.Provider>
    );
}