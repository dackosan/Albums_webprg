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

function calculateTotalLength(songs) {
    let totalSeconds = 0;
    for (const [_, length] of songs) {
        const parts = length.split(":").map(Number);
        if (parts.length === 2) {
            totalSeconds += parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${minutes}:${String(seconds).padStart(2, '0')}`;
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

    // Első album: PP2
    const songs1 = [
        ["Intro", "1:17"],
        ["Szeged Felől", "2:23"],
        ["Feminist", "2:24"],
        ["Január", "2:54"],
        ["PPP", "1:56"],
        ["2M", "2:45"],
        ["Zura", "4:01"],
        ["Kobe", "3:18"],
        ["Baktérium Cypher", "3:46"],
        ["Zootiez", "3:42"],
    ];
    const totalLength1 = calculateTotalLength(songs1);

    const albumId1 = (await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        ["Gyuris, Grasa, Ibbigang", "PP2", songs1.length, totalLength1]
    )).lastID;

    for (const [title, length] of songs1) {
        await dbRun("INSERT INTO songs (albumId, title, length) VALUES (?, ?, ?)", [albumId1, title, length]);
    }

    //BB
    const songs2 = [
        ["10 PINK BB", "2:57"],
        ["FREESTYLE", "2:17"],
        ["MAGASAN", "3:00"],
        ["BB", "2:51"],
        ["HIWAY", "3:05"],
        ["BOOTYSHAKER", "2:14"],
        ["KÉSZEBBEN, MINT VALAHA", "3:36"],
        ["BASZ", "3:20"],
        ["ISTEN VELEM", "3:02"],
    ];
    const totalLength2 = calculateTotalLength(songs2);

    const albumId2 = (await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        ["Gyuris, Grasa", "BARBATULA BARBATULA", songs2.length, totalLength2]
    )).lastID;

    for (const [title, length] of songs2) {
        await dbRun("INSERT INTO songs (albumId, title, length) VALUES (?, ?, ?)", [albumId2, title, length]);
    }
}