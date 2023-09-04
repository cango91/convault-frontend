import { useEffect, useState } from "react"
import { setClassWithDelay } from "../../utilities/utils";
import { useCrypto } from "../../contexts/CryptoContext";
import { useAuth } from "../../contexts/AuthContext";


export default function PostPublicKey() {
    const [containerClass, setContainerClass] = useState('mnemonics-container invisible');
    const { publicKey } = useCrypto();
    const { hasPublicKey } = useAuth();
    // visuals
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass, 'mnemonics-container'));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);

    // post public key
    useEffect(() => {
        if (hasPublicKey) return;

    }, []);
    return (
        <div className={containerClass}>
            <h1 className="mnemonics-info__h1 glow">Finalizing</h1>
            <div className="mnemonics-info__text">
                {!hasPublicKey &&
                    <>
                        <p>Posting your public key, please wait...</p>
                        <div className="spinner"></div>
                    </>
                }
                {
                    hasPublicKey &&
                    <p>All done.</p>
                }
            </div>
        </div>
    );
}