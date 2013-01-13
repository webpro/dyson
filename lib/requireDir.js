var fs = require('fs'),
    path = require('path');

module.exports = function(dir) {
    if(!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) return;
    return fs.readdirSync(dir).map(function(element) {
        var file = path.join(dir, element), stats = fs.statSync(file);
        return stats && stats.isFile() ? require(path.join(dir, path.basename(file, '.js'))) : false;
    });
};
