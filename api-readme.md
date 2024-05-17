# factorio-analytics

#### Public API Usage and Examples

The public API is a way to test smaller blueprints - not running heavy, data-intensive operations constantly. 
For that, you should use the local library and your own machine. Not only will it be faster running on a desktop PC, 
but it'll also be far more responsive for your use case if you require massive amounts of data.

This being said, lets discuss the limits of the Public API
- Maximum of 100 requests per 10 seconds
- Minimum tickInterval of 60 (1 second)
- Maximum trial length of 216000 (1 hour)
- If under high load, you may just have to wait.
  - I will be adding more queue and worker information soon

That's all. **There are no other limits!**

I intend to keep the public API free and functional. I want to collect as many functional blueprints as humanly possible, complete with all the data I can get.

I want this to be a open and easily accessible API, to help encourage people to lean into their analytical side and test whatever they want - even if they lack the hardware to do so.

---
### `/query/:id/:variant`

This is a GET method that retrieves various types of data based on the variant provided.

### Request

- `id` (url parameter): The id to be used in data search,
- `variant` (url parameter): The type of data to be retrieved, can be one of several values 
  - ('source_raw', 'status', 'source', 'modlist', 'trial', 'data_item', 'data_electric', 'data_circuit', 'data_pollution', 'data_system', 'data_all').

### Response

- HTTP Status Codes
  - 200 if the operation is successful,
  - 404 if no data is found,
  - 500 if an error occurred during executing the operation,
  - 501 if an error occurred in the endpoint itself.

- Body: Depending on the variant parameter, is one of the corresponding objects, or an error message.

---
### `/check/:id`

This is a GET method that checks if a source with the given id exists.

### Request

- `id` (url parameter): The id of the source to check.

### Response

- HTTP Status Codes
  - 200 if the operation is successful,
  - 404 if no source is found with the given id,
  - 500 if an error occurred during executing the operation.

- Body: A boolean value indicating if the source exists or an error message.

---
### `/analysis/largestTrialForSource/:id`

This is a GET method that retrieves the largest trial for a source.

### Request

- `id` (url parameter): The id of the source.

### Response

- HTTP Status Codes
  - 200 if the operation is successful,
  - 404 if there are no trials for the source,
  - 500 if an error occurred during executing the operation.

- Body: The data object for the largest trial or error message,

---
### `/analysis/defaultTrialForSource/:id`,

This is a GET method that checks if a default trial exists for a source.

The default trial definition may change over time, but it is generally run for 15 minutes polling every 5 seconds

### Request

- `id` (url parameter): The id of the source.

### Response

- HTTP Status Codes
  - 200 if the operation is successful,
  - 404 if there are no default trials for the source,
  - 500 if an error occurred during executing the operation.

- Body: Boolean value indicating if a default trial exists or an error message.

---
### `/quickSubmit`

This is a POST method that accepts a blueprint string and creates a trial based on it.

### Request

- Body: An object that should adhere to the `FactoryApiIngestQuick` interface.
  - `blueprintStr` (string): The blueprint string for the trial. It should be a valid blueprint string as per the `Source.isBlueprintString()` static method.
  -  `modList` TEMPORARILY DISABLED (array of strings, optional): An array of strings specifying the mod list for the blueprint.

### Response

- HTTP Status Codes
  - 200 if the operation is successful and returns an object with the `trialId`, or a `FactoryApiExecutionRequest` object.
  - 400 if the provided blueprint string is invalid.
  - 500 if an error occurred during executing the operation.

---
### `/submit`

This is a POST method that accepts data of various types for processing.

### Request

- Body: An object that should adhere to the `FactoryApiIngest` interface. It should include a `variant` field which determines the type of the data provided. The variant can be 'source', 'trial', or 'modlist'.
  - `variant` (string): The type of the data to be processed. Can be one of: `source` or `trial`
  - `source` (string, required if variant is 'source'): The source data for the trial. Should be a valid blueprint string as per the `Source.isBlueprintString()` static method. Should contain a combinator, infinity chest, or infinity pipe.
  - `modList`TEMPORARILY DISABLED (array of strings, required if variant is 'modlist'): An array of strings specifying the mod list for the blueprint.
  - `trial` (object, required if variant is 'trial'): An object that should adhere to the `ITrialIngest` interface. It specifies details about the trial to be executed.

### Response

- HTTP Status Codes
  - 200 if the operation is successful. Returns an object with the `trialId`, or a `FactoryApiExecutionRequest` object, or the source ID if the variant was 'source'.
  - 400 if the provided data is invalid, incomplete, or the required variant is not supported yet.
  - 500 if an error occurred during executing the operation.
