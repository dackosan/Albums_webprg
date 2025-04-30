import express from 'express';
import cors from 'cors';
import { dbAll, dbRun, dbGet, initializeDatabase } from './util/database.js';

const app = express();
app.use(cors());
app.use(express.json());

// List all albums
app.get('/albums', async (req, res) => {
    const data = await dbAll("SELECT * FROM albums ORDER BY band, title");
    res.json(data);
});

// Get a specific album with its songs
app.get('/albums/:id', async (req, res) => {
    const { id } = req.params;
    const album = await dbGet("SELECT * FROM albums WHERE id = ?", [id]);
    if (!album) return res.status(404).json({ message: "Album not found!" });

    const songs = await dbAll("SELECT * FROM songs WHERE albumId = ?", [id]);
    res.json({ ...album, songs });
});

// Create new album
app.post('/albums', async (req, res) => {
    const { band, title, songs } = req.body;
    if (!band || !title || !Array.isArray(songs)) return res.status(400).json({ message: "Missing data!" });

    const songCount = songs.length;
    const totalSeconds = songs.reduce((acc, song) => {
        const [min, sec] = song.length.split(':').map(Number);
        return acc + min * 60 + sec;
    }, 0);
    const totalLength = `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, '0')}`;

    const albumResult = await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        [band, title, songCount, totalLength]
    );

    for (const song of songs) {
        await dbRun("INSERT INTO songs (albumId, title, length) VALUES (?, ?, ?)", [albumResult.lastID, song.title, song.length]);
    }

    res.status(201).json({ id: albumResult.lastID, band, title, songCount, totalLength });
});

// Update album
app.put('/albums/:id', async (req, res) => {
    const { band, title } = req.body;
    const { id } = req.params;

    await dbRun(`UPDATE albums SET band = ?, title = ? WHERE id = ?`, [band, title, id]);
    res.sendStatus(200);
});

// Delete album
app.delete('/albums/:id', async (req, res) => {
    const { id } = req.params;
    await dbRun("DELETE FROM albums WHERE id = ?", [id]);
    res.json({ message: "Album deleted!" });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: `Error: ${err.message}` });
});

await initializeDatabase();
app.listen(3000, () => console.log("API running on port 3000"));