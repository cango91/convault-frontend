import { useEffect, useState } from 'react'
import './LocalStorageForm.css'
import { glitch, setClassWithDelay } from '../../utilities/utils';

export default function LocalStorageForm({ finalizeSignup }) {
    const [optIn, setOptIn] = useState(false);
    const [stage, setStage] = useState('info');
    const [containerClass, setContainerClass] = useState('mnemonics-container invisible');
    const [importantClass, setImportantClass] = useState('mnemonics-info__h1');
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass, 'mnemonics-container'));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 1000));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 2500));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 5050));
        return () => timeouts.forEach(t => clearTimeout(t));
    },[]);

    return (
        <div className={containerClass}>
            {stage === 'info' ?
                <>            
                <h1 className='glow mnemonics-info__h1' style={{ textAlign: 'center' }}><span className={importantClass}>IMPORTANT:</span><br />LOCAL STORAGE OPT-IN</h1>
                    <div className="mnemonics-info__text">
                        <p style={{ cursor: 'default' }} title="How it works: You choose a passphrase, which will be used as seed to encrypt your mnemonics-derived private key in your browser's local storage"><span className='glow'>Never lose your mnemonics</span><br />
                            You have to enter them every time you use the application in order to decrypt your existing chats! <br />
                            <span className='glow'>Unless</span> you opt-in for <span className='error-text'>locally storing your</span> mnemonics-derived <span className="error-text">private key.</span><br /><span className='error-text glow-danger'>Note:</span> <br />
                            <span className='error-text'><small>Storing your private key in an <span className="glow-danger">unsafe environment</span>, such as your web browser's local storage, is a big security and privacy concern. Make sure you <span className="glow-danger">understand the security implications.</span> If you opt-in for local storage, you should choose a <span className="glow-danger">very strong passphrase,</span> which will be asked of you <span className='glow-danger'>instead of your mnemonics</span> in order to decrypt your chats.</small></span></p><p><span className="glow"> Also note:</span> <small>There is no way to recover your passphrase; however you can reset it as long as you have your mnemonics saved</small></p>
                    </div>
                    <div className="controls" style={{ flexDirection: 'column' }}>
                        <button className="login-btn">Don't Store My Private Key in Browser</button>
                        <button className='login-btn btn-danger'>Encrypt and Store My Private Key in Local Storage</button>
                    </div>
                </>
                :
                <>
                </>
            }
        </div>
    );
}