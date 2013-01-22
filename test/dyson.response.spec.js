var request = require('supertest'),
    dyson = require('../lib/dyson'),
    configDefaults = require('../lib/response');

describe('dyson.response', function() {

    describe('.setValues', function() {

        it('should render data based on template', function() {

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
                }
            };

            var actual = configDefaults.setValues(template);

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
                }
            };

            actual.should.eql(expected);
        })
    });
});
