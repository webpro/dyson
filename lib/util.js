const isTest = () => {
    return process.env.NODE_ENV === 'test';
};

const log = function() {
    if(!isTest()) {
        console.log.apply(console, arguments);
    }
};

const error = function() {
    console.error.apply(console, arguments);
};


class Options {
    constructor() {
        this.options = {};
    }
    set(opts) {
        this.options = opts;
    }
    get(key) {
        return this.options[key];
    }
}

module.exports = {
    options: new Options(),
    isTest,
    log,
    error
};
