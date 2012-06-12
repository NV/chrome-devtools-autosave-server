var fs = require('fs');

if (process.env.HOME && isDirectory(process.env.HOME + '/Library/LaunchAgents/') || isDirectory('/etc/init')) {
    process.stdout.write('To start autosave on OS launch run:\n' +
    '    npm run-script -g autosave autostart\n');
}

function isDirectory(path) {
    var lstat = fs.lstatSync(path);
    return lstat.isDirectory();
}
