import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FriendCard from './FriendCard';
import { socket } from '../../../socket';
import { useSocket } from '../../../contexts/SocketContext';

export default function FriendsComponent({ onSelectFriend }) {
    // const [allFriends, setAllFriends] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [showInstruction, setShowInstruction] = useState(true);
    // const [friends, setFriends] = useState([]);
    const { allContacts } = useSocket();

    // useEffect(() => {
    //     setFriends(allContacts);
    // }, [allContacts]);

    useEffect(() => {
        if (allContacts.length) {
            setFilteredFriends(allContacts);
        }
    }, [allContacts]);

    useEffect(() => {
        const filtered = allContacts.filter((friend) => {
            if (!searchText || !friend.contact) return true;
            return friend.contact.username.toLowerCase().includes(searchText.toLowerCase());
        }
        );
        setFilteredFriends(filtered);
        setShowInstruction(searchText === '');
    }, [searchText, allContacts]);


    const addFriend = () => {
        if (!searchText) return;
        socket.emit('send-friend-request', { friendUsername: searchText });
        setSearchText('');
    }

    return (
        <div className="chat-sessions-container">
            <input
                type="text"
                className="login-input search-input"
                name="search-friends"
                placeholder="search contacts"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <i className="search-input-icon"></i>
            <div className="message-list-container">
                <div className="message-item text-center d-flex flex-col">
                    <small className={`transition-fast ${!showInstruction ? 'invisible' : ''}`}>Type a username to send a friend request</small>
                    <Link to=""
                        className={`app-link transition-fast send-fr-link ${searchText && !allContacts.some((friend) => {
                            if (!friend.contact || !searchText) return false;
                            return friend.contact.username.toLowerCase() === searchText.toLowerCase()
                        }) ? '' : 'invisible'}`}
                        onClick={addFriend}>
                        Send Friend Request
                    </Link>
                </div>
                {!!filteredFriends.length && filteredFriends.map((friend) => (
                    <div className="message-item" key={friend.friendRequest._id}>
                        <FriendCard friend={friend} />
                    </div>
                ))}
            </div>
        </div>
    );
}