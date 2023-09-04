import { useEffect, useState } from "react";
import { glitch, setClassWithDelay } from "../../utilities/utils";
import './ThreeTierSecurityForm.css';

export default function ThreeTierSecurityForm({ makeChoice }) {
    const [containerClass, setContainerClass] = useState('mnemonics-container invisible');
    const [importantClass, setImportantClass] = useState('three-tier-info__h1');
    const [btnClass, setBtnClass] = useState('mnemonics-container invisible');
    const [selectedTier, setSelectedTier] = useState('Tier 1');

    useEffect(() => {
        const timeouts = [];
        glitch('three-tier-info__h1', setImportantClass);
        timeouts.push(setClassWithDelay(setContainerClass, 'mnemonics-container'));
        timeouts.push(setTimeout(() => glitch('three-tier-info__h1', setImportantClass), 500));
        timeouts.push(setTimeout(() => glitch('three-tier-info__h1', setImportantClass), 2500));
        timeouts.push(setTimeout(() => glitch('three-tier-info__h1', setImportantClass), 5500));
        timeouts.push(setTimeout(() => glitch('three-tier-info__h1', setImportantClass), 12500));
        timeouts.push(setClassWithDelay(setImportantClass, 'three-tier-info__h1 glitch-text'));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, [selectedTier]);

    const selectTier = (tier) => {
        setSelectedTier(tier);

    }
    return (
        <div className={containerClass}>
            <h1 className={importantClass + ' glow'}>IMPORTANT DECISION<br /><small>🔐</small></h1>
            <div className="mnemonics-info__text">
                <p><small>Convault is designed with <span className="glow">security</span> and <span className="glow">privacy</span> in mind. Therefore we <span className="glow-danger error-text">do not</span> store any of your private keys, or information used to derive them on our servers.</small><br />This comes with some burden on your part.</p><p>We offer 3 tiers for security and privacy.<br />Please read each of them carefully, and decide which one you want to move forward with.</p>
            </div>
            <div className="two-column-layout">
                <ul className="tier-list">
                    <li className={selectedTier === 'Tier 1' ? 'selected' : ''} onClick={() => selectTier('Tier 1')}>Tier 1&nbsp;&nbsp;</li>
                    <li className={selectedTier === 'Tier 2' ? 'selected' : ''} onClick={() => selectTier('Tier 2')}>Tier 2<small>🧩</small></li>
                    <li className={selectedTier === 'Tier 3' ? 'selected' : ''} onClick={() => selectTier('Tier 3')}>Tier 3<small>🧩</small></li>
                </ul>
                <div className="tier-content">
                    {selectedTier === 'Tier 1' && (
                        <div>
                            <span className="success-text glow-success">Strongest Security</span>:
                            Your private key will never leave your device. <span className="glow">You are solely responsible for its backup.</span><hr />
                            <span className="glow-danger error-text">Tedious UX</span>:
                            You'll need to upload your private key file every session.
                        </div>
                    )}
                    {selectedTier === 'Tier 2' && (
                        <div>
                            <span className="warning-text glow-warning">Balanced Option</span>:
                            A browser extension securely stores your encrypted private key. <span className="glow">12-word mnemonic required.</span><hr />
                            <span className="glow-warning warning-text">Balanced UX</span>:
                            Extension auto-fills the key for you. You'll need to provide the 12-word mnemonic on every session.<hr />
                            <span className="glow-danger error-text">Note</span>:
                            If the extension is compromised, your key is also at risk.
                        </div>
                    )}
                    {selectedTier === 'Tier 3' && (
                        <div>
                            <span className="error-text glow-danger">Least Secure</span>:
                            A simple passphrase encrypts your private key in the extension.<hr />
                            <span className="success-text glow-success">Best UX</span>:
                            The extension handles everything automatically. You'll need to enter your passphrase on every session.<hr />
                            <span className="glow-danger error-text">Warning</span>:
                            If the extension is compromised, your key is also at risk. Lower security due to the simplicity of the passphrase compared to 128-bit mnemonic.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}