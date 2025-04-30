const API_URL = 'http://localhost:3000/albums';

document.addEventListener('DOMContentLoaded', () => {
    loadAlbums();

    document.getElementById('album-form').addEventListener('submit', createAlbum);
    document.getElementById('add-song').addEventListener('click', addSongInput);

    document.getElementById('open-add-modal').addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'flex';
    });

    document.getElementById('cancel-add').addEventListener('click', () => {
        document.getElementById('add-modal').style.display = 'none';
    });
});

async function loadAlbums() {
    const res = await fetch(API_URL);
    const albums = await res.json();
    const list = document.getElementById('album-list');
    list.innerHTML = '';

    albums.forEach(album => {
        const li = document.createElement('li');
        li.classList.add('album-item');
        li.innerHTML = `
            <div class="album-header" data-id="${album.id}">
                <span class="arrow">▶</span>
                <strong>${album.band} – ${album.title}</strong>
            </div>
            <div id="album-${album.id}-details" class="album-details" style="display: none;"></div>
        `;
        list.appendChild(li);
    });

    document.querySelectorAll('.album-header').forEach(header => {
        header.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            toggleAlbumDetails(id, e.currentTarget);
        });
    });
}

async function toggleAlbumDetails(id, headerElement) {
    const detailsContainer = document.getElementById(`album-${id}-details`);
    const arrow = headerElement.querySelector('.arrow');

    if (detailsContainer.style.display === 'none') {
        const res = await fetch(`${API_URL}/${id}`);
        const album = await res.json();

        detailsContainer.innerHTML = `
            <h2>${album.band} – ${album.title}</h3>
            <h3>${album.songCount} dal • ${album.totalLength}</h3>
            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>Cím</th>
                        <th>🕒</th>
                    </tr>
                </thead>
                <tbody>
                    ${album.songs.map((song, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${song.title}</td>
                            <td>${song.length}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="action-buttons">
                <button onclick="editAlbum(${album.id})">Szerkesztés</button>
                <button onclick="deleteAlbum(${album.id})">Törlés</button>
            </div>
        `;
        detailsContainer.style.display = 'block';
        arrow.textContent = '▼';  // lenyitva
    } else {
        detailsContainer.style.display = 'none';
        arrow.textContent = '▶';  // összecsukva
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

function editAlbum(id) {
    alert('Szerkesztés még nincs kész!'); // ide majd később jöhet a szerkesztős kód
}

let currentEditingId = null;

function editAlbum(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(album => {
            currentEditingId = id;
            document.getElementById('edit-band').value = album.band;
            document.getElementById('edit-title').value = album.title;
            document.getElementById('edit-songCount').value = album.songCount;
            document.getElementById('edit-totalLength').value = album.totalLength;
            document.getElementById('edit-modal').style.display = 'flex';
        });
}

document.getElementById('cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

document.getElementById('save-edit').addEventListener('click', async () => {
    const band = document.getElementById('edit-band').value;
    const title = document.getElementById('edit-title').value;

    // Küldés szerverre PUT-tal, meglévő dalokat NEM módosítjuk
    const res = await fetch(`${API_URL}/${currentEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ band, title })
    });

    if (res.ok) {
        document.getElementById('edit-modal').style.display = 'none';
        loadAlbums();
    } else {
        alert('Nem sikerült frissíteni!');
    }
});

//59, 51 sor -> <td>${song.id}</td> <td>$Id</td>