import { Route, Routes } from "react-router-dom";
import Home from "./Home/Home";
import AuthPage from "./AuthPage/AuthPage";
import ChatPage from "./ChatPage/ChatPage";
import WelcomeHeader from "../components/WelcomeHeader/WelcomeHeader";
import { useAuth } from "../contexts/AuthContext";
import { getUser } from "../utilities/services/user-service";
import ExtensionAuthBridge from "../components/ExtensionAuthBridge/ExtensionAuthBridge";
import { useCrypto } from "../contexts/CryptoContext";
import { useEffect } from "react";
import { base64ToArrayBuffer } from "../utilities/utils";
import { getPublicKey } from "../utilities/api/users-api";
export default function App() {
    const { jwt } = useAuth();
    const { importPublicKey, publicKey } = useCrypto();
    /** If the jwt has a hasPublicKey flag, retrieve it and import it */
    const setPublicKey = async () =>{
        const key = await getPublicKey();
        if(key && key.publicKey){
            const header = "-----BEGIN PUBLIC KEY-----";
            const footer = "-----END PUBLIC KEY-----";
            importPublicKey(base64ToArrayBuffer(key.publicKey.replace(header, "").replace(footer, "").replace(/\s+/g, "")));
        }
    }
    useEffect(() => {
        const user = getUser();
        if (user && user.hasPublicKey) {
            setPublicKey();
        }
    }, [jwt]);
    return (
        <>
            {jwt && <WelcomeHeader username={getUser().username} />}
            <ExtensionAuthBridge />
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<AuthPage />} />
                <Route path='/signup' element={<AuthPage />} />
                {jwt && publicKey &&
                    <Route path='/chat' element={<ChatPage />} />
                }
                <Route path='/*' element={<Home />} />
            </Routes>
        </>
    );
}