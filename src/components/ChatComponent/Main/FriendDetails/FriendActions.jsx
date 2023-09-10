export default function FriendActions({data, onAction}){
    const btns = [];
    const blockBtn = <button key="blockbtn" onClick={()=>onAction("block")} className="login-btn btn-danger transition-none">Block</button>;
    const unBlockBtn = <button key="unblockbtn" onClick={()=>onAction("unblock")} className="login-btn btn-danger transition-none">UnBlock</button>;
    const rejectBtn = <button key="rejectbtn" onClick={()=>onAction("reject")} className="login-btn btn-danger transition-none">Reject</button>;
    const acceptBtn = <button key="acceptbtn" onClick={()=>onAction("accept")} className="login-btn btn-success transition-none">Accept</button>;
    const chatBtn = <button key="chatbtn" onClick={()=>onAction("chat")} className="login-btn transition-none">Start Chatting 💬</button>;
    if(data.blockedContact) btns.push(unBlockBtn);
    if(!data.blockedContact && !(data.friendRequest.status==='pending' && data.friendRequest.direction==='sent')) btns.push(blockBtn);
    if(data.friendRequest.direction==='received' && data.friendRequest.status==='pending') btns.push(rejectBtn,acceptBtn);
    if(data.friendRequest.status === 'accepted' && !data.blockedContact && !data.blockedByContact) btns.push(chatBtn);

    return (
        <>
        <div className="friend-action-buttons">{btns}</div>
        </>
    );
}