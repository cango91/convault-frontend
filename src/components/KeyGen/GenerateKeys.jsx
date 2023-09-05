import { useEffect, useState } from "react"
import { setClassWithDelay } from "../../utilities/utils";
import { useCrypto } from "../../contexts/CryptoContext";



export default function GenerateKeys({onCompleteSignup}) {
    const [containerClass, setContainerClass] = useState('flex-ctr invisible');
    const [nextBtnClass, setNextBtnClass] = useState('login-btn invisible');
    const [pemKey, setPemKey] = useState('');
    const { generateKeys, privateKey, exportPrivateKey } = useCrypto();
    // visuals
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass, 'flex-ctr'));

        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);
    // Generate key pair
    useEffect(() => {
        async function getKeys() {
            await generateKeys();
            return privateKey;
        }
        getKeys()
            .then(() => {
                exportPrivateKey()
                    .then((pemKey) => {
                        setPemKey(pemKey);
                    })
                    .catch(e => console.error(e));
            })
            .catch(e => console.error(e));
    }, [privateKey, generateKeys, exportPrivateKey]);

    const downloadPem = () => {
        const blob = new Blob([pemKey], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a");
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "private_key.pem";
        a.click();
        window.URL.revokeObjectURL(url);
        setClassWithDelay(setNextBtnClass,'login-btn',500);
    }

    return (
        <div className={containerClass}>
            <h1 className="mnemonics-info__h1 glow">Key Generation</h1>
            {
                !pemKey &&
                <div className="please-wait">
                    <p>Please wait while your keys are being generated...</p>
                    <div className="spinner"></div>
                </div>
            }
            {
                pemKey &&
                <div className="download-section">
                    <p>Your public and private key pairs have been generated.<br /><button className="app-link app-link-normal glow-success" onClick={downloadPem}>Click to save</button> your private key file.<br /><span className="glow">Store it safely.</span></p>
                    <button className={nextBtnClass} onClick={onCompleteSignup}>Complete Signup</button>
                </div>
            }
        </div>
    );
}