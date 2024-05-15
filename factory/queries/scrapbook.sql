select *
from trial
order by created_at desc;

select *
from source

select *
from factory_request

select *
from factory_status

select fs.*, fr.trial_id, fr.allocated_at
from public.factory_status fs
         inner join public.factory_request fr ON (fr.execution_id = CAST(fs.execution_id as uuid))
where fs.execution_id = '65fd1297-8ed3-4dda-95d8-2aafffe5579b'

/*

*/

select *
from public.trial
where "sourceId" = '94aab6543bea11d0a6c20e69b6cf7d3a75587ffa6d1d1e26e86c88a20b476447'
and length = 36000 and tick_interval = 300 and initial_bots = 200

-- truncate table public.source cascade;
-- truncate table public.modlist cascade;
-- truncate table public.trial cascade;
-- truncate table public.factory_request cascade;
-- truncate table public.factory_status cascade;
--
-- truncate table public.dataset_pollution;
-- truncate table public.dataset_system;
-- truncate table public.dataset_circuit;
-- truncate table public.dataset_items;
-- truncate table public.dataset_electric;

'cc2ab46d-6e2c-4bb0-809a-3f0149fec5c0'

select AVG(cons) / 5, AVG(prod) / 5 from public.dataset_items where trial_id = 'cc2ab46d-6e2c-4bb0-809a-3f0149fec5c0' and label = 'copper-cable'

select * from public.dataset_pollution where trial_id  = 'cc2ab46d-6e2c-4bb0-809a-3f0149fec5c0'

/*
1. need a page for source, with top 5 trials listed (by length / interval) - so, most data at time
2. need to have above check for new trial completion. Show pending trials as loading. User can click to open any trials
3. need details for trial page on execution status and what to show if trial isn't run yet
4. need manual submissions of blueprints wiht custom parameters - so, a modal to input trial info (given source) then submit to run new trial
5. Need to add catch for running blueprints without infinity chests or combinators. Should trigger on backend during blueprint submission
    - this error SHOULD also display a popup telling the user why (there will be no data - no items moving)
6. Make 'Server status' page to show all running workers, and their total queue size overall

1. Need a submit-and-run-params-trial as well (like quick submit, but with trial params)
--- OR, just do submit normal, then trial run normal
*/

select length * trial.tick_interval / 1000, * from trial

/*
1. OBFUSCATE trial on the public site at least. Keep trial as a concept everywhere still
2. Set up logic to not re-run a given trial that is identical to another for this same source
    - going to need a query for this i think


change UI to say 'Open Blueprint', asking for a SourceID. No more trial lookups!
Make the 'trial' page appear on the 'Source' page
When the 'trial' page loads, load a specific trial of specific settings for display on the public API
    - If no trial exists, makes one and runs it
    - If the source in particular doesn't exist, throw error

*/

/*
Frontend management
1. have a map to point the actual key => value
2. have a queue that you add records to of just trialId mapped to 'addedAt' time
-- when adding to the queue, runs GC process to remove last record if over the cap of 5.
    --- When that record is removed, it should also clear the value in the map
*/

select *, length(text) from public.source;

