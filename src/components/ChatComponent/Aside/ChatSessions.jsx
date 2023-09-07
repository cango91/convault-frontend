
export default function ChatSessions({sessions}){
    let comp;

    return (
        <div className="chat-sessions-container">
        <input
        type="text"
        className="login-input search-input"
        name="filter-sessions"
        />
        <i className="search-input-icon"></i>
        </div>
    );
}