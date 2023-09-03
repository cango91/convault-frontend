import { useEffect, useState, useRef } from "react";
import { useCrypto } from "../../contexts/CryptoContext";
import './MnemonicsGrid.css';
import { glitch, setClassWithDelay } from "../../utilities/utils";

export default function MnemonicsGrid({ mode, onNext }) {
    const [nextBtnClass, setNextBtnClass] = useState('login-btn mnemonics-next-btn invisible');
    const [containerClass, setContainerClass] = useState("mnemonics-container invisible");
    const [restartBtnClass, setRestartBtnClass] = useState('login-btn mnemonics-next-btn btn-danger d-none');
    const [instructionTxtClass, setInstructionTxtClass] = useState("glow instruction-text");
    const [nextBtnText, setNextBtnText] = useState('Next');
    const [instructionText, setInstructionText] = useState('');
    const [disabled, setDisabled] = useState(false);
    const [allWordsEntered, setAllWordsEntered] = useState(false);
    const { mnemonic, generateMnemonic, resetMnemonic } = useCrypto();
    const inputsRef = useRef([]);
    const removeIdxRef = useRef(new Set());

    useEffect(() => {
        if (mode === 'newSession') {
            inputsRef.current[0].focus();
        }
        if (mode === 'generation' && !mnemonic.length) {
            generateMnemonic();
        }
        if (mode === 'confirmation') {
            removeIdxRef.current = new Set();
            while (removeIdxRef.current.size < 3) {
                removeIdxRef.current.add(Math.ceil(Math.random() * 11));
            }
        }
    }, [mnemonic, mode, generateMnemonic]);
    useEffect(() => {
        const timeouts = [];
        timeouts.push(setClassWithDelay(setContainerClass, 'mnemonics-container'));
        return () => timeouts.forEach(t => clearTimeout(t));
    }, []);
    useEffect(() => {
        const timers = [];
        if (mode === 'generation') {
            timers.push(setClassWithDelay(setNextBtnClass, 'login-btn mnemonics-next-btn', 1500));
            setNextBtnText('Next');
            setInstructionText('NOTE THESE DOWN');
        } else if (mode === 'confirmation') {
            setNextBtnText('Confirm');
            setInstructionText('ENTER THE MISSING WORDS FROM YOUR NOTES');
        }
        return () => timers.forEach(t => clearTimeout(t));
    }, [mode]);

    useEffect(() => {
        setDisabled((mode === 'confirmation' || mode === 'newSession') && !allWordsEntered)
    }, [allWordsEntered, mode]);

    const handleNext = () => {
        if (mode === 'generation') {
            setContainerClass('mnemonics-container invisible');
            setTimeout(() => {
                setTimeout(() => setContainerClass('mnemonics-container'), 500);
                return onNext();
            }, 500);
        }
        if (mode === 'confirmation') {
            const confirmed = confirmMnemonics();
            if (confirmed) {
                setContainerClass('mnemonics-container invisible');
                setTimeout(() => onNext(true), 500);
            } else {
                setRestartBtnClass('login-btn mnemonics-next-btn btn-danger invisible');
                setClassWithDelay(setRestartBtnClass, 'login-btn mnemonics-next-btn btn-danger', 10);
                setInstructionText('OOPS... TRY AGAIN, OR RE-GENERATE WORDS');
                glitch("glow-danger instruction-text error-text", setInstructionTxtClass);
                setTimeout(() => glitch("glow-danger instruction-text error-text", setInstructionTxtClass), 1000);
            }
        }
    }

    const handleChange = () => {
        if (mode === 'confirmation' || mode === 'newSession') {
            const inputs = inputsRef.current.filter(el => el !== null);
            setAllWordsEntered(inputs.every(el => el.value));
        }
    }

    const confirmMnemonics = () => {
        for (let i = 0; i < inputsRef.current.length; i++) {
            if (inputsRef.current[i]) {
                if (inputsRef.current[i].value !== mnemonic[i])
                    return false;
            }
        }
        return true;
    }

    const handleRestart = () => {
        resetMnemonic();
        setContainerClass('mnemonics-container invisible');
        setTimeout(() => onNext(false), 500);

    }

    return (
        <div className={containerClass}>
            <div className="mnemonics-grid">
                {Array.from({ length: 12 }, (_, i) => i).map((_, index) => (
                    <div key={index} className="mnemonics-cell">
                        {mode === 'generation' || (mode === 'confirmation' && !removeIdxRef.current.has(index)) ? (
                            <span>{mnemonic[index]}</span>
                        ) : (
                            <input
                                className="mnemonics-input"
                                autoComplete="off"
                                ref={(el) => (inputsRef.current[index] = el)}
                                tabIndex={index + 1}
                                placeholder={mode === 'confirmation' && removeIdxRef.current.has(index) ? '' : mnemonic[index]}
                                onChange={handleChange}
                                autoCapitalize="off"
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={handleNext} disabled={nextBtnClass.endsWith('invisible') || disabled} className={nextBtnClass}>{nextBtnText}</button>
                <button onClick={handleRestart} className={restartBtnClass}>Restart</button>
            </div>
            <p className={instructionTxtClass}>{instructionText}</p>
        </div>
    );
}