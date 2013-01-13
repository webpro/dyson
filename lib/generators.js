var _ = require('lodash');

var data = {
    alpha: 'abcdefghijklmnopqrstuvwxyz'.split(''),
	name: ['John', 'David', 'Jack', 'Aaron', 'Harry', 'Oliver', 'Charlie', 'Amelia', 'Olivia', 'Lily', 'Jessica', 'Emily', 'Sophie', 'Grace'],
	city: ['London', 'Los Angeles', 'Moscow', 'Beijing', 'Buenos Aires', 'Cairo', 'Istanbul', 'Jakarta', 'Tokyo', 'Seoul', 'Mumbai', 'Shanghai', 'Mexico City'],
    lorem: 'lorem ipsum dolor sit amet consectetur adipiscing elit morbi porttitor nunc neque suspendisse vitae velit eu odio pulvinar facilisis consequat et urna pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas donec ut justo turpis praesent sollicitudin diam convallis aliquet scelerisque ante urna lacinia lacus vel'.split(' ')
};

var pickRandom = function(list) {
	return list[_.random(list.length-1)];
};

var generators = {
	id: function() {
		return _.uniqueId();
	},
    name: function() {
        return pickRandom(data.name);
    },
    lorem: {
        short: function() {
            return _.range(6).map(function() { return pickRandom(data.lorem); }).join(' ');
        }
    },
    address: {
        city: function() {
            return pickRandom(data.city);
        },
        zipUS: function() {
            return '' + _.random(10000,99999);
        },
        zipNL: function() {
            return _.random(1000,9999) + ' ' + (pickRandom(data.alpha) + pickRandom(data.alpha)).toUpperCase();
        }
    },
	time: {
		quarter: function() {
			return pickRandom([0, 15, 30, 45]);
		},
		hour: function() {
			return _.random(23);
		},
		byQuarter: function() {
			return ('0' + generators.time.hour()).slice(-2) + ':' + ('0' + generators.time.quarter()).slice(-2);
		}
	}
};

module.exports = generators;
