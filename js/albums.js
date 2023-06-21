let albumId = "0JwHz5SSvpYWuuCNbtYZoV";
let defaultArtistId = "70cRZdQywnSFp9pnc2WTCE";

let player;

window.addEventListener('load', getAlbums);


window.onSpotifyWebPlaybackSDKReady = () => {
    let token = localStorage.getItem('access_token');

    player = new Spotify.Player({
        name: 'Web Playback SDK Quick Start Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.8
    });

    player.on('playback_error', e => console.error(e));

    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);

        play(device_id);
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    document.getElementById('togglePlay').onclick = function () {
        player.togglePlay();
        getCurrentSong(player);
    };

    document.getElementById('next').onclick = function () {
        player.nextTrack();
        getNextSong(player);
    };

    document.getElementById('previous').onclick = function () {
        player.previousTrack();
        getPreviousSong(player);
    };

    player.connect().then(success => {
        if (success) {
            console.log('The Web Playback SDK successfully connected to Spotify!');
        }
    })
}


async function getAlbums() {

    let accessToken = localStorage.getItem('access_token');
    const urlParams = new URLSearchParams(window.location.search);
    let artistId = urlParams.get('artist');
    let albumId = urlParams.get('album');

    if (!artistId) {
        artistId = defaultArtistId;
    }

    if (!albumId) {
        localStorage.removeItem('albums');
    }

    let albums = JSON.parse(localStorage.getItem('albums'));
    if (albums) {
        renderAlbums(albums);
        albumId = albums[0].id;
        console.log("ALBUM ID:");
        console.log(albumId);
        return albums;
    }

    const response = await fetch('https://api.spotify.com/v1/artists/' + artistId + '/albums', {
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
            localStorage.setItem('albums', JSON.stringify(data.items));
            renderAlbums(data.items);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function renderAlbums(albums) {

    const urlParams = new URLSearchParams(window.location.search);
    let artistId = urlParams.get('artist');

    let albumsContainer = document.getElementById('albumsContainer');

    let albumsTable = document.getElementById('albumsTable');

    if (albumsTable) {
        albumsTable.remove();
    }

    albumsTable = document.createElement('table');
    albumsTable.id = "albumsTable";


    let columnNumbers = 2;

    for (let i = 0; i < albums.length - columnNumbers + 1; i = i + 2) {
        let row = document.createElement('tr');

        for (let j = 0; j < columnNumbers; j++) {
            let cell = document.createElement('td');

            let albumsLink = document.createElement('a');
            albumsLink.href = "./albums.html?" + new URLSearchParams({
                artist: artistId,
                album: albums[i + j].id
            });

            cell.appendChild(albumsLink);

            let img = document.createElement('img');
            img.src = albums[i + j].images[0].url;
            img.width = 300;
            img.height = 300;
            img.className = "musicImages";

            albumsLink.appendChild(img);
            albumsLink.appendChild(document.createElement('br'));
            albumsLink.appendChild(document.createElement('br'));
            albumsLink.appendChild(document.createTextNode(albums[i + j].name));
            albumsLink.className = "albumLinks";

            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            row.appendChild(cell);
        }

        albumsTable.appendChild(row);

    }

    albumsContainer.appendChild(albumsTable);
}


function play(device_id) {
    let accessToken = localStorage.getItem('access_token');

    const urlParams = new URLSearchParams(window.location.search);
    let artistId = urlParams.get('artist');
    let album = urlParams.get('album');

    if (album) {
        albumId = album;
    } else {

        let albums = JSON.parse(localStorage.getItem('albums'));
        if (albums) {

            albumId = albums[0].id;
        }
    }

    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: '{"context_uri": "spotify:album:' + albumId + '"}',

        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken); },
        success: function (data) {
            console.log(data)
        }
    });
}


async function getCurrentSong(player) {

    let state = await player.getCurrentState();
    if (!state) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
    }

    let track = state.track_window.current_track;

    let currentSongLabel = document.getElementById('currentSongLabel');
    currentSongLabel.innerText = track.artists[0].name + " - " + track.name;

    console.log('Currently Playing', track.artists[0].name + " - " + track.name);

}


async function getNextSong(player) {

    let state = await player.getCurrentState();
    if (!state) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
    }

    let track = state.track_window.next_tracks[0];

    let currentSongLabel = document.getElementById('currentSongLabel');
    currentSongLabel.innerText = track.artists[0].name + " - " + track.name;

    console.log('Currently Playing', track.artists[0].name + " - " + track.name);

}


async function getPreviousSong(player) {

    let state = await player.getCurrentState();
    if (!state) {
        console.error('User is not playing music through the Web Playback SDK');
        return;
    }

    let track = state.track_window.previous_tracks[1];

    let currentSongLabel = document.getElementById('currentSongLabel');
    currentSongLabel.innerText = track.artists[0].name + " - " + track.name;

}
