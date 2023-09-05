import { useEffect } from 'react';
import './PrivKeySetter.css';
import { useExtension } from '../../contexts/ExtensionContext';
import ExtensionMessageBox from './ExtensionMessageBox';
import PrivKeyManual from './PrivKeyManual';

export default function PrivKeySetter(){
    const {currentUserHasKeyStored} = useExtension();
    return (
        <>
       { 
       currentUserHasKeyStored && 
       <div>I will use browser extension</div>
       }
       {
        !currentUserHasKeyStored && 
        <>
        <PrivKeyManual />
        <ExtensionMessageBox />
        </>
       }
        </>
    );
}