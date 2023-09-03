import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SignupForm from "../SignupForm/SignupForm";
import MnemonicsComponent from "../MnemonicsComponent/MnemonicsComponent";
import LogoutButton from "../LogoutButton/LogoutButton";

export default function SignupComponent({setInPage}){
    const [signupStage, setSignupStage] = useState('signup');
    const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
    const {jwt,hasPublicKey} = useAuth();
    const navigate = useNavigate();
    useEffect(()=>{
        if(!jwt){
            setSignupStage('signup');
        }else if(jwt && !hasPublicKey && !mnemonicConfirmed ){
            setSignupStage('mnemonic_generation');
        }else if(jwt && !hasPublicKey && mnemonicConfirmed){
            setSignupStage('local_storage_option');
        }else if(jwt && hasPublicKey){
            navigate('/chat');
        }
    },[jwt,hasPublicKey,mnemonicConfirmed,navigate]);

    let stageElement = null;
    switch(signupStage){
        case 'signup':
            stageElement = <SignupForm setInPage={setInPage} />
            break;
        case 'mnemonic_generation':
            stageElement = <MnemonicsComponent onMnemonicsConfirmed={()=>setMnemonicConfirmed(true)} />
            break;
        case 'local_storage_option':
            break;
        default:
            stageElement = <SignupForm setInPage={setInPage} />
            break;
    }

    return (
        <>
        {jwt ? <LogoutButton /> : ''}
        {stageElement}
        </>
    );
}