import { useEffect, useState } from "react";
import { useExtension } from "../../contexts/ExtensionContext";
import { glitch, setClassWithDelay } from "../../utilities/utils";
import './KeyGenInfo.css';

export default function KeyGenInfo({onUseExtension,onNext}) {
    const [checkingExtension, setCheckingExtension] = useState(true);
    const [importantClass, setImportantClass] = useState('mnemonics-info__h1 glow');
    const [containerClass,setContainerClass] = useState('flex-ctr mb-3 invisible');
    const [btnClass,setBtnClass] = useState('login-btn mb-3 invisible');
    const [browser, setBrowser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const { hasExtension, checkExtension } = useExtension();
    // visuals
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass,'flex-ctr'));
        timeouts.push(setClassWithDelay(setBtnClass,'login-btn mb-3',3000));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 500));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 1500));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 5500));
        timeouts.push(setTimeout(() => glitch(importantClass, setImportantClass), 15500));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);
    // UA check
    useEffect(() => {
        const ua = navigator.userAgent;
        if (/Chrome/.test(ua)) {
            setBrowser('chrome');
        } else if (/Firefox/.test(ua)) {
            setBrowser('firefox');
        }

        if (/Mobi|Android/i.test(ua)) {
            setIsMobile(true);
        }
    }, []);
    // check if extension is installed
    useEffect(() => {
        if (isMobile || !['firefox', 'chrome'].includes(browser)) {
            setCheckingExtension(false);
            return;
        }
        checkExtension();
        if(hasExtension){
            setCheckingExtension(false);
            return;
        }
        const t = setTimeout(() => {
            setCheckingExtension(false);
        }, 1000);
        return () => { if (t) clearTimeout(t); }
    }, [isMobile, browser,hasExtension,checkExtension]);

    const transitionOut = (callback,delay=500) => {
        setContainerClass('flex-ctr invisible');
        setTimeout(callback, delay);
    }

    const extensionLink = browser === 'chrome' ? 'https://chrome.com' : browser === 'firefox' ? 'https://firefox.com' : null;
    return (
        <>
            <div className={containerClass}>
                <h1 className={importantClass} onMouseEnter={() => glitch('mnemonics-info__h1 glow', setImportantClass)}>Important</h1>
                <div className="mnemonics-info__text">
                    <span className="glow">Convault</span> is a <span className="glow">security</span> and <span className="glow">privacy</span> oriented chat application.
                    <br />
                    As such, <span className="error-text glow-danger">we do not store</span> your private keys on our servers.
                    <p>On the next page, you will have to save your private key file. Store this file securely. You will have to provide this file in each new session.</p>
                    <button onClick={()=>transitionOut(onNext)} className={btnClass}>Continue</button>
                    <p><span className="error-text glow-danger">Warning:</span> There is no way to recover your private key if you lose it</p>
                    
                </div>
                {
                    !isMobile && checkingExtension &&
                    <div className="extension-check">
                        <p>Please wait while we check some thing...</p>
                        <div className='spinner'></div>
                    </div>
                }
                {
                    !isMobile && !checkingExtension && !hasExtension && extensionLink &&
                    <div className="mnemonics-info__text">
                        <small>For a more streamlined UX at the cost of decreased security you can install our <a href={extensionLink} target="_blank" rel="noreferrer noopener" className="app-link">browser extension 🧩</a></small>
                    </div>
                }
                {
                    !isMobile && !checkingExtension && hasExtension &&
                    <div className="mnemonics-info__text">
                        <small>You seem to have our extension installed. Click <button className="app-link app-link-normal glow" style={{ fontSize: 'inherit' }} onClick={()=>transitionOut(onUseExtension)}>here</button> to continue with the extension for a more <span className="success-text glow-success">streamlined UX</span> at the cost of <span className="error-text glow-danger"> decreased security</span></small>
                    </div>
                }
            </div>
        </>
    );
}