import { useState } from "react";
import KeyGenInfo from "./KeyGenInfo";
import GenerateKeys from "./GenerateKeys";
import PostPublicKey from "./PostPublicKey";

export default function KeyGen(){
    const [stage,setStage] = useState('info');
    

    const onNext = () => setStage('generateKeys');
    const onUseExtension = () => setStage('useExtension');
    const onCompleteSignup = () => setStage('completeSignup');


    return (
        <>
        {
            stage==='info' && 
            <KeyGenInfo onNext={onNext} onUseExtension={onUseExtension} />
        }
        {
            stage === 'generateKeys' &&
            <GenerateKeys onCompleteSignup={onCompleteSignup} />
        }
        {
            stage === 'completeSignup' &&
            <PostPublicKey />
        }
        </>
    );
}