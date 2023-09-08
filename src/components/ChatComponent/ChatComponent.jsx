import { useEffect,  useRef,  useState } from "react";
import AsideComponent from "./Aside/AsideComponent";
import "./ChatComponent.css";
import { socket } from "../../socket";
import { getAccessToken } from "../../utilities/services/user-service";
import ErrorToast from "./ErrorToast";
import { useSocket } from "../../contexts/SocketContext";

const FULLSCREEN_BREAKPOINT = 500;

export default function ChatComponent() {
    const [activeScreen, setActiveScreen] = useState('aside');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [fullscreen, setFullscreen] = useState(false);
    const t = useRef(0);
    let backoff = useRef(1000);
    const {isConnected} = useSocket();

    useEffect(() => {
        socket.io.opts.query = { token: getAccessToken() };
        socket.connect();
        return () => {
            socket.disconnect();
            //socket.close();
        }
    }, []);

    useEffect(()=>{
        function tryReconnect(){
            if(!isConnected){
                console.warn("attempting to reconnect...");
                socket.connect();
                backoff.current *= 2;
                t.current = setTimeout(tryReconnect,backoff.current);              
            }
        }

        function onDisconnect(){
            t.current = setTimeout(tryReconnect, backoff.current);
        }

        function onConnect(){
            clearTimeout(t.current);
            backoff.current = 1000;
            console.log("connection established");
        }
        socket.on('disconnect',onDisconnect);
        socket.on('connect',onConnect);

        return () =>{
            clearTimeout(t.current);
            socket.off('disconnect',onDisconnect);
            socket.off('connect',onConnect);
        }
    },[isConnected]);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        setFullscreen(parseInt(windowWidth, 10) <= FULLSCREEN_BREAKPOINT);
    }, [windowWidth]);

    return (
        <>
        <div className={`chat-component-container`}>
            <AsideComponent fullscreen={fullscreen} active={activeScreen === 'aside'} />
        </div>
        
        </>
    );
}