import { useEffect, useRef, useState } from "react";
import { socket } from "../../../../socket";

export default function ChatAreaInput({ recipient }) {
    const [msgText, setMsgText] = useState('');
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

    const handleChange = e => {
        setMsgText(e.target.value);
    }

    const onSubmit = e => {
        e.preventDefault();
        socket.emit('send-message', { recipient, content: msgText });
        setMsgText('');
    }

    const handleKeyDown = e => {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 13 && msgText) onSubmit(e);
    }

    return (
        <div className="chat-input-container">
            <div className="chat-input">
                <form onSubmit={onSubmit}>
                    <textarea
                        ref={input}
                        rows="1"
                        name="message"
                        placeholder="Type a message"
                        onChange={handleChange}
                        value={msgText}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                    <input type="submit" value="send" />
                </form>
            </div>
        </div>
    );
}