const API_URL = 'http://localhost:3000/albums';

document.addEventListener('DOMContentLoaded', () => {
    loadAlbums();

    document.getElementById('album-form').addEventListener('submit', createAlbum);
    document.getElementById('add-song').addEventListener('click', addSongInput);
});

async function loadAlbums() {
    const res = await fetch(API_URL);
    const albums = await res.json();
    const list = document.getElementById('album-list');
    list.innerHTML = '';

    albums.forEach(album => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${album.band} - ${album.title}</strong> (${album.songCount} dal, ${album.totalLength})
            <button onclick="showAlbum(${album.id})">Megnéz</button>
            <button onclick="deleteAlbum(${album.id})">Törlés</button>
            <div id="album-${album.id}-details" class="album-details" style="display: none;"></div>
        `;
        list.appendChild(li);
    });
}

async function showAlbum(id) {
    const detailsContainer = document.getElementById(`album-${id}-details`);
    if (detailsContainer.style.display === 'none') {
        const res = await fetch(`${API_URL}/${id}`);
        const album = await res.json();

        detailsContainer.innerHTML = `
            <h3>${album.band} - ${album.title}</h3>
            <p><strong>Dalok száma:</strong> ${album.songCount}</p>
            <p><strong>Teljes hossz:</strong> ${album.totalLength}</p>
            <table>
                <thead>
                    <tr>
                        <th>Dal címe</th>
                        <th>Hossza</th>
                    </tr>
                </thead>
                <tbody>
                    ${album.songs.map(song => `
                        <tr>
                            <td>${song.title}</td>
                            <td>${song.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.style.display = 'none';
    }
}

async function createAlbum(e) {
    e.preventDefault();

    const band = document.getElementById('band').value;
    const title = document.getElementById('title').value;
    const songElements = document.querySelectorAll('#songs .song');

    const songs = Array.from(songElements).map(div => ({
        title: div.querySelector('.song-title').value,
        length: div.querySelector('.song-length').value
    }));

    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ band, title, songs })
    });

    if (res.ok) {
        document.getElementById('album-form').reset();
        document.getElementById('songs').innerHTML = `
            <h3>Dalok</h3>
            <div class="song">
                <input type="text" placeholder="Dal címe" class="song-title" required>
                <input type="text" placeholder="Hossz (pl. 3:45)" class="song-length" required>
            </div>
        `;
        loadAlbums();
    }
}

async function deleteAlbum(id) {
    if (confirm('Biztosan törlöd az albumot?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadAlbums();
    }
}

function addSongInput() {
    const songsDiv = document.getElementById('songs');
    const newSongDiv = document.createElement('div');
    newSongDiv.classList.add('song');
    newSongDiv.innerHTML = `
        <input type="text" placeholder="Dal címe" class="song-title" required>
        <input type="text" placeholder="Hossz (pl. 3:45)" class="song-length" required>
    `;
    songsDiv.appendChild(newSongDiv);
}
