# factorio-analytics

#### Docker Servicec Usage and Examples

There are 3 service types depending on needs
- **Ingest**: This service is responsible for downloading submissions from users, separate to ensure no conflicts with large uploads
- **Query**: This service is responsible for handling all queries and responses to the user
- **Worker**: This service is responsible for running the trials and returning the results to the database. NO interaction with web

This is the structure of the factorioanalytics public API

There are 2 databases used with these services - **CACHE** and **STORAGE**
- Both are PostgresQL v15
- The only reason there EXISTS a separation is because of my own server hardware limitations
- Storage database is NOT YET IMPLEMENTED, but this can change very quickly.
  - When a process is set up using it, the notes will be listed here

## Required ENV Variables

PG_CACHE_HOST - The hostname of the cache database
PG_CACHE_PORT - The port of the cache database
PG_CACHE_USER - The username of the cache database
PG_CACHE_PASS - The password of the cache database
PG_STORAGE_HOST - The hostname of the storage database
PG_STORAGE_PORT - The port of the storage database
PG_STORAGE_USER - The username of the storage database
PG_STORAGE_PASS - The password of the storage database
FACTORIO_USER - The username of the Factorio account
FACTORIO_TOKEN - The token of the Factorio account
AWS_ACCESS_ID - The AWS S3 Bucket Access ID
AWS_SECRET_KEY - The AWS S3 Bucket Secret Key

