AWS := ubuntu@ec2-52-25-11-31.us-west-2.compute.amazonaws.com
DELI_PATH := /home/ubuntu/deli-web

npm_install:
	npm install

bower_install:
	./node_modules/.bin/bower install --allow-root

gulp_build:
	./node_modules/.bin/gulp build

build: npm_install bower_install gulp_build

deploy:
	tar -zcf dist.tar.gz dist/
	scp -i $(AWS_DELI_KEY) dist.tar.gz $(AWS):/tmp/dist.tar.gz
	ssh -i $(AWS_DELI_KEY) $(AWS) "cd $(DELI_PATH) ; make init_prod_deploy"
	rm dist.tar.gz

init_prod_deploy: update_source build_prod

update_source:
	git pull --rebase

build_prod:
	tar -zxf /tmp/dist.tar.gz -C $(DELI_PATH)
	docker-compose up -d --build

.PHONY: build npm_install bower_install gulp_build
.PHONY: deploy docker_up