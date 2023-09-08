import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FriendCard from './FriendCard';

export default function FriendsComponent({friends, onSelectFriend }) {
    const [allFriends, setAllFriends] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filteredFriends, setFilteredFriends] = useState([]);
    const [showInstruction, setShowInstruction] = useState(true);

    useEffect(() => {
        if (friends) {
            setAllFriends(friends);
            setFilteredFriends(friends);
        }
    }, [friends]);

    useEffect(() => {
        const filtered = allFriends.filter((friend) =>{
            if(!searchText) return friend;
            return friend.username.toLowerCase().includes(searchText.toLowerCase());
        }
        );
        setFilteredFriends(filtered);
        setShowInstruction(searchText === '');
    }, [searchText, allFriends]);

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
                    <Link to="" className={`app-link transition-fast send-fr-link ${searchText && !allFriends.some((friend) => {
                        if(!friend.username || !searchText) return false;
                        return friend.username.toLowerCase() === searchText.toLowerCase()
                        }) ? '' : 'invisible'}`}>
                        Send Friend Request
                    </Link>
                </div>
                {filteredFriends.map((friend) => (
                    <div className="message-item" key={friend.id}>
                        <FriendCard friend={friend} />
                    </div>
                ))}
            </div>
        </div>
    );
}