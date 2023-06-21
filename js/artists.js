defaultGenre = "rock";

window.addEventListener('load', displayArtists);

async function getGenres() {
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
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
            localStorage.setItem('genres', JSON.stringify(data.genres));
            renderGenresDropDownList();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function renderGenresDropDownList() {
    let genres = JSON.parse(localStorage.getItem('genres'));
    let list = document.getElementById('genresSelectList');
    console.log(genres);

    if (!genres) {
        getGenres();
        genres = JSON.parse(localStorage.getItem('genres'));
        console.log(genres);
    }

    for (let i in genres) {
        list.add(new Option(genres[i], genres[i]));

    }
}

function displayArtists() {

    renderGenresDropDownList();

    let genresSelectElement = document.getElementById('genresSelectList');
    let genre = genresSelectElement.value;

    if (!genre) {
        genre = defaultGenre;
    }

    getArtists(genre);
}

async function getArtists(genre) {
    let accessToken = localStorage.getItem('access_token');

    const response = await fetch('https://api.spotify.com/v1/search?' + new URLSearchParams({
        type: 'artist',
        q: 'genre:' + genre,
    }), {
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
            renderArtists(data.artists.items);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


function renderArtists(artists) {
    for (i in artists) {
        console.log(artists[i].name);
    }
    console.log(artists);

    let artistsContainer = document.getElementById('artistsContainer');

    let artistsTable = document.getElementById('artistsTable');

    if (artistsTable) {
        artistsTable.remove();
    }

    artistsTable = document.createElement('table');
    artistsTable.id = "artistsTable";


    let columnNumbers = 2;

    for (let i = 0; i < artists.length - columnNumbers + 1; i = i + 2) {
        let row = document.createElement('tr');

        for (let j = 0; j < columnNumbers; j++) {
            let cell = document.createElement('td');

            let albumsLink = document.createElement('a');
            albumsLink.href = "./albums.html?" + new URLSearchParams({
                artist: artists[i + j].id
            });

            let img = document.createElement('img');
            img.src = artists[i + j].images[0].url;
            img.width = 320;
            img.height = 320;
            img.className = "musicImages";

            albumsLink.appendChild(img);
            albumsLink.appendChild(document.createElement('br'));
            albumsLink.appendChild(document.createElement('br'));
            albumsLink.appendChild(document.createTextNode(artists[i + j].name));
            albumsLink.className = "albumLinks";

            cell.appendChild(albumsLink);

            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            cell.appendChild(document.createElement('br'));
            row.appendChild(cell);
        }

        artistsTable.appendChild(row);

    }

    artistsContainer.appendChild(artistsTable);
}


