import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SignupForm from "../SignupForm/SignupForm";
import MnemonicsComponent from "../MnemonicsComponent/MnemonicsComponent";
import LogoutButton from "../LogoutButton/LogoutButton";
import LocalStorageForm from "../LocalStorageForm/LocalStorageForm";
import ThreeTierSecurityForm from "../ThreeTierSecurityForm/ThreeTierSecurityForm";
import { useExtension } from "../../contexts/ExtensionContext";
import KeyGen from "../KeyGen/KeyGen";
import { refreshUser } from "../../utilities/api/users-api";

export default function SignupComponent({ setInPage }) {
    const [signupStage, setSignupStage] = useState('signup');
    // const [mnemonicConfirmed, setMnemonicConfirmed] = useState(false);
    const { jwt, hasPublicKey } = useAuth();
    const navigate = useNavigate();
    useEffect(()=>{
        async function ref(){
            await refreshUser();
        }
        ref();
    },[]);
    useEffect(() => {
        if(!jwt){
            setSignupStage('signup');
        }else if(jwt && !hasPublicKey){
            setSignupStage('generation');
        }else if(jwt && hasPublicKey){
            navigate('/chat');
        }
    }, [jwt, hasPublicKey, navigate]);

    // useEffect(() => {
    //     if (!jwt) {
    //         setSignupStage('signup');
    //     } else if (jwt && !hasPublicKey && !mnemonicConfirmed) {
    //         setSignupStage('mnemonic_generation');
    //     } else if (jwt && !hasPublicKey && mnemonicConfirmed) {
    //         setSignupStage('local_storage_option');
    //     } else if (jwt && hasPublicKey) {
    //         navigate('/chat');
    //     }
    // }, [jwt, hasPublicKey, mnemonicConfirmed, navigate]);

    // const registerPublicKey = async () => {

    // }


    let stageElement = null;
    switch(signupStage){
        case 'signup':
            stageElement = <SignupForm setInPage={setInPage} />
            break;
        case 'generation':
            stageElement = <KeyGen />;
            break;
        default:
            stageElement = <SignupForm setInPage={setInPage} />
            break;
    }
    // switch (signupStage) {
    //     case 'signup':
    //         stageElement = <SignupForm setInPage={setInPage} />
    //         break;
    //     case 'mnemonic_generation':
    //         stageElement = <ThreeTierSecurityForm />
    //         // stageElement = <MnemonicsComponent onMnemonicsConfirmed={() => setMnemonicConfirmed(true)} />
    //         break;
    //     case 'local_storage_option':
    //         stageElement = <LocalStorageForm finalizeSignup={registerPublicKey} />
    //         break;
    //     default:
    //         stageElement = <SignupForm setInPage={setInPage} />
    //         break;
    // }

    return (
        <>
            {jwt ? <LogoutButton /> : ''}
            {stageElement}
        </>
    );
}