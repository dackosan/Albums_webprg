const API_URL = "http://localhost:3000/albums";

document.getElementById('add-song').addEventListener('click', addSongField);
document.getElementById('save-album').addEventListener('click', saveAlbum);

async function loadAlbums() {
    const response = await fetch(API_URL);
    const albums = await response.json();

    const albumsList = document.getElementById('albums');
    albumsList.innerHTML = '';

    albums.forEach(album => {
        const li = document.createElement('li');
        li.className = 'album';
        li.innerHTML = `
            <strong>${album.band}</strong> - ${album.title} (${album.songCount} dal, ${album.totalLength})
            <div class="album-actions">
                <button onclick="viewAlbum(${album.id})">Megtekintés</button>
                <button onclick="editAlbum(${album.id})">Szerkesztés</button>
                <button onclick="deleteAlbum(${album.id})">Törlés</button>
            </div>
            <div id="details-${album.id}"></div>
        `;
        albumsList.appendChild(li);
    });
}

function addSongField() {
    const songsDiv = document.getElementById('songs');
    const inputTitle = document.createElement('input');
    inputTitle.placeholder = "Dal címe";
    inputTitle.className = 'song-title';

    const inputLength = document.createElement('input');
    inputLength.placeholder = "Hossz (perc:mp)";
    inputLength.className = 'song-length';

    songsDiv.appendChild(inputTitle);
    songsDiv.appendChild(inputLength);
}

async function saveAlbum() {
    const band = document.getElementById('band').value;
    const title = document.getElementById('title').value;
    const songTitles = document.querySelectorAll('.song-title');
    const songLengths = document.querySelectorAll('.song-length');

    const songs = [];

    for (let i = 0; i < songTitles.length; i++) {
        const songTitle = songTitles[i].value.trim();
        const songLength = songLengths[i].value.trim();
        if (songTitle && songLength) {
            songs.push({ title: songTitle, length: songLength });
        }
    }

    if (!band || !title || songs.length === 0) {
        alert('Tölts ki minden mezőt!');
        return;
    }

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ band, title, songs })
    });

    document.getElementById('band').value = '';
    document.getElementById('title').value = '';
    document.getElementById('songs').innerHTML = '<h3>Dalok</h3><button id="add-song">Új dal hozzáadása</button>';
    document.getElementById('add-song').addEventListener('click', addSongField);

    loadAlbums();
}

async function viewAlbum(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const album = await response.json();
    const detailsDiv = document.getElementById(`details-${id}`);

    detailsDiv.innerHTML = album.songs.map(song => `<div class="song-item">${song.title} - ${song.length}</div>`).join('');
}

async function editAlbum(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const album = await response.json();

    document.getElementById('band').value = album.band;
    document.getElementById('title').value = album.title;
    document.getElementById('songs').innerHTML = '<h3>Dalok</h3>';

    album.songs.forEach(song => {
        const inputTitle = document.createElement('input');
        inputTitle.placeholder = "Dal címe";
        inputTitle.className = 'song-title';
        inputTitle.value = song.title;

        const inputLength = document.createElement('input');
        inputLength.placeholder = "Hossz (perc:mp)";
        inputLength.className = 'song-length';
        inputLength.value = song.length;

        document.getElementById('songs').appendChild(inputTitle);
        document.getElementById('songs').appendChild(inputLength);
    });

    document.getElementById('save-album').onclick = async function() {
        const band = document.getElementById('band').value;
        const title = document.getElementById('title').value;
        const songTitles = document.querySelectorAll('.song-title');
        const songLengths = document.querySelectorAll('.song-length');

        const songs = [];

        for (let i = 0; i < songTitles.length; i++) {
            const songTitle = songTitles[i].value.trim();
            const songLength = songLengths[i].value.trim();
            if (songTitle && songLength) {
                songs.push({ title: songTitle, length: songLength });
            }
        }

        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ band, title, songs })
        });

        document.getElementById('band').value = '';
        document.getElementById('title').value = '';
        document.getElementById('songs').innerHTML = '<h3>Dalok</h3><button id="add-song">Új dal hozzáadása</button>';
        document.getElementById('add-song').addEventListener('click', addSongField);

        loadAlbums();
    };
}

async function deleteAlbum(id) {
    if (confirm('Biztos törlöd ezt az albumot?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadAlbums();
    }
}

// Első betöltés
loadAlbums();