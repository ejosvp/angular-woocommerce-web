build:
	npm install
	./node_modules/.bin/bower install
	./node_modules/.bin/gulp build
	docker-compose up -d --build

.PHONY: build