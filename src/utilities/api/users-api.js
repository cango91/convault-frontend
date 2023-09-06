import { getAccessToken, getUser } from "../services/user-service";
import { sendRequest } from "../utils";

const BASE_URL = '/api/users';

export async function signup(userData) {
    return await sendRequest(BASE_URL, 'POST', userData);
}

export async function logout() {
    if (getAccessToken()) {
        await fetch(`${BASE_URL}/logout`, { method: 'POST',headers:{"Authorization": `Bearer ${getAccessToken()}`} });
        localStorage.removeItem('jwt');
    }
}

export async function login(userData) {
    return await sendRequest(`${BASE_URL}/login`, 'POST', userData);
}

export async function postPublicKey(key){
    return await sendRequest(`${BASE_URL}/pk`,'POST',key);
}

export async function refreshUser(){
    return await sendRequest(`${BASE_URL}/refresh`,'POST');
}

export async function getPublicKey(){
    const self = getUser();
    if(!self) return null;
    return await sendRequest(`${BASE_URL}/${self._id}/pk`);  
}

export async function getPublicKeyOf(userId){
    return await sendRequest(`${BASE_URL}/${userId}/pk`);
}