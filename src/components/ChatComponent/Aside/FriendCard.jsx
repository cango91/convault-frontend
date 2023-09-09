export default function FriendCard({friend}){
    const statusEmojis = (status,direction,block=false) =>{
        if(block) return ["🛑"];
        if(status === "accepted") return ["✅"];
        if(status === "rejected") return ["❌"];
        const ret = ["⏳"];
        if(direction === "sent"){
            ret.push("📬");
        }else{
            ret.push("📩");
        }
        return ret;

    }
    return (
        <div className="friend-card">
            <div><img src="user-filled-white.svg" alt="User" className="profile-pic" /><span><small className="status-emojis">{friend.friendRequest?.status!=='accepted' && statusEmojis(friend.friendRequest.status,friend.friendRequest.direction,friend?.userBlocked || friend?.blockedByUser)}</small></span></div><span className="friend-username">{friend.contact?.username}</span>
        </div>
    );
}