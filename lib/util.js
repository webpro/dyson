var isTest = function() {
    return process.env.NODE_ENV === 'test';
};

var log = function() {
    if(!isTest()) {
        console.log.apply(console, arguments);
    }
};

module.exports = {
    isTest: isTest,
    log: log
};
