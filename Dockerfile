FROM postgres:alpine

WORKDIR /
COPY docker-entrypoint-initdb.d/makedb.sh /docker-entrypoint-initdb.d/
CMD ["postgres"]
