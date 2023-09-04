import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCrypto } from "../../contexts/CryptoContext";
import { useExtension } from "../../contexts/ExtensionContext";
import { glitch } from "../../utilities/utils";
import './KeyGen.css';

export default function KeyGen() {
    const [checkingExtension, setCheckingExtension] = useState(true);
    const [importantClass, setImportantClass] = useState('mnemonics-info__h1 glow');
    const [browser, setBrowser] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const { generateKeys } = useCrypto();
    const { extensionMode, setExtensionMode } = useState(false);
    const { hasExtension, checkExtension } = useExtension();
    // visuals
    useEffect(() => {
        const timeouts = [];
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

        const t = setTimeout(() => {
            setCheckingExtension(false);
        }, 1000);
        return () => { if (t) clearTimeout(t); }
    }, [isMobile, browser]);

    const extensionLink = browser === 'chrome' ? 'https://chrome.com' : browser === 'firefox' ? 'https://firefox.com' : null;
    return (
        <>
            <div className="mnemonics-container">
                <h1 className={importantClass} onMouseEnter={() => glitch(importantClass, setImportantClass)}>Important</h1>
                <div className="mnemonics-info__text">
                    <span className="glow">Convault</span> is a <span className="glow">security</span> and <span className="glow">privacy</span> oriented chat application.
                    <br />
                    As such, <span className="error-text glow-danger">we do not store</span> your private keys on our servers.
                    <p>On the next page, you will have to save your private key file. Store this file securely. You will have to provide this file (or its contents) in each new session.</p>
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
                        <small>You seem to have our extension installed. Click <a className="app-link glow" href="#!" style={{ fontSize: 'inherit' }}>here</a> to continue with the extension for a more <span className="success-text glow-success">streamlined UX</span> at the cost of <span className="error-text glow-danger"> decreased security</span></small>
                    </div>
                }
            </div>
        </>
    );
}