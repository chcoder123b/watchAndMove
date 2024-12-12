const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const directoryToWatch = '???'; // Das Verzeichnis, das überwacht werden soll
const excludeDir = '???'; // Der auszuschließende Ordner

// Funktion zum Verschieben der Dateien
const moveFile = (filePath) => {
    const relativePath = path.relative(directoryToWatch, filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase(); // Dateiendung ermitteln

    // Überprüfen, ob der Pfad den auszuschließenden Ordner enthält oder die Datei die Endung .part oder .tmp hat
    if (relativePath.includes(excludeDir)) {
        console.log(`Datei ${filePath} wird nicht verschoben, da sie sich im ausgeschlossenen Ordner befindet.`);
        return;
    }
    
    if (ext === '.part') {
        console.log(`Datei ${fileName} wird nicht verschoben, da sie eine .part-Datei ist.`);
        return;
    }

    if (ext === '.tmp') {
        console.log(`Datei ${fileName} wird nicht verschoben, da sie eine .tmp-Datei ist.`);
        return;
    }

    const targetDir = path.join(directoryToWatch, ext.substring(1)); // Zielordner ohne den Punkt

    // Zielordner erstellen, falls nicht vorhanden
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const newFilePath = path.join(targetDir, fileName);

    // Datei verschieben
    fs.rename(filePath, newFilePath, (err) => {
        if (err) {
            return console.error(`Fehler beim Verschieben der Datei ${fileName}: ${err.message}`);
        }
        console.log(`Datei ${fileName} verschoben nach ${newFilePath}`);
        
        // Leere Ordner nach dem Verschieben löschen
        removeEmptyDirs(path.dirname(filePath));
    });
};

// Funktion zum Löschen leerer Ordner
const removeEmptyDirs = (dir) => {
    fs.readdir(dir, (err, files) => {
        if (err) return console.error(`Fehler beim Lesen des Verzeichnisses ${dir}: ${err.message}`);
        
        if (files.length === 0) {
            fs.rmdir(dir, (err) => {
                if (err) return console.error(`Fehler beim Löschen des Ordners ${dir}: ${err.message}`);
                console.log(`Leerer Ordner gelöscht: ${dir}`);
                // Rekursiv über den übergeordneten Ordner prüfen
                removeEmptyDirs(path.dirname(dir));
            });
        }
    });
};

// Chokidar konfigurieren
const watcher = chokidar.watch(directoryToWatch, {
    persistent: true,
});

// Ereignis für neue Dateien
watcher.on('add', moveFile)
    .on('error', (error) => console.error(`Watcher Fehler: ${error}`));

console.log(`Überwache das Verzeichnis: ${directoryToWatch}`);