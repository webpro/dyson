REPORTER = spec

test:
	@cross-env NODE_ENV=test ./node_modules/.bin/mocha --require should --reporter spec

testw:
	@cross-env NODE_ENV=test ./node_modules/.bin/mocha --require should --reporter min --watch

.PHONY: test
