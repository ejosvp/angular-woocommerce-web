AWS := ubuntu@ec2-52-25-11-31.us-west-2.compute.amazonaws.com
DELI_PATH := /home/ubuntu/containers/web

deps:
	npm install
	./node_modules/.bin/bower install

dist:
	./node_modules/.bin/gulp build

build: deps dist

key:
	echo $(AWS_DELI_KEY)

deploy:
	cp Dockerfile docker-compose.yml nginx.default.conf Makefile dist/
	tar -zcf dist.tar.gz dist/
	scp -i $(AWS_DELI_KEY) dist.tar.gz $(AWS):/tmp/dist.tar.gz
	ssh -i $(AWS_DELI_KEY) $(AWS) "mkdir -p $(DELI_PATH) ; \
	                               cd $(DELI_PATH) ; \
	                               tar -zxf /tmp/dist.tar.gz -C $(DELI_PATH) ; \
	                               rm /tmp/dist.tar.gz ; \
	                               cp $(DELI_SSL_CERTS) $(DELI_PATH) ; \
	                               make docker_run"
	rm -rf dist* .tmp

docker_run:
	docker-compose up -d --build

.PHONY: deps dist deploy docker_prepare docker_run