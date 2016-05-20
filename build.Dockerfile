FROM node:6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

VOLUME ["/usr/src/app"]

CMD [ "make", "build_app" ]