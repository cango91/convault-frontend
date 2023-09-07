import { useEffect, useState } from "react";
import AsideComponent from "./Aside/AsideComponent";
import "./ChatComponent.css";

const FULLSCREEN_BREAKPOINT = 500;

export default function ChatComponent() {
    const [activeScreen,setActiveScreen] = useState('aside');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(()=>{
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return ()=> {
            window.removeEventListener('resize', handleResize);
        }
    },[]);

    useEffect(()=>{
        setFullscreen(parseInt(windowWidth,10)<=FULLSCREEN_BREAKPOINT);
    },[windowWidth]);

    return (
        <div className={`chat-component-container`}>
            <AsideComponent fullscreen={fullscreen} active={activeScreen==='aside'} />
        </div>
    );
}