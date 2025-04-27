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

    //Playboi Carti
    const songs2 = [
        ["POP OUT", "2:41"],
        ["CRUSH (with Travis Scott)", "2:53"],
        ["K POP", "1:52"],
        ["EVIL JORDAN", "3:03"],
        ["MOJO JOJO", "2:36"],
        ["PHILLY (with Travis Scott)", "3:05"],
        ["RADAR", "1:47"],
        ["RATHER LIE (with Weeknd)", "3:29"],
        ["FINE SHIT", "1:46"],
        ["BACKD00R (feat. Kendrick Lamar & Jhené Aiko)", "3:10"],
        ["TOXIC (with Skepta)", "2:15"],
        ["MUNYUN", "2:34"],
        ["CRANK", "2:27"],
        ["CHARGE DEM HOES A FEE (with Future & Travis Scott)", "3:45"],
        ["GOOD CREDIT (with Kendrick Lamar)", "3:10"],
        ["I SEEEE YOU BABY BOI", "2:38"],
        ["WAKE UP F1LTHY (with Travis Scott)", "2:49"],
        ["JUMPIN (with LIl Uzi Vert)", "1:32"],
        ["TRIM (with Future)", "3:13"],
        ["COCAINE NOSE", "2:31"],
        ["WE NEED ALL DA VIBES (with Young Thug & Ty Dolla $ign)", "3:01"],
        ["OLYMPIAN", "2:54"],
        ["OPM BABY", "2:53"],
        ["TWIN TRIM (with LIl Uzi Vert)", "1:34"],
        ["LIKE WEEZY", "1:55"],
        ["DIS 1 GOT IT", "2:03"],
        ["WALK", "1:34"],
        ["HBA", "3:32"],
        ["OVERLY", "1:45"],
        ["SOUTH ATLANTA BABY", "2:13"],
    ];
    const totalLength2 = calculateTotalLength(songs2);

    const albumId2 = (await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        ["Playboi Carti", "I AM MUSIC", songs2.length, totalLength2]
    )).lastID;

    for (const [title, length] of songs2) {
        await dbRun("INSERT INTO songs (albumId, title, length) VALUES (?, ?, ?)", [albumId2, title, length]);
    }
}