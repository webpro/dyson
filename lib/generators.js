var _ = require('lodash'),
    when = require('when'),
    imageRequest = require('./imageRequest');

var imageBase = '//localhost:3000/image/';

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
    random: _.random,
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
	},
    image: {
        src: function(options) {
            return imageBase + options.width + (options.height ? 'x' + options.height : '');
        },
        base64: function(options) {
            var deferred = when.defer();
            imageRequest.imageRequest(options).then(function(image) {
                deferred.resolve('data:' + image.mimeType + ';base64,' + image.buffer.toString('base64'));
            }, function(error) {
                deferred.resolve(error.message);
            });
            return deferred.promise;
        }
    }
};

module.exports = generators;
