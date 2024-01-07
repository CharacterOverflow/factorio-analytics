# factorio-analytics

#### Version 2.0.3

A package that gives you in-depth details and statistics normally only seen in-game.

This library utilizes the factorio executable locally, so a copy of Factorio is also required.

### Quick Links

- [Setup](#getting-started)
- [Install](#install-via-npm)
- [Code Examples](#code-examples)
- [Analyze and Use Data](#analyze-and-use-data)
- [Database](#using-a-database-ide)

## Getting Started

### Usage

This package is intended to be used with NodeJS, for server use only. It is meant to be used as an NPM module and called
by other code you must write.

While you CAN use this package for frontend projects (such as with Vue, React, etc), it is recommended to only use and
import Interface definitions. The actual code itself makes file references in some points, and I haven't gone through
to test for compatibility. Use at your own risk!

### Requirements

- Linux (untested on Windows, but should work)
- NodeJS 16+
- CURL installed (if the command 'curl' can be found, you're good)
- TAR installed (if the command 'tar' can be found, you're good)
- A Factorio Blueprint (or savegame) that you want to test / analyze
    - Remember to add Infinity Chests to your blueprint to spawn source items! If your blueprint does not include these
      to provide items, nothing will be done in-game

### Install via NPM

```
$ npm install factorio-analytics
```

You can also download the source and include it in your project directly.

### Setting ENV variables

You can either define these variables in your environment, or by creating a .env file in the root folder.

ENV values that can be set...

- `FACTORIO_INSTALL`
    - The directory to install Factorio in (or installation to use)
- `FACTORIO_USER`
    - The USERNAME on factorio.com to use (NOT email)
- `FACTORIO_TOKEN`
    - The TOKEN found on your profile at https://www.factorio.com/profile
- `FACTORIO_BUILD`
    - The 'build' of Factorio to download, if applicable. Options are 'alpha' or 'headless'
    - Headless is default, and includes no graphical assets. This is the default build for servers
        - If you want to use advanced debugging on blueprints you use (load the test scenario), please use 'alpha'
    - Alpha is the normal build of the game, and requires the game purchased to use! Login after launching is not
      required
- `FACTORIO_VERSION`
    - Version of Factorio to download (if applicable). Defaults to latest stable version
- `FACTORIO_DL_TIMEOUT`
    - After how long a download should be force-stopped - both mods and game download itself

## Basic Explanation

Factorio Analytics is a very simple package in its core logic. There are some core concepts you should understand before
using it. I also recommend looking through the code examples below

- **Source** A Source represents either a Blueprint String or the path to a save game
- **ModList** A ModList is a list of mods and their versions that should be used with a given Source
- **Trial** A Trial is when you run a Source with specific settings to extract data

### How does the 'Trial' process work?

**IF TESTING A BLUEPRINT**

1. Building the Benchmark Scenario for Blueprint
2. Running the Scenario
3. Reading and Analyzing the data

**IF TESTING A SAVEGAME**

1. Move savegame to scenario folder -> Make edits to convert to benchmark scenario
2. Running the Scenario
3. Reading and Analyzing the data

The process of 'running the scenario' is done by calling the Factorio executable with specific parameters including
the 'benchmark'
command. This command will run the game at maximum speed for your hardware, as it's intended as a stress test

Once a Trial has been run, data is available in the '{installDir}/script-output/data/' folder as individual .JSONL files
by category

You can then use the built-in 'Analyze' functionality to read and analyze this data, or use the files for your own
purpose

## Code Examples

### Starting the Factory

Starting the Factory is easy, and only needs to be done once per runtime

This will only initialize the most basic requirements + FactorioAPI (for Downloading and version checking)

Other classes you can 'initialize' are...

- FactoryDatabase
    - This will initialize the database connection, and allow you to save Sources, Trials, Modlists, and resulting
      datasets to a DB
- FactoryBackend
    - This will initialize an API backend, allowing you to use the Factory as a service for other applications

Shown below is the default (using ENV variables)

```ts
import {FactoryBackend} from "./FactoryBackend";

await Factory.initialize({

    // Your factorio.com username (not email)
    username: process.env.FACTORIO_USER,

    // Your factorio.com token, found on your profile page. Required for mod downloading and game install
    token: process.env.FACTORIO_TOKEN,

    // INSTALL DIR of factorio - inside this folder should be others like 'bin' and 'data'
    installDir: process.env.FACTORIO_INSTALL,

    // DATA DIR of factorio - inside this folder should be others like 'mods' and 'scenarios'. This is the user information about factorio
    // NOTE 2 - If you are using Steam install, THIS WILL BE DIFFERENT than installDir
    dataPir: process.env.FACTORIO_INSTALL,

    // List of mods that you want to include. If FACTORIO_SET_MODS is true, only these mods will be used and a new mod-list.json file created
    // If FACTORIO_DL_MODS = false, you will need to download the mods yourself and ensure some version of them exists in the /mods folder
    mods: [/*'flib', 'Krastorio2', 'Krastorio2Assets'*/],

    // Whether or not we want to hide console logs to the user. Will still be written to file factory.log no matter what
    hideConsole: false
});

// OPTIONAL BELOW - include if you want these features
// Initialize database - by default, uses SQLITE - will EVENTUALLY be able to  use postgresql as well
await FactoryDatabase.initialize();

// Initialize API backend
await FactoryBackend.startServer(3001);

```

### Set up a Blueprint Source

The first step is to define what you want to test - in this example, a blueprint string.

```ts
// Load Source requirements
const bpFile = path.join(process.cwd(), 'factory/examples/45spm_base.bp');
const bpString = await fs.readFile(bpFile, 'utf8');

// Create a Source for your blueprint string
let mySource = new Source({
    name: '45spm_base',
    variant: 'blueprint',
    text: bpString,
    tags: ['test', 'test2'],
    desc: `Loaded from ${bpFile}`
})

// Save the Source to the database - OPTIONAL, but useful for tracking and recommended
mySource = await FactoryDatabase.saveSource(mySource)
```

### Set up a Blueprint Trial

Now that we have a Source, we can create a Trial to run it with specific settings

The only required parameter is 'source' and at least one 'record[type]' field, defaults will fill the rest

```ts
    // Create a Trial object
let myTrial = new Trial({
    name: '45spm_base Trial 1',
    desc: 'Trial run for items and pollution - every second for 1 hour',
    source: mySource,
    length: 216000,
    tickInterval: 60,
    recordItems: true,
    // recordElectric: false, // CURRENTLY DISABLED, NOT FUNCTIONAL YET
    recordCircuits: false,
    recordPollution: true,
    recordSystem: false,
    initialBots: 50
})

// Save the Trial to the database - OPTIONAL, but useful for tracking and recommended
myTrial = await FactoryDatabase.saveTrial(myTrial)
```

### Analyze and Use Data

View all output data types [here](dist/src/Dataset.d.ts)

```ts
// Analyze the trial
// This will not only run the trial, but also clean up any/all data files.
// All data files will be parsed, optionally saved to the database, summarized, and then deleted
let results = await Factory.analyzeTrial(myTrial, true, true)

// write the outputting result dataset - contains all data by category
console.log(results)
```

### Run without Analysis, raw data

If this throws errors, there is likely something incorrect with your factorio install / paths provided to the install

```ts
// Run the trial
// NOTE - Running a trial is the RAW method of running a trial - it will not analyze or load any of the resulting data
// ONLY use 'runTrial' if you want to use the raw .jsonl files yourself
await Factory.runTrial(myTrial)

// write the filenames of data to the console - do whatever you want with this data!
console.log(myTrial.dataFiles)

```

### Accessing your local database directly
If you want to write queries yourself to analyze trials, you can open the sqlite database directly

The database will only exist if you have initialized the database as shown below

```ts

// Initialize the database
await FactoryDatabase.initialize()
```

From NodeJS, 
You can save or load any database objects like this...

```ts
// Save a Source to the database
let saveSource = await FactoryDatabase.saveSource(mySource)

// Load a Source from the database
let loadSource = await FactoryDatabase.loadSource('sourceidhere')
```


To save data from a trial into the database, I recommend adding the following parameters to the 'analyzeTrial' command

```ts
// Analyze the trial
// 2nd param is for summaries - metadata that gets saved in the header
// 3rd param is for 'saveToDB' - automatically saves to database
await Factory.analyzeTrial(myTrial, true, true)
```

Once you analyze a trial as shown above, the database can be located at `{installDir}/factory-storage/factory.db`

#### Using A Database IDE
I prefer using DataGrip, but that's mostly because I use it for everything else. This is a paid product however.
SQLite Browser is a free alternative that should work just as well for queries

- DataGrip
  - File -> New -> Data Source -> SQLite
  - Enter the path to the database file in the 'file' field. Click Test Connection / Install Drivers as needed
  - Click Apply and OK
- SQLite Browser
  - I have not used this myself, but it is the SQLite provided tool for viewing a database file
  - Completely free, view instructions here on how to use it
  - https://sqlitebrowser.org/

#### Database Structure and Query Examples

The database is very simple, and only has 8 tables

- dataset_circuit
- dataset_electric
- dataset_item
- dataset_pollution
- dataset_system
- modlist
- source
- trial

Examples of some queries that I've found useful


Query to list all trials in your database. Extremely basic example
```sqlite
select * from trial order by createdAt desc
```
Query to retrieve all item information for a trial, grouped by 5 minute buckets
```sqlite
SELECT
    trialId,
    label,
    ROUND(tick / 18000) * 18000 AS tickBucket,
    SUM(cons) AS totalCons,
    SUM(prod) AS totalProd
FROM dataset_items
WHERE trialId = 'cfe98871-210f-40a5-a478-82258f0b21f1'
GROUP BY trialId, label, tickBucket;
```
Query to look at ALL trials of a given source. This is more complex -
1. Inner query groups all data by trial and calculates sums for each bucket
2. Outer query removes the trial id by grouping by label and tickBucket
   Final result - combined outputs from multiple trials of the same source
```sqlite
select label, tickBucket, avg(totalCons) as 'averageCons', avg(totalProd) as 'averageProd'
From (select
             label,
             ROUND(tick / 18000) * 18000 AS tickBucket,
             SUM(cons)                   AS totalCons,
             SUM(prod)                   AS totalProd
      from trial t
               left join dataset_items di ON (di.trialId = t.id)
      where sourceId = '94aab6543bea11d0a6c20e69b6cf7d3a75587ffa6d1d1e26e86c88a20b476447'
      GROUP BY t.id, label, tickBucket) g
group by label, tickBucket;
```
### License

**GNU GENERAL PUBLIC LICENSE**

See 'LICENSE' in root directory

### Other

Version 2.0.3 - 1/4/2024
There have been some major changes in version 2 compared to 1 - make sure you read above before updating

The lua scenario in this package is aggressive and heavy-handed in its approach to data collection - it slows down the
trial time significantly if all data is collected for a long period of time. Would love to work with Factorio devs on
getting a better / more efficient way to collect this data (AND better way to place a blueprint in lua would be nice...)
