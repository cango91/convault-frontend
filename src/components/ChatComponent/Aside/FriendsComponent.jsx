import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FriendCard from './FriendCard';
import { socket } from '../../../socket';
import { useSocket } from '../../../contexts/SocketContext';

export default function FriendsComponent({ onSelectFriend }) {
    const [searchText, setSearchText] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [showInstruction, setShowInstruction] = useState(true);
    const { allContacts } = useSocket();
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

    const handleOnKeyDown = (e) => {
        if(e.keyCode===13 && searchText) addFriend(); 
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
                onKeyDown={handleOnKeyDown}
            />
            <i className="search-input-icon"></i>
            <div className="message-list-container">
                <div className="friend-item text-center d-flex flex-col">
                    <small className={`transition-fast ${!showInstruction ? 'invisible' : ''}`}>Search by username</small>
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
                    <div className="friend-item" key={friend.friendRequest._id}>
                        <FriendCard friend={friend} onSelectFriend={onSelectFriend} />
                    </div>
                ))}
            </div>
        </div>
    );
}