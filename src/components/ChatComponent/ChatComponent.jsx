import { useEffect } from "react";
import { useSocket } from "../../contexts/SocketContext";

export default function ChatComponent(){
    const {socket, awaitAuth} = useSocket();

    useEffect(()=>{
            if(!socket) return;
            console.log('i got the socket');
            socket.on('all-sessions', sessions =>{
                console.log(sessions);
            });

        return ()=>{
            socket.off('all-sessions');
        }
    },[socket]);

    return (
        <div>This is chat hello</div>
    );
}