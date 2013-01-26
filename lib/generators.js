var _ = require('lodash'),
    Canvas = require('canvas');

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
	},
    image: function(opts) {
        var DEFAULT_SIZE = 300;
        opts = opts || {};
        opts = {
            width: opts.width || DEFAULT_SIZE,
            height: opts.height || opts.width || DEFAULT_SIZE,
            text: opts.text || (opts.width || DEFAULT_SIZE) + 'x' + (opts.height || opts.width || DEFAULT_SIZE),
            bgColor: '#' + (opts.bgColor || '999'),
            fgColor: '#' + (opts.fgColor || '666')
        };

        var canvas = new Canvas(opts.width, opts.height),
            ctx = canvas.getContext('2d'),
            fontSize = opts.height / 12,
            textWidth = ((opts.wight + '').length + (opts.width + '').length  + 3) * fontSize;

        ctx.fillStyle = opts.bgColor;
        ctx.fillRect(0, 0, opts.width, opts.height);

        while (textWidth > opts.width) {
            fontSize -= 2;
            textWidth = ((opts.width + '').length + (opts.height + '').length  + 3) * fontSize;
        }

        ctx.font = 'bold ' + fontSize + 'px Lucida Console, Monaco, monospace, sans-serif';
        ctx.fillStyle = opts.fgColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(opts.text, opts.width / 2, opts.height / 2);

        return canvas.toDataURL();
    }
};

module.exports = generators;
