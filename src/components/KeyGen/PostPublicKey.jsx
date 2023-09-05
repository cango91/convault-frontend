import { useEffect, useState } from "react"
import { setClassWithDelay } from "../../utilities/utils";
import { useCrypto } from "../../contexts/CryptoContext";
import { useAuth } from "../../contexts/AuthContext";
import { postPublicKey, refreshUser } from "../../utilities/api/users-api";


export default function PostPublicKey() {
    const [containerClass, setContainerClass] = useState('flex-ctr invisible');
    const [error, setError] = useState('');
    const { exportPublicKey } = useCrypto();
    const { hasPublicKey, refreshUserToken } = useAuth();
    // visuals
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass, 'flex-ctr'));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);

    // post public key
    useEffect(() => {
        if (hasPublicKey) return;
        const postPK = async () => {
            try {
                const payload = { publicKey: await exportPublicKey() }
                const response = await postPublicKey(payload);
                if (!response.message) {
                    setClassWithDelay(setContainerClass, 'flex-ctr invisible');
                    setTimeout(async () => {
                        await refreshUser();
                        refreshUserToken();
                    }, 500);
                } else {
                    setError(response.message);
                }
            } catch (error) {
                setError(error.message)
            }
        }
        //postPK();
        const t = setTimeout(postPK, 0);
        return () => clearTimeout(t);
    }, [hasPublicKey,refreshUserToken,exportPublicKey]);
    return (
        <div className={containerClass}>
            <h1 className="mnemonics-info__h1 glow">Finalizing</h1>
            <div className="mnemonics-info__text">
                {!hasPublicKey && !error &&
                    <>
                        <p>Posting your public key, please wait...</p>
                        <div className="spinner"></div>
                    </>
                }
                {
                    error &&
                    <>
                        <p className="error-text">Oh no! Something went wrong trying to post your public key:<br />{error}</p><p>Try logging out and back in.</p></>
                }
                {
                    hasPublicKey &&
                    <p>All done.</p>
                }
            </div>
        </div>
    );
}