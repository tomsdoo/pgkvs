FROM postgres:alpine

WORKDIR /
COPY docker/docker-entrypoint-initdb.d/makedb.sh /docker-entrypoint-initdb.d/
CMD ["postgres"]
