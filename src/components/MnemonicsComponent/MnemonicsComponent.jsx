import { useState, useEffect } from 'react';
import MnemonicsInfoComponent from './MnemonicsInfoComponent';
import './MnemonicsComponent.css';
import MnemonicsGrid from './MnemonicsGrid';


export default function MnemonicsComponent({ onMnemonicsConfirmed }) {
    const [stage, setStage] = useState('info');
    const [subComponent, setSubComponent] = useState(null);

    useEffect(()=>{
        const infoNext = () => {
            setStage('generation');
        }
        const genNext = () => {
            setStage('confirmation');
        }
        const confirmNext = (val) =>{
            if(val && val===true)
                return confirmationSuccess();
            return confirmationFail();
        }
        const confirmationFail = () => {
            setStage('info');
        }
        const confirmationSuccess = () => {
            onMnemonicsConfirmed();
        }
        switch (stage) {
            case 'info':
                setSubComponent(<MnemonicsInfoComponent onNext={infoNext} />);
                break;
            case 'generation':
                setSubComponent(<MnemonicsGrid mode="generation" onNext={genNext} />);
                break;
            case 'confirmation':
                setSubComponent(<MnemonicsGrid mode="confirmation" onNext={confirmNext} />);
                break;
            default:
                setSubComponent(<MnemonicsInfoComponent onNext={infoNext} />);
                break;
        }
    },[stage,onMnemonicsConfirmed]);
    
    return (
        <>
        {subComponent}
        </>

    );
}