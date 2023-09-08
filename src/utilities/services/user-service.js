import { refreshUser } from "../api/users-api";
import { parseJwt } from "../utils";

export function getAccessToken(){
    const token = localStorage.getItem('jwt');
    if(!token){
        return null;
    }
    return token;
}

export function setAccessToken(token){
    localStorage.setItem('jwt',token);
}

export function getUser() {
    const token = getAccessToken();
    return token ? parseJwt(token).user : null;
}

export async function refreshUserTk(){
    try {
        const response = await  refreshUser();
        if(response.accessToken){
            setAccessToken(response.accessToken);
            return response.accessToken;
        }
        return null;
    } catch (error) {
        console.warn(error);
        return null;
    }
}