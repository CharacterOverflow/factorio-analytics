# factorio-analytics

#### Server types, usage, and examples

There are 2 types of servers that, together, make up the Public API for Factorio Analytics. You can also run these servers yourself,
which can be useful if you intend to use the API heavily and have free hardware available to use

First, below explains how the servers are laid out and what each does

- Postgres Server
  - Central database for all data - allows multiple workers to submit and use data w/o local database
  - Can be run wherever - due to the amount of raw data, I do NOT recommend running this on the cloud unless you're prepared for the potential costs
  - Logic is implemented for 2 database servers to be used at a time - a 'cache' and a 'storage'
    - This is to allow for a faster database on SSDs to effectively cache the data and provide access for the first 30 days
    - There is a background script that runs daily to archive data older than 30 days to the 'storage' server
    - At this time, the data files are also submitted to S3 for long-term storage
      - Any future calls on the API will just load files from S3
- Ingest Server
  - Started by calling 'scripts/runIngestCluster.js'
  - Runs a cluster of servers intended to ingest data (submissions) and queue new requests
  - This is its own server to allow for better scaling of large uploads that may take time to upload
- Query Server
  - Started by calling 'scripts/runQueryCluster.js'
  - Runs a cluster of servers intended to run queries as needed and return data
  - These servers are how all data is accessed
- Worker Server
  - Started by calling 'scripts/runApiWorker.js'
  - Runs a single instance of a script that only queries the database for tries to run, runs them, and submits results
  - No interaction with the web from here
  - Run as many of these as you want - the more you have, the more

There are some other components not listed
