import { useEffect, useState } from "react";

export default function FriendCard({friend}){
    return (
        <div className="friend-card">
            <span>{friend.contact?.username}</span><span><small>{friend.friendRequest?.status!=='accepted' && friend.friendRequest?.status}</small></span>
        </div>
    );
}