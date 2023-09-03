import { getAccessToken, setAccessToken } from "./services/user-service";
export async function sendRequest(url, method = 'GET', payload = null, autoLogout = true) {
    const options = { method };
    if (payload) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
    }
    const token = getAccessToken();
    if (token) {
        options.headers = options.headers || {};
        options.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const res = await fetch(url, options);
        if (res.ok) {
            const newAccessToken = res.headers.get('New-Access-Token');
            if (newAccessToken) {
                setAccessToken(newAccessToken);
            }
        } else {
            if (autoLogout && res.status === 401 && token) {
                // check if refresh token expired
                if (!await checkTokenStatus()) {
                    // logout and redirect to login
                    localStorage.removeItem('jwt');
                    await fetch('/api/auth/logout', { method: 'POST' });
                    return { redirect: '/login', message: 'session expired' }
                }
            }
        }
        return res.json();
    } catch (error) {
        console.error(error);
        return error;
    }

}

export async function checkTokenStatus() {
    try {
        const res = await fetch('/api/auth/token-status', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' }
        });
        const json = await res.json();
        if (json.message && json.message !== 'valid') {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        console.error(error);
        return false;
    }
}

export function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


export function setClassWithDelay(setter,className='',delay=10){
    return setTimeout(()=>setter(className),delay);
}