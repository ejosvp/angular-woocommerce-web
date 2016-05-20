npm_install:
	npm install

bower_install:
	./node_modules/.bin/bower install --allow-root

gulp_build:
	./node_modules/.bin/gulp build

build_app: npm_install bower_install gulp_build

build:
	docker build -f build.Dockerfile -t deli-web-builder:latest .
	docker run --rm -v "$PWD":/usr/src/app deli-web-builder

deploy:
	docker-compose up -d --build

.PHONY: build_app build npm_install bower_install gulp_build
.PHONY: deploy