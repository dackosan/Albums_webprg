import sqlite from 'sqlite3';
const db = new sqlite.Database('./data/albums.sqlite');

export function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
}

export function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => db.get(sql, params, (err, row) => err ? reject(err) : resolve(row)));
}

export function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
    }));
}

export async function initializeDatabase() {
    await dbRun("DROP TABLE IF EXISTS albums");
    await dbRun("DROP TABLE IF EXISTS songs");

    await dbRun(`CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        band TEXT,
        title TEXT,
        songCount INTEGER,
        totalLength TEXT
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        albumId INTEGER,
        title TEXT,
        length TEXT,
        FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE
    )`);

    const albumId = (await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        ["Metallica", "Master of Puppets", 8, "54:33"]
    )).lastID;

    const songs = [
        ["Battery", "5:12"],
        ["Master of Puppets", "8:35"],
        ["The Thing That Should Not Be", "6:36"],
        ["Welcome Home (Sanitarium)", "6:27"],
        ["Disposable Heroes", "8:16"],
        ["Leper Messiah", "5:40"],
        ["Orion", "8:27"],
        ["Damage, Inc.", "5:08"],
    ];

    for (const [title, length] of songs) {
        await dbRun("INSERT INTO songs (albumId, title, length) VALUES (?, ?, ?)", [albumId, title, length]);
    }
}