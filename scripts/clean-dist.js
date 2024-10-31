const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../dist');

fs.readdir(dir, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (file !== '.git') {
            fs.rm(path.join(dir, file), { recursive: true, force: true }, (err) => {
                if (err) throw err;
            });
        }
    });
});
