import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import './AsideComponent.css';
import { refreshUserTk } from "../../../utilities/services/user-service";
import ChatSessions from "./ChatSessions";
import FriendsComponent from "./FriendsComponent";
import ErrorToast from "../ErrorToast";

export default function AsideComponent({ fullscreen, active }) {
    const [sessions, setSessions] = useState(null);
    //const [friends, setFriends] = useState(null);
    const [activeTab, setActiveTab] = useState('chats');
    const [error, setError] = useState('');
    const asideComponent = useRef(null);
    const { allContacts, friendRequestError ,resetFriendRequestError } = useSocket();

    useEffect(() => {
        if (!asideComponent.current) return;
        if (fullscreen) {
            asideComponent.current.classList.add('w-100');
            asideComponent.current.classList.remove('min-width-275');
        } else {
            asideComponent.current.classList.remove('w-100');
            asideComponent.current.classList.add('min-width-275');
        }
    }, [fullscreen]);

    const showError = (error) => {
        setError(error);
        setTimeout(() => {
            setError('');
            resetFriendRequestError();
        }, 3000);
    }

    useEffect(() => {
        if (!friendRequestError) return;
        showError(friendRequestError);
    }, [friendRequestError]);



    return (
        <aside className="aside-component" ref={asideComponent}>
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
                    <div className="chats-component">
                        <ChatSessions friends={allContacts} sessions={sessions} />
                    </div>
                ) : (
                    <div className="friends-component">
                        <FriendsComponent friends={allContacts} />
                    </div>
                )}
            </div>
            <ErrorToast error={error} />
        </aside>
    );

}