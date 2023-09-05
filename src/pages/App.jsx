import { Route,Routes } from "react-router-dom";
import Home from "./Home/Home";
import AuthPage from "./AuthPage/AuthPage";
import ChatPage from "./ChatPage/ChatPage";
import WelcomeHeader from "../components/WelcomeHeader/WelcomeHeader";
import { useAuth } from "../contexts/AuthContext";
import { getUser } from "../utilities/services/user-service";
export default function App() {
    const {jwt} = useAuth();
    return (
        <>
        {jwt && <WelcomeHeader username={getUser().username} />}
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<AuthPage />} />
            <Route path='/signup' element={<AuthPage />} />
            <Route path='/chat' element={<ChatPage />} />
            <Route path='/*' element={<Home />} />
        </Routes>
        </>
    );
}