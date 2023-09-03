import { getAccessToken } from "../services/user-service";
import { sendRequest } from "../utils";

const BASE_URL = '/api/users';

export async function signup(userData) {
    return await sendRequest(BASE_URL, 'POST', userData);
}

export async function logout() {
    if (getAccessToken) {
        await fetch(`${BASE_URL}/logout`, { method: 'POST' });
        localStorage.removeItem('jwt');
    }
}

export async function login(userData) {
    return await sendRequest(`${BASE_URL}/login`, 'POST', userData);
}