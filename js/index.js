const clientId = 'd5a660de8ad544dcac142cb11019a878';
const redirectUri = 'http://127.0.0.1:5500';
const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming playlist-read-private playlist-read-collaborative';


function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    return base64encode(digest);
}


function renderLoginButtonOrUsername() {
    let username = localStorage.getItem('username');
    let codeVerifier = localStorage.getItem('code_verifier');
    let accessToken = localStorage.getItem('access_token');
    let LoginButtonOrUsernameContainer = document.getElementById('loginButtonOrUsername');

    if (username) {
        let usernameText = document.createElement('p');
        usernameText.textContent = "Welcome, " + username;
        usernameText.className = 'welcomeUser';
        LoginButtonOrUsernameContainer.appendChild(usernameText);
    } else
        if (!codeVerifier) {
            let loginButton = document.createElement('button');
            loginButton.textContent = 'Sign in with Spotify';
            loginButton.className = 'btn btn-secondary';
            loginButton.id = 'loginBtn';

            loginButton.addEventListener('click', login);
            LoginButtonOrUsernameContainer.appendChild(loginButton);
        } else if (!accessToken) {
            login();
        }
}


function initAuthorize() {
    let codeVerifier = generateRandomString(128);

    generateCodeChallenge(codeVerifier)
        .then(codeChallenge => {
            let state = generateRandomString(16);

            localStorage.setItem('code_verifier', codeVerifier);

            let args = new URLSearchParams({
                response_type: 'code',
                client_id: clientId,
                scope: scope,
                redirect_uri: redirectUri,
                state: state,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge
            });

            window.location = 'https://accounts.spotify.com/authorize?' + args;
        });
}


async function login() {
    let accessToken = localStorage.getItem('access_token');
    let codeVerifier = localStorage.getItem('code_verifier');

    if (!codeVerifier) {
        initAuthorize();
    }

    codeVerifier = localStorage.getItem('code_verifier');

    if (!accessToken && codeVerifier) {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');

        let body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier
        });

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP status ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                localStorage.setItem('access_token', data.access_token);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
    getProfile();
}


async function getProfile() {
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('username', data.display_name);
            renderProfileName(data.display_name);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function renderProfileName(username) {
    let usernameText = document.createElement('a');
    let LoginButtonOrUsernameContainer = document.getElementById("loginButtonOrUsername");

    usernameText.textContent = "Welcome " + username + " | Profile";
    usernameText.className = 'welcomeUser';
    usernameText.href = "./profile.html";
    LoginButtonOrUsernameContainer.appendChild(usernameText);
}