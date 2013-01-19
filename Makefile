REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --require should --reporter $(REPORTER)

.PHONY: test
