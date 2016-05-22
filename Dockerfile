FROM nginx

COPY server.key server.crt /etc/nginx/ssl/
COPY nginx.default.conf /etc/nginx/conf.d/default.conf

COPY . /usr/share/nginx/html
