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

NOTE: The name/descriptions of blueprints are stripped from the source to ensure uniqueness. ONLY THE ENTITIES AND TILES ARE SAVED

The response for creating a trial is an object that contains the executionID and trialID

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
