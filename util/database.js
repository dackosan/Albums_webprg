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
        ["Intro", "1:23"],
        ["Flex", "3:12"],
        ["Gengszter mód", "2:55"],
        ["PP2", "4:10"],
        ["Outro", "4:02"],
    ];
    const totalLength1 = calculateTotalLength(songs1);

    const albumId1 = (await dbRun(
        "INSERT INTO albums (band, title, songCount, totalLength) VALUES (?, ?, ?, ?)",
        ["gyuris, grasa, ibbigang", "PP2", songs1.length, totalLength1]
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
        ["RADAR", "3:05"],
        ["RATHER LIE (with Weeknd)", "3:05"],
        ["FINE SHIT", "3:05"],
        ["BACKD00R (feat. Kendrick Lamar & Jhené Aiko)", "3:05"],
        ["TOXIC (with Skepta)", "3:05"],
        ["MUNYUN", "3:05"],
        ["CRANK", "3:05"],
        ["CHARGE DEM HOES A FEE (with Future & Travis Scott)", "3:05"],
        ["GOOD CREDIT (with Kendrick Lamar)", "3:05"],
        ["I SEEEE YOU BABY BOI", "3:05"],
        ["WAKE UP F1LTHY (with Travis Scott)", "3:05"],
        ["JUMPIN (with LIl Uzi Vert)", "3:05"],
        ["TRIM (with Future)", "3:05"],
        ["COCAINE NOSE", "3:05"],
        ["WE NEED ALL DA VIBES (with Young Thug & Ty Dolla $ign)", "3:05"],
        ["OLYMPIAN", "3:05"],
        ["OPM BABY", "3:05"],
        ["TWIN TRIM (with LIl Uzi Vert)", "3:05"],
        ["LIKE WEEZY", "3:05"],
        ["DIS 1 GOT IT", "3:05"],
        ["WALK", "3:05"],
        ["HBA", "3:05"],
        ["OVERLY", "3:05"],
        ["SOUTH ATLANTA BABY", "3:05"],
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