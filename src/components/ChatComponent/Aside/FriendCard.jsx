export default function FriendCard({friend, onSelectFriend}){
    const statusEmojis = (status,direction,block=false) =>{
        if(block) return ["🛑"];
        if(status === "accepted") return ["✅"];
        if(status === "rejected") return ["❌"];
        if(direction==='sent') return ["⏳"];
        if(direction==='received') return ["📩"];

    }

    const onFriendSelect = () => onSelectFriend(friend)

    return (
        <div className={`friend-card ${friend.friendRequest.direction==='received' && friend.friendRequest.status === 'pending' ? 'unacknowledged' : ''}`} onClick={onFriendSelect}>
            <div><img src="user-filled-white.svg" alt="User" className="profile-pic" /><span><small className="status-emojis">{friend.friendRequest?.status!=='accepted' && statusEmojis(friend.friendRequest.status,friend.friendRequest.direction,friend?.userBlocked || friend?.blockedByUser)}</small></span></div><span className="friend-username">{friend.contact?.username}</span>
        </div>
    );
}