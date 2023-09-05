import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useExtension } from "../../contexts/ExtensionContext";
import { getUser } from "../../utilities/services/user-service";

export default function ExtensionAuthBridge(){
    const {jwt} = useAuth();
    const {setCurrentUser} = useExtension();
    useEffect(()=>{
        setCurrentUser(getUser());
    },[jwt]);

    return <></>;
}