const fs = require('fs');
const path = require('path');

function listDirectories(dir, indent = '') {
    const files = fs.readdirSync(dir);
    const total = files.length;

    files.forEach((file, index) => {
        if (file !== 'node_modules' && file !== '.git') {
            const fullPath = path.join(dir, file);
            const stats = fs.statSync(fullPath);
            const isDirectory = stats.isDirectory();

            // Determine the prefix to use based on whether it's the last item
            let prefix = '';
            if (index === total - 1) {
                prefix = isDirectory ? '└── ' : '└── ';
            } else {
                prefix = isDirectory ? '├── ' : '├── ';
            }

            // Print current directory/file with appropriate indentation
            console.log(indent + prefix + file);

            if (isDirectory) {
                const nextIndent = indent + (index === total - 1 ? '    ' : '│   ');
                listDirectories(fullPath, nextIndent); // Recursively list directories
            }
        }
    });
}
listDirectories(path.join(__dirname, '..'));