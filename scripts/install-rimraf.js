const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.resolve(__dirname, '..', 'node_modules', 'rimraf', 'package.json');

console.log('Checking package.json path:', packageJsonPath);

if (!fs.existsSync(packageJsonPath)) {
    console.log('rimraf is not installed. Installing...');
    exec('npm install --save-dev rimraf', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing rimraf: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log(stdout);
    });
}
