import { useEffect, useState } from "react";
import { setClassWithDelay, glitch } from "../../utilities/utils";

export default function MnemonicsInfoComponent({onNext}){
    const [importantClass, setImportantClass] = useState('');
    const [twWordsClass, setTwWordsClass] = useState('');
    const [dangerClass,setDangerClass] = useState('');
    const [respClass,setRespClass] = useState('');
    const [btnClass, setBtnClass] = useState('login-btn invisible');
    const [containerClass, setContainerClass] = useState('mnemonics-container invisible');

    useEffect(() => {
        const timeouts = [];
        glitch('', setImportantClass);
        timeouts.push(setClassWithDelay(setContainerClass, 'mnemonics-container'));
        timeouts.push(setTimeout(() => glitch('', setTwWordsClass), 300));
        timeouts.push(setTimeout(() => glitch('', setImportantClass), 500));
        timeouts.push(setTimeout(() => glitch('', setTwWordsClass), 1100));
        timeouts.push(setTimeout(() => glitch('', setImportantClass), 1500));
        timeouts.push(setTimeout(() => glitch('', setImportantClass), 3500));
        timeouts.push(setTimeout(() => glitch('', setTwWordsClass), 5000));
        timeouts.push(setTimeout(() => glitch('login-btn', setBtnClass), 2050));
        timeouts.push(setTimeout(() => glitch('', setDangerClass), 5200));
        timeouts.push(setTimeout(() => glitch('', setDangerClass), 7500));
        timeouts.push(setTimeout(() => glitch('', setImportantClass), 10000));
        timeouts.push(setTimeout(() => glitch('', setRespClass), 10500));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);

    const handleClick = () =>{
        setContainerClass('mnemonics-container invisible');
        setTimeout(onNext,1000);
    }



    return (
        <div className={containerClass}>
            <h1 className={importantClass + ' glow'}>IMPORTANT</h1>
            <div className="mnemonics-info__text"><span className="glow">On the next page, you will see <span className={twWordsClass}>12 words.</span> You must note these down.</span> Those 12 words will be used to secure your <span className="glow">private key</span> in your web browser's local-storage, and if you loose them, <span className={dangerClass + ' glow'}>we have no way to recover</span> your encrypted messages. <span className={respClass + ' glow'}>Your private key is solely your responsibility!</span></div>
            <button onClick={handleClick} disabled={btnClass.endsWith('invisible')} className={btnClass}>Continue</button>
        </div>
    );
}