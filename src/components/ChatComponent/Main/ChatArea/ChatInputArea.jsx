import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../../../../socket";
import { useCrypto } from "../../../../contexts/CryptoContext";
import { useSocket } from "../../../../contexts/SocketContext";

export default function ChatAreaInput({ recipient }) {
    const [msgText, setMsgText] = useState('');
    const input = useRef(null);
    const { encryptAESGCM, generateSymmetricKeyForSession } = useCrypto();
    const { allContacts } = useSocket();

    const encryptMessage = useCallback(async (content, recipientId) => {
        try {
            const pk = allContacts.find(c => c.contact._id === recipientId).contact.publicKey;
            const { aesKey, encryptedAesKey } = await generateSymmetricKeyForSession(recipientId, pk);
            const encryptedContent = await encryptAESGCM(content, aesKey);
            return {
                encryptedContent ,
                symmetricKey: encryptedAesKey
            };
        } catch (error) {
            console.error(error);
        }
    }, [allContacts, encryptAESGCM, generateSymmetricKeyForSession]);

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

    const onSubmit = async e => {
        e.preventDefault();
        // socket.emit('send-message', { recipient, content: msgText });
        const { encryptedContent, symmetricKey } = await encryptMessage(msgText, recipient);
        socket.emit('send-encrypted', { recipient, encryptedContent, symmetricKey });
        setMsgText('');
    }

    const handleKeyDown = e => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) {

        } else if (e.keyCode === 13 && msgText) {
            e.preventDefault();
            onSubmit(e);
        }
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