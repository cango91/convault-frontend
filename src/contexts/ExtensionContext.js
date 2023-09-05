import { createContext, useContext, useEffect, useState } from "react";

const ExtensionContext = createContext();
const BASE_URL = '/api/extension'
const ALLOWED_ORIGIN = '*';

export function useExtension() {
    const context = useContext(ExtensionContext);
    if (!context) {
        throw new Error('useExtension must be used within an ExtensionProvider');
    }
    return context;
}

export function ExtensionProvider({ children }) {
    const [validIdList, setValidIdList] = useState([]);
    const [hasExtension, setHasExtension] = useState(false);
    const [extensionVersion, setExtensionVersion] = useState(null);
    const [user, setUser] = useState(null);
    const [currentUserHasKeyStored, setCurrentUserHasKeyStored] = useState(false);

    const checkExtension = () => window.postMessage({type: 'VERSION'},ALLOWED_ORIGIN);
    const checkUserStore = (id) => window.postMessage({type: 'QUERY_FOR_USER', id})
    
    useEffect(() => {
        const verifyMessageSource = (evt) => {
            // TODO: Add actual verification when extension deployed.
            return true;
        }
        const fetchIds = async () => {
            try {
                const response = await fetch(BASE_URL);
                if (response.ok) {
                    const json = await response.json();
                    setValidIdList(json);
                } else {
                    throw new Error(await response.body());
                }
                checkExtension();
            } catch (error) {
                console.error("Couldn't fetch extension ids: ", error.message);
            }
        }
        
        const handleMessages = (evt) => {
            if (evt.source !== window || !verifyMessageSource(evt)) return;
            const { type } = evt.data;
            switch (type) {
                case 'VERSION_INFO':
                    setHasExtension(true);
                    setExtensionVersion(evt.data.version);
                    break;
                case 'USER_QUERY':
                    setCurrentUserHasKeyStored(evt.data.inStore);
                    break;
                default:
                    return;
            }
        }

        window.addEventListener('message', handleMessages);
        window.addEventListener('load',fetchIds);

        return () => {
            window.removeEventListener('message', handleMessages);
            window.removeEventListener('load',fetchIds);
        }
    }, []);

    const setCurrentUser = (user) => {
        setUser(user);
        if(user)
            checkUserStore(user._id);
    }

    const value = {
        validIdList,
        checkExtension,
        hasExtension,
        extensionVersion,
        setCurrentUser,
        currentUserHasKeyStored,
    };

    return (
        <ExtensionContext.Provider value={value}>
            {children}
        </ExtensionContext.Provider>
    );
}