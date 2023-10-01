# factorio-analytics

A package that gives you in-depth details and statistics normally only seen in-game. 

This library utilizes the factorio executable locally, so a copy of Factorio is also required.

### Recommended Setup

- Linux (untested on Windows)
- Set FACTORIO_USER and FACTORIO_TOKEN ENV variables to your username and factorio.com API token
  - This token is used to download the game and mods
  - Available at: https://www.factorio.com/profile
  - If you do NOT provide a FACTORIO_USER and FACTORIO_TOKEN, only the server (headless) version can be used, and no mods will be downloaded
- Set FACTORIO_INSTALL ENV variable to a folder to use for installing Factorio
  - I recommend using an EMPTY FOLDER, and letting the code install and use the game itself
  - If you choose, you can identify an existing install of Factorio (NON-STEAM)
- A Factorio Blueprint (or savegame) that you want to test / analyze
  - Remember to add Infinity Chests to your blueprint to spawn source items! If your blueprint does not include these to provide items, nothing will be done in-game

#### Coming soon

- TSDoc documentation and site
- Unit Testing using AVA
- More repositories that will manage API/CLI usage, while this repository focuses on core functionality

## Getting Started

### Usage
This package is intended to be used with NodeJS, for server use only. It is meant to be used as an NPM module and called
by other code you must write. 

In the future, there will be a dedicated repository to API and CLI usage - this repository is only supposed to represent core processes

### Install via NPM

```
$ npm install factorio-analytics
```

### Setting ENV variables
You can either define these variables in your environment, or by creating a .env file in the root folder.

ENV values that can be set...
- `FACTORIO_INSTALL`
  - The directory to install Factorio in (or installation to use)
- `FACTORIO_USER`
  - The USERNAME on factorio.com to use
- `FACTORIO_TOKEN`
  - The TOKEN found on your profile at https://www.factorio.com/profile
- `FACTORIO_BUILD`
  - The 'build' of Factorio to download, if applicable. 'alpha' or 'headless'
  - Alpha is the normal build of the game, and requires the game purchased to use!
- `FACTORIO_SET_MODS`
  - Determines if the process can modify mod-list.json. If false, will only obey mod list from mod-list.json, not code
  - If you are providing mod names in code during initialization, set this to true
- `FACTORIO_DL_MODS`
  - Whether or not we are allowed to download mods
  - If you need specific versions of mods or the game, set this to false
- `FACTORIO_DL_TIMEOUT`
  - After how long a download should be force-stopped - both mods and game download itself

**NOTE** As of version  2.0, all options except for FACTORIO_SET_MODS, FACTORIO_DL_MODS, and FACTORIO_DL_TIMEOUT can be
set during the 'Factory.initialization' call

### Starting the Factory

The only hard 'requirement' for starting the factory is setting 'installDir' - which is set by process.env.FACTORIO_INSTALL by default if not provided

The example below shows a setup with barebones 'Krastorio2' installed. To run 'vanilla' and force-clear any mods, 
ensure FACTORIO_SET_MODS = true and that the mods array is empty or undefined

Mods MUST be defined during initialization, and any trials run afterwards will use these mods. This is to ensure steps like
compiling the scenario are done WITH the specified mods, preventing mismatch and migration (slowdowns) when re-using this scenario for future trials

```ts
await Factory.initialize({
    // INSTALL DIR of factorio - inside this folder should be others like 'bin' and 'data'
    installDir: process.env.FACTORIO_INSTALL,

    // DATA DIR of factorio - inside this folder should be others like 'mods' and 'scenarios'. This is the user information about factorio
    // NOTE - If you have installed Factorio to a custom location yourself, this will be the same as the installDir
    // NOTE 2 - If you are using Steam install, THIS WILL BE DIFFERENT than installDir
    dataPir: process.env.FACTORIO_INSTALL,
    
    // List of mods that you want to include. If FACTORIO_SET_MODS is true, only these mods will be used and a new mod-list.json file created
    // If FACTORIO_DL_MODS = false, you will need to download the mods yourself and ensure some version of them exists in the /mods folder
    mods: ['flib','Krastorio2','Krastorio2Assets'],

    // Whether or not we want to hide console logs to the user. Will still be written to file factory.log no matter what
    hideConsole: false
});
```

### Set up a Blueprint Trial

The first step is to define what you want to test - you need to provide at minimum the Blueprint string, length of the trial, and at least 1 Interval set depending on what data you would like to export about your factory.

_This assumes a file 'filename.bp' exists with your blueprint string inside_

```ts
let bp = fs.readFileSync('filename.bp', 'utf8');

let t = new Trial({
  // Either a reference to the blueprint object, or a blueprint string itself to run
  bp,
  
  // The name of the scenario to use, if you want to specify a custom one. Defaults to 'scenario-source' for basic benchmarking
  // If you want to benchmark an existing SAVEGAME, specify the savegame name (including .zip)
  scenario: 'scenario-source',  // MYSAVEGAME_FILE.zip for savegames

  // how long (ticks) the trial will run for. Remember, factorio is locked at 60 ticks per second
  length: 108000,

  // how many ticks between item data polls (Items/fluids produced and consumed across the factory)
  itemInterval: 300,

  // how many ticks between elec data polls (The power usage and production of the factory, per network)
  elecInterval: 60,

  // how many ticks between circ data polls (Each circuit network, and the signals on it)
  circInterval: 300,

  // how many ticks between Pollution data polls (The pollution of the factory, total)
  pollInterval: 900,

  // how many ticks of performance info should be grouped together (Perf info is recorded every tick by default)
  sysInterval: 300,

  // how many logistic bots to start roboports with. If left as is, none will be placed
  initialBots: 300,

  // If true, the trial does no processing after the fact. Data is left raw, no files are moved. Remember to clean up!
  raw: false
});
```

### Run a Blueprint Trial
If this throws errors, there is likely something incorrect with your factorio install / paths provided to the install
```ts
let t = new Trial({/*see above*/});

// Have the factory run your blueprint trial - depending on your PC and the settings for the Trial, this can take some time.
await Factory.runTrial(t);

// Write out to a file to explore the data, or do whatever you want to otherwise utilize this information.
// Results are stored in the 'Data' object, see below for more details
fs.writeFileSync('output.json', t.data);

```
### Analyze and Use Data
View all output data types [here](dist/src/Dataset.d.ts)
```ts
// After running the trial, data is available...
let d: Dataset = trial.data;

// processed data aligned with tickrate is available in respective variables... 
// each below is an array potentially thousands long, containing values over time (in ticks)
// See types at 
let export = {
    itemStats: d.itemStats, // IGameFlowTick
    elecStats: d.elecStats, // IGameElectricTick
    circStats: d.circStats, // IGameCircuitTick
    pollStats: d.pollStats, // IGamePollutionTick
    sysStats: d.sysStats,   // ISystemTick
}

// If you choose to export raw files (NOT process data, keeping it raw) then the files variable will be set, 
// containing the absolute filepath to the raw data
console.log(d.files);

// Lastly, you can use some helper functions on the Dataset to help provide fast information, such as...
// compare to if we do it all-in-one
let ratioIronToCoal = data
        .get({category: 'item', label: 'iron-plate', spec: 'prod'})
        .per({category: 'item', label: 'coal', spec: 'cons'});

// or...
let inserterPowerRatio = data
        .get({category: 'electric', label: 'inserter', spec: 'cons'})
        .per({category: 'electric', label: 'all', spec: 'cons'});

// NOTE - you MUST be recording the needed data with the trial for certain functionality to work. For example, you cannot
// calculate the 'inserterPowerRatio' above without recording elecStats (make sure elecInterval is defined)
```

### The 'Dataset' that is returned from running a trial can look something like this...

![Example_Output.png](Example_Output.png)

## Advanced 

As of Version 2.0, Scenario and Mod handling has been 100% overhauled. You can now specify your own custom scenario to use for benchmarking,
and have mods automatically download based on mod names specific in-application, or from mod-list.json

In addition, you can also benchmark your own savegame if you so desire! Pretty cool! Just specify the savegame you want to test
as 'scenarioName' (including .zip), ensure the save file is in the /saves folder, then run! See script 'scripts/runSave.js'

### Mods

Mods are automatically downloaded (assuming you provide a FACTORIO_TOKEN and FACTORIO_DL_MODS is not false)

If 'mods' array is empty or undefined and FACTORIO_SET_MODS is not false, 'vanilla' factorio will be used

If FACTORIO_SET_MODS is false and FACTORIO_DL_MODS is true, then the existing mod-list.json file will be used

### Compiling your own benchmark scenario

Really want to benchmark an awesome mining setup? Or simulate how your wall would work with enemies spawned in at certain coordinates?

You can do that! You just need to be willing to craft your own scenario, following these steps below...

FIRST OFF, I recommend making sure that the Factorio install used for this process is the 'ALPHA' version, meaning 'graphics' release. You can set this as the version to download by setting FACTORIO_BUILD=alpha in ENV.
Having the graphical version to use will allow us to launch the game, edit a scenario, and save it as a copy all without dealing with files.

To create your own custom scenario...
1. Open your Install directory (FACTORIO_INSTALL).
   - Open bin/x64/factorio (factorio.exe on Windows)
2. After Factorio loads, go to 'Map Editor'
3. Click 'Edit Scenario'
4. Choose 'scenario-source'
   - This is the 'source' scenario, which is considered default. I recommend using this for ALL custom benchmark scenarios
5. Click 'Save As', then save it as some other scenario (NO SPACES, NO SPECIAL CHARACTERS BESIDES _)
6. Now, go crazy and customize the scenario. Add in biters manually, add physical features, forests, ore, water, whatever your heart desires.
   - Be aware - blueprint gets placed at EXACTLY 0,0 centered.
7. Once changes are done, make sure you click 'save'
8. In code, you can now specify your scenarioName and it will be used

## CLI Usage

### _CLI Usage is being depreciated in this package, and will instead be handled by factorio-analytics-cli_
### Use at your own risk!
**These scripts may be outdated and lack some functionality, but should still work so long as Factorio is already installed and 
mods are either set up manually, or not used at all**

Want to use all this functionality in a different application, or just otherwise access it via CLI? There are 2 premade scripts that you can use.

**NOTE** YOU MUST SPECIFY THE ENVIRONMENT VARIABLE FACTORIO_INSTALL

#### buildTrial

This command will 'build' a given trial, which essentially sets it up to be run. From here, you can then launch the Factorio
executable yourself and view the trial live!

_(note, this is mostly for debugging)_

```plantuml
node /path/to/package/factorio-analytics/dist/scripts/buildTrial.js 
--bpFile /path/to/package/factorio-analytics/factory/examples/smallbasev2.txt
--length 108000 
--item 300
--elec 60
--circ 300
--pollution 900
--sys 300
--raw false
```


#### runTrial

This command will first 'build' a trial with your parameters, then command the Factory to 'run' the trial and output data to a specific file location.
If no file location is specified, it will be written to the current directory instead with an ID filename.

```plantuml
node /path/to/package/factorio-analytics/dist/scripts/runTrial.js 
--bpFile /path/to/package/factorio-analytics/factory/examples/smallbasev2.txt
--length 108000 
--item 300
--elec 60
--circ 300
--pollution 900
--sys 300
--raw false
--file /path/to/output/output.json
```

### License
**GNU GENERAL PUBLIC LICENSE**

See 'LICENSE' in root directory

### Other

Version 2.0 has some major changes overall, if you were using this package prior to 8/25/2023 and want to go back, I recommend
going back to version 1.2.3

In the future, the concept of 'mods' will likely be moved into Trial like 'scenario' has been in 2.0

I need to figure out how to read the modlist from an existing save file first before this can occur though
