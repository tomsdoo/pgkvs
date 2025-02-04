PGPASSWORD=password
psql -U postgres postgres << EOSQL
create database testdb;
EOSQL
