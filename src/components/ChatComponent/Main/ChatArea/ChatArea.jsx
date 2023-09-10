import { useEffect, useState } from 'react';
import { useSocket } from '../../../../contexts/SocketContext';
import './ChatArea.css';
import ChatAreaInput from './ChatInputArea';
import ChatHistoryPane from './ChatHistoryPane';

export default function ChatArea({ activeChat }) {
    const [username, setUsername] = useState('');
    const { allContacts } = useSocket();

    useEffect(() => {
        setUsername(allContacts.find(el => el.contact._id === activeChat).contact.username);
    }, [activeChat, allContacts]);
    return (
        <div className='chat-container'>
            <ChatHistoryPane />
            <ChatAreaInput />
        </div>
    );
}