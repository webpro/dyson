REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --require should --reporter $(REPORTER)

testw:
	@NODE_ENV=test ./node_modules/.bin/mocha --require should --reporter min --watch

.PHONY: test
