import { useEffect, useState } from "react";
import { base64ToArrayBuffer, setClassWithDelay } from "../../utilities/utils";
import { useCrypto } from "../../contexts/CryptoContext";
import { getUser, refreshUserTk } from "../../utilities/services/user-service";
import WelcomeHeader from "../WelcomeHeader/WelcomeHeader";
import LogoutButton from "../LogoutButton/LogoutButton";
export default function PrivKeyManual() {
    const [isMobile, setIsMobile] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [errorClass, setErrorClass] = useState('error-text invisible');
    const { importPrivateKey } = useCrypto();

    // visual fx
    const glitchError = () => {
        setErrorClass('error-text glitch');
        setTimeout(() => setErrorClass('error-text'), 200);
    }

    const showError = () => {
        setErrorClass('error-text');
        glitchError();
        setTimeout(glitchError, 1000);
        setTimeout(glitchError, 2500);
        setClassWithDelay(setErrorClass, 'error-text invisible', 3000);
    }

    const handlePEMFile = (file) => {
        const reader = new FileReader();
        reader.onload = async (evt) => {
            let content = evt.target.result;
            if (typeof (content) === 'string' && content.startsWith('-----BEGIN')) {
                const header = "-----BEGIN PRIVATE KEY-----";
                const footer = "-----END PRIVATE KEY-----";
                content = content.replace(header,"").replace(footer,"").replace(/\s+/g,"");
                const arrayBuffer = base64ToArrayBuffer(content);
                try {
                    await importPrivateKey(arrayBuffer);
                    await refreshUserTk();
                } catch (error) {
                    console.error(error);
                    showError();
                }
            } else {
                showError();
            }
        };
        reader.readAsText(file);
    }

    useEffect(() => {
        const ua = navigator.userAgent;
        if (/Mobi|Android/i.test(ua)) {
            setIsMobile(true);
        }
        const handleDrop = (e) => {
            // handle file drop
            e.preventDefault();
            setShowOverlay(false);
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.pem')) {
                handlePEMFile(file);
            } else {
                showError();
            }
        };
        const handleDragOver = (e) => {
            e.preventDefault();
            setShowOverlay(true);
        };
        const handleDragLeave = (e) => {
            e.preventDefault();
            // remove highlight from dropzone
            setShowOverlay(false);
        };
        const handleDragEnter = (e) => {
            e.preventDefault();
            // higlight dropzone
            setShowOverlay(true);

        }

        window.addEventListener('drop', handleDrop);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragenter', handleDragEnter);

        return () => {
            window.removeEventListener('drop', handleDrop);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragenter', handleDragEnter);
        };
    }, []);

    return (
        <>
        <LogoutButton />
        <WelcomeHeader username={getUser().username} />
            <div className="flex-ctr">
                {
                    <div className="upload-key">
                        Upload your private key (.pem file you stored before)
                        <form className="upload-key">
                            <label htmlFor="file" className="login-btn">Choose File</label>
                            <input onChange={(e) => handlePEMFile(e.target.files[0])} accept=".pem" type="file" className="file-input" name="file-input" id="file" />
                            <div className={`drop-zone ${showOverlay ? '' : 'invisible'}`}></div>
                        </form>
                    </div>
                }
                {!isMobile &&
                    <>
                        <div className="drag-drop-msg">
                            Or drag & drop anywhere on the screen.
                        </div>
                        <div>
                            <span className={errorClass}>Invalid key file!</span>
                        </div>
                    </>
                }

            </div>
        </>
    );
}