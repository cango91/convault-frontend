import FriendActions from "./FriendActions";

export default function FriendDetails({ data, onFriendAction }) {
    const getStatus = () =>{
        if(data.friendRequest.status === 'accepted') return <><span className="friend-username">{data.contact.username}</span>&nbsp;and you are friends</>;
        if(data.friendRequest.status === 'rejected'){
            if(data.friendRequest.direction === 'sent') return "has rejected your friend request :(";
            else return "you have rejected their friend request";
        }
        if(data.friendRequest.direction==='sent') return  <>you have sent a friend request to <span className="friend-username">{data.contact.username}</span></>;
        return  <><span className="friend-username">{data.contact.username}</span>&nbsp;sent you a friend request</>;
    }
    return (
        <div className={`friend-details`}>
            <div className="friend-details-card d-flex flex-col min-width-275">
                <div className='friend-pic'>
                    <img src="user-filled-white.svg" alt="User" className="profile-pic" />
                </div>
                <div className="friendship-status">{getStatus()}</div>
                <FriendActions data={data} onAction={onFriendAction} />
            </div>
        </div>
    );
}