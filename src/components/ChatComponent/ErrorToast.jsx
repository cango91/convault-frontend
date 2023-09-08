import { useEffect, useState } from 'react';
import './ErrorToast.css';
import { glitch } from '../../utilities/utils';

export default function ErrorToast({ error }) {
    const [errorState, setErrorState] = useState(false);
    const [errorTextClass, setErrorTextClass] = useState('error-text');

    useEffect(() => {
        const timeouts = [];
        if (!errorState) return;
        if (errorState) {
            timeouts.push(glitch('error-text', setErrorTextClass));
            timeouts.push(setTimeout(() => timeouts.push(glitch('error-text', setErrorTextClass)), 1000));
            timeouts.push(setTimeout(() => timeouts.push(glitch('error-text', setErrorTextClass)), 1500));
            timeouts.push(setTimeout(()=>setErrorState(false),3000));
        }
        return () => {
            timeouts.forEach(t => clearTimeout(t));
        }
    }, [errorState]);

    useEffect(() => {
        if (error) {
            setErrorState(true);
        } else {
            setErrorState(false);
        }
    }, [error]);

    return (
        <div className={`error-toast transition-fast ${errorState ? '' : 'invisible slide-from-below'}`}>
            <span className={errorTextClass}><strong>ERROR</strong></span><br /><span className='error-text'>{error}</span>
        </div>
    );
}