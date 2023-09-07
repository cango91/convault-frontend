import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../../contexts/SocketContext";
import { getAccessToken, refreshUserTk } from "../../utilities/services/user-service";
import AsideComponent from "./Aside/AsideComponent";
import "./ChatComponent.css";

const FULLSCREEN_BREAKPOINT = "500px";

export default function ChatComponent() {
    const [activeScreen,setActiveScreen] = useState('aside');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(()=>{
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return ()=> {
            window.removeEventListener('resize', handleResize);
        }
    },[]);

    // const [allSessions,setAllSessions] = useState(null);
    // const {socket} = useSocket();

    // useEffect(() => {
    //     function handleAllSessions(sessions){
    //         setAllSessions(sessions);
    //         console.log(sessions);
    //     }
    //     console.log('i got the socket');
    //     socket.on('all-sessions',handleAllSessions);
    //     return () => {
    //         socket.off('all-sessions',handleAllSessions);
    //     }
    // },[]);

    return (
        <div className="chat-component-container">
            <AsideComponent fullscreen={windowWidth <= FULLSCREEN_BREAKPOINT} active={activeScreen==='aside'} />
        </div>
    );
}