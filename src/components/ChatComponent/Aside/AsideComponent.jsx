import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../../../contexts/SocketContext";
import './AsideComponent.css';
import ChatSessions from "./ChatSessions";
import FriendsComponent from "./FriendsComponent";
import ErrorToast from "../ErrorToast";
import WelcomeHeader from "../../WelcomeHeader/WelcomeHeader";
import { getUser } from "../../../utilities/services/user-service";
import { useLogout } from "../../../contexts/LogoutContext";
import ConnectionIndicator from "../Main/ConnectionIndicator";

export default function AsideComponent({ fullscreen, active, onSelect, switchToChat, onSwitchedToChat, clearSelection, onClearedSelection, onTabSwitched }) {
    const [activeTab, setActiveTab] = useState('chats');
    const [error, setError] = useState('');
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState('');
    const [notifications, setNotifications] = useState({ messages: false, friends: false });
    const asideComponent = useRef(null);
    const { allContacts, friendRequestError, resetFriendRequestError, clearEmptySessions, sessionsCache } = useSocket();
    const logout = useLogout();
    const settingsIconRef = useRef(null);
    const dropdownRef = useRef(null);

    const handleSelectChat = (id) => {
        setSelectedChat('');
        onSelect(id);
    }

    useEffect(() => {
        if (!asideComponent.current) return;
        if (fullscreen) {
            asideComponent.current.classList.add('w-100');
            asideComponent.current.classList.remove('min-width-350');
        } else {
            asideComponent.current.classList.remove('w-100');
            asideComponent.current.classList.add('min-width-350');
        }
    }, [fullscreen]);

    /** Tabs Switched */
    const handleTabSwitch = (tab) => {
        if (tab === activeTab) return;
        setActiveTab(tab);
        clearEmptySessions();
        onTabSwitched();
    }

    /** Switch to Chat */
    useEffect(() => {
        if (!switchToChat) return;
        if (switchToChat) {
            setActiveTab('chats');
            setSelectedChat(switchToChat);
        }
        onSelect(switchToChat)
        onSwitchedToChat(switchToChat);
    }, [switchToChat, onSwitchedToChat, onSelect]);


    /** Error display */
    const showError = useCallback((error) => {
        setError(error);
        setTimeout(() => {
            setError('');
            resetFriendRequestError();
        }, 5000);
    }, []);


    useEffect(() => {
        if (!friendRequestError) return;
        showError(friendRequestError);
    }, [friendRequestError, showError]);


    /** Dropdown */
    const toggleDropdown = () => {
        setDropdownVisible(prevVisible => !prevVisible);
    };

    useEffect(() => {

        const setPosition = () => {
            if (settingsIconRef.current && dropdownRef.current && isDropdownVisible) {
                const rect = settingsIconRef.current.getBoundingClientRect();
                dropdownRef.current.style.left = `${rect.left}px`;
                dropdownRef.current.style.top = `${rect.bottom}px`;
            }
        };

        window.addEventListener('resize', setPosition);
        setPosition();

        return () => {
            window.removeEventListener('resize', setPosition);
        };
    }, [isDropdownVisible]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (settingsIconRef.current && dropdownRef.current) {
                if (
                    !settingsIconRef.current.contains(event.target) &&
                    !dropdownRef.current.contains(event.target)
                ) {
                    setDropdownVisible(false);
                }
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, []);


    const showMsg = Object.values(sessionsCache).some(el => el.unreadCount);

    const newFrd = allContacts.some(el => el.friendRequest.direction === 'received' && el.friendRequest.status === 'pending');


    return (
        <aside className={`aside-component ${fullscreen && !active ? 'd-none' : fullscreen && active ? 'w-100' : ''}`} ref={asideComponent}>
            <div className="top-bar">
                <div className="user-profile">
                    <img src="user-filled-white.svg" alt="User" className="profile-pic" />
                    <span className="status-icon"></span>
                </div>
                <div className="connection-indicator-container"><WelcomeHeader noWelcome={true} username={getUser().username} position="relative" /><ConnectionIndicator /></div>

                <i className="settings-icon" ref={settingsIconRef} onClick={toggleDropdown}></i>
            </div>
            {(isDropdownVisible &&
                <div className={`dropdown dark-theme ${isDropdownVisible ? '' : 'invisible'}`} ref={dropdownRef}>
                    {/* <div onClick={()=>alert('profile')} className="dropdown-item">Profile</div> */}
                    <div onClick={logout} className="dropdown-item">Logout</div>
                </div>
            )}
            <div className="tab-selector">
                <button
                    className={`tab ${activeTab === 'chats' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('chats')}
                >
                    <span>Chats</span><span className={`notification-circle ${!showMsg ? 'invisible' : ''}`}></span>
                </button>
                <button
                    className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('friends')}
                >
                    <span>Friends</span><span className={`notification-circle ${!newFrd ? 'invisible' : ''}`}></span>
                </button>
            </div>

            <div className="dynamic-component">
                {activeTab === 'chats' ? (
                    <div className="chats-component">
                        <ChatSessions
                            onSelectChat={handleSelectChat}
                            friends={allContacts}
                            selectChat={selectedChat}
                            clearSelection={clearSelection}
                            onClearedSelection={onClearedSelection}
                        />
                    </div>
                ) : (
                    <div className="friends-component">
                        <FriendsComponent
                            onSelectFriend={onSelect}
                        />
                    </div>
                )}
            </div>
            <ErrorToast error={error} />
        </aside>
    );

}