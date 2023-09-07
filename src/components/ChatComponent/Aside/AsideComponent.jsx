import { useEffect, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import './AsideComponent.css';

export default function AsideComponent({ fullscreen, active }) {
    const [sessions, setSessions] = useState(null);
    const [friends, setFriends] = useState(null);
    const [activeTab, setActiveTab] = useState('chats');
    const { socket } = useSocket();

    useEffect(() => {
        const handleAllSessions = (sessions) => {
            setSessions(sessions);
        }
        const handleAllFriends = (friends) => {
            setFriends(friends);
        }
        socket.on("all-sessions", handleAllSessions);
        socket.on("all-friends", handleAllFriends);


        return () => {
            socket.off("all-sessions", handleAllSessions);
            socket.off("all-friends", handleAllFriends);
        };

    }, []);

    useEffect(() => {
        if (!friends) {
            socket.emit('send-all-friends');
        }
        if (!sessions) {
            socket.emit('send-all-sessions');
        }
    }, [friends, sessions]);

    return (
        <aside className="aside-component">
            <div className="top-bar">
                <div className="user-profile">
                    <img src="user-filled-white.svg" alt="User" className="profile-pic" />
                    <span className="status-icon"></span>
                </div>
           
                    <i className="settings-icon"></i>
               
            </div>

            <div className="tab-selector">
                <button
                    className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chats')}
                >
                    Chats
                </button>
                <button
                    className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Friends
                </button>
            </div>

            <div className="dynamic-component">
                {activeTab === 'chats' ? (
                    <div className="chats-component">Chats Component</div>
                ) : (
                    <div className="friends-component">Friends Component</div>
                )}
            </div>
        </aside>
    );

}