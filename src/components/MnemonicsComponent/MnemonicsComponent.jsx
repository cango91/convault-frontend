import { useState,useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCrypto } from '../../contexts/CryptoContext';
import './MnemonicsComponent.css';
import { setClassWithDelay } from '../../utilities/utils';

const MNEMONIC_STAGES = ['info','generation','confirmation'];

export default function MnemonicsComponent(){
    const [test,setTest] = useState('');

    useEffect(()=>{
        const timer = setClassWithDelay(setTest,'test-class',10);
        const timer2 = setClassWithDelay(setTest,'test-class-2',1000);
        return ()=>{
            clearTimeout(timer);
            clearTimeout(timer2);
        }
    },[]);

    return (
        <div className={test}>This is the MnemonicsComponent</div>
    );
}