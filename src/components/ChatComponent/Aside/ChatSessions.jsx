import { useEffect, useState } from "react";

export default function ChatSessions({ sessions, friends, onSelectChat }) {
    const [allSessions, setAllsessions] = useState([]);
    const [allFriends, setAllFriends] = useState([]);
    useEffect(() => {
        if (sessions) {
            setAllsessions(sessions);
        }
    }, [sessions]);
    useEffect(() => {
        if (friends) {
            setAllFriends(friends);
        }
    }, [friends]);
    return (
        <div className="chat-sessions-container">
            <div className={`${!allFriends.length && !allSessions.length ? 'invisible' : ''}`}>
                <input
                    type="text"
                    className="login-input search-input"
                    name="filter-sessions"
                />
                <i className="search-input-icon"></i>
            </div>
            <div className="message-list-container" >
                {
                    !!allSessions.length &&
                    allSessions.map(session => <>
                        <div className="message-item" key={session._id}>session</div>
                    </>)
                }
                {
                    !allSessions.length &&
                    <div className="message-item text-center">
                        <p>No chats yet</p>
                        {!allFriends.length && <p><small>Add friends to start chatting</small></p>}
                    </div>
                }
            </div>
        </div>
    );
}