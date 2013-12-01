var isTest = function() {
    return process.env.NODE_ENV === 'test';
};

var log = function() {
    if(!isTest()) {
        console.log.apply(console, arguments);
    }
};

var options = Object.create({
	set: function(opts) {
		this.options = opts;
	},
	get: function(key) {
		return this.options[key];
	}
});

module.exports = {
	options: options,
    isTest: isTest,
    log: log
};
