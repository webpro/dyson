var request = require('supertest'),
    dyson = require('../lib/dyson'),
    when = require('when'),
    configDefaults = require('../lib/response');

describe('dyson.response', function() {

    describe('.setValues', function() {

        it('should render data based on template', function(done) {

            var template = {
                myFunction: function() {
                    return 'my function';
                },
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1,2,3],
                myObject: {
                    myNestedObject: {
                        myOtherFunction: function() {
                            return 'my other function'
                        },
                        myOtherString: 'my other string'
                    }
                },
                myPromise: function() {
                    var deferred = when.defer();
                    setTimeout(function() {
                        deferred.resolve('my promise');
                    }, 10);
                    return deferred.promise;
                }
            };

            var expected = {
                myFunction: 'my function',
                myString: 'my string',
                myBoolean: true,
                myNumber: 42,
                myArray: [1,2,3],
                myObject: {
                    myNestedObject: {
                        myOtherFunction: 'my other function',
                        myOtherString: 'my other string'
                    }
                },
                myPromise: 'my promise'
            };

            configDefaults.setValues(template).then(function(actual) {

                actual.should.eql(expected);
                done();

            });
        })
    });
});
