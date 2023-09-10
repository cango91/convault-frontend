import { useEffect, useRef } from "react";

export default function ChatAreaInput({recipient}) {
    const input = useRef(null);

    useEffect(() => {
        const textarea = input.current;
        const handleInput = () => {
            textarea.style.height = 'auto';
            let scrollHeight = (textarea.scrollHeight <= 100) ? textarea.scrollHeight : 100;
            textarea.style.height = scrollHeight + 'px';
        };
        textarea.addEventListener('input', handleInput);
        handleInput();
        return () => {
            textarea.removeEventListener('input', handleInput);
        };
    }, []);

    return (
        <div className="chat-input-container">
            <div className="chat-input">
                <textarea ref={input} rows="1" placeholder="Type a message"></textarea>
                <input type="button" value="send" />
            </div>
        </div>
    );
}