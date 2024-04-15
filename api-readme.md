# factorio-analytics

#### Public API Usage and Examples

The public API is a way to test smaller blueprints - not running heavy, data-intensive operations constantly. 
For that, you should use the local library and your own machine. Not only will it be faster running on a desktop PC, 
but it'll also be far more responsive for your use case if you require massive amounts of data.

This being said, lets discuss the limits of the Public API
- Maximum of 100 requests per 10 seconds
- If under high load, trials that are too high 'cost' will return an error on trial creation

That's all. **There are no other limits!**

I intend to keep the public API free and functional so long as a trial to run a blueprint can be submitted and 'run' within 5 minutes. 

If the queue gets too long and large blueprints are holding up the line - even with the Watchdog cancelling long-running trials - I will have to limit the length and size of trials that are allowed

I want this to be a open and easily accessible API, to help encourage people to lean into their analytical side and test whatever they want - even if they lack the hardware to do so.

## Usage

For the most part, there are 2 paths for the API:

#### /submit (POST)
The rest of the params for 'submit' should be contained in the body of the request.

Body Params:
- variant: string (required) 
  - ['trial','source'] are valid options for now ('modlist' will be added later)
- source: string
  - The blueprint string of the source (if variant is 'source')
- trial: ITrialIngest (params for the trial)
  - source: string (ID)
  - length: number
  - tickInterval: number
  - recordItems: boolean
  - recordElectric: boolean
  - recordCircuit: boolean
  - recordPollution: boolean
  - recordSystem: boolean

The response for creating a source is an ID representing that source.

NOTES: 
- The name/descriptions/tags of blueprints are stripped from the source to ensure uniqueness. ONLY THE ENTITIES AND TILES ARE SAVED
- If the blueprint string would not produce any results anyways (lack of resources, no infinity chests OR no infinity pipes OR no combinators, etc), it will return an error (BAD REQUEST)
  - Remember - this process will only simulate what you give it in-game for a set amount of time
  - If you need resources to benchmark, it is REQUIRED to add infinity chests and/or infinity pipes
  - If you are testing only circuits, it is allowable to not have any infinity-[objects]

The response for creating a trial is an object that contains the executionID and trialID

#### /quickSubmit (POST)
The rest of the params for 'quickSubmit' should be contained in the body of the request

This path is a shortcut for submitting a blueprint with a set of default parameters for the trial. The trial is
automatically queued up for execution.

Body Params:
- blueprintStr: string (required)
  - The blueprint string of the source
- modList: string[]
  - An array of mod names that are required for the blueprint

#### /query/:id/:variant (GET)
All parameters here are contained in the URL -  **no query parameters are used**.

URL Params:
- variant: string (required)
  - ['status','source','modlist','trial','data_item','data_electric','data_circuit','data_pollution','data_system', 'data_all'] are valid options for now
- id: string (required)
  - Depending on the variant, this can represent the executionID, trialID, sourceID, or modlistID
  - executionID
    - status
  - trialID
    - trial
    - data_item
    - data_electric
    - data_circuit
    - data_pollution
    - data_system
  - sourceID
    - source
