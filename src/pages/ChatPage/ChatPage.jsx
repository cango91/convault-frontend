import LogoutButton from '../../components/LogoutButton/LogoutButton';
import './ChatPage.css';
import { useCrypto } from '../../contexts/CryptoContext';
import PrivKeySetter from '../../components/PrivKeySetter/PrivKeySetter';
import { SocketProvider } from '../../contexts/SocketContext';
import ChatComponent from '../../components/ChatComponent/ChatComponent';

export default function ChatPage() {
    const { privateKey } = useCrypto();
    return (
        <>
            <LogoutButton /><SocketProvider connection={false}>
                {privateKey &&

                    <ChatComponent />


                }
                {
                    !privateKey &&
                    <>
                        <PrivKeySetter />
                    </>
                }
            </SocketProvider> </>
    );
}