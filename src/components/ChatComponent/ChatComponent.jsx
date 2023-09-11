import { useEffect, useRef, useState } from "react";
import AsideComponent from "./Aside/AsideComponent";
import "./ChatComponent.css";
import { socket } from "../../socket";
import { getAccessToken } from "../../utilities/services/user-service";
import { useSocket } from "../../contexts/SocketContext";
import Main from "./Main/Main";


const FULLSCREEN_BREAKPOINT = 500;

export default function ChatComponent() {
    const [activeScreen, setActiveScreen] = useState('aside');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [fullscreen, setFullscreen] = useState(false);
    const [asideData, setAsideData] = useState(null);
    const [switchToChat, setSwitchToChat] = useState('');
    const [clearSelection, setClearSelection] = useState(false);
    const t = useRef(0);
    let backoff = useRef(1000);
    const { isConnected, sessionsCache, createEmptySession, markRead, sessionsMeta } = useSocket();

    useEffect(() => {
        socket.io.opts.query = { token: getAccessToken() };
        socket.connect();
        return () => {
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        function tryReconnect() {
            if (!isConnected) {
                // setRetrying(true);
                console.warn("attempting to reconnect...");
                socket.connect();
                backoff.current *= 2;
                t.current = setTimeout(tryReconnect, backoff.current);
            }
        }

        function onDisconnect() {
            t.current = setTimeout(tryReconnect, backoff.current);
        }

        function onConnect() {
            clearTimeout(t.current);
            backoff.current = 1000;
            console.info("connection established");
            // setRetrying(false);
        }
        socket.on('disconnect', onDisconnect);
        socket.on('connect', onConnect);

        return () => {
            clearTimeout(t.current);
            socket.off('disconnect', onDisconnect);
            socket.off('connect', onConnect);
        }
    }, [isConnected]);

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

    const onSelectAside = (data) => {
        setAsideData(data);
        setActiveScreen('main');
    }

    const onBack = () => {
        setAsideData(null);
        setActiveScreen('aside');
        setClearSelection(true);
    }

    const handleContactAction = (action, data) => {
        switch (action) {
            case 'accept':
                socket.emit('accept-friend-request', { requestId: data.friendRequest._id });
                break;
            case 'chat':
                // find an existing chat . If no existing chat, set a temporary one
                setSwitchToChat(data.contact._id);
                if (!(data.contact._id in sessionsCache) || !sessionsMeta.find(s => s.user1 === data.contact._id || s.user2 === data.contact._id)) {
                    createEmptySession(data.contact._id);
                }
                setActiveScreen('main');
                break;
            default:
                return;
        }
    }

    const onSwitchedToChat = () => {
        setSwitchToChat('');
    };

    const onClearedSelection = () => setClearSelection(false);
    const onTabSwitched = () => {
        if (!switchToChat) {
            setAsideData(null);
            setActiveScreen('aside');
        }
    }


    return (
        <>
            <div className={`chat-component-container ${!fullscreen ? 'vmax' : ''}`}>
                <AsideComponent
                    onSelect={onSelectAside}
                    fullscreen={fullscreen}
                    active={activeScreen === 'aside'}
                    onTabSwitched={onTabSwitched}
                    onSwitchedToChat={onSwitchedToChat}
                    switchToChat={switchToChat}
                    clearSelection={clearSelection}
                    onClearedSelection={onClearedSelection} />
                <Main
                    onContactAction={handleContactAction}
                    data={asideData}
                    onBack={onBack}
                    fullscreen={fullscreen}
                    active={activeScreen === 'main'} />
            </div>

        </>
    );
}