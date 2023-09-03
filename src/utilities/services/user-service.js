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