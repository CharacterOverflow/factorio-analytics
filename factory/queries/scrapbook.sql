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
where fs.execution_id = '65fd1297-8ed3-4dda-95d8-2aafffe5579b';

select label, MIN(tick) as tick  from public.dataset_items where trial_id = '034851c7-b56f-4cbc-9e38-b0dde66afcaa' and label like '%science%' group by label

select * from public.trial where source

select *
from public.trial
where "sourceId" = '94aab6543bea11d0a6c20e69b6cf7d3a75587ffa6d1d1e26e86c88a20b476447'
and length = 36000 and tick_interval = 300 and initial_bots = 200

select AVG(cons) / 5, AVG(prod) / 5 from public.dataset_items where trial_id = 'cc2ab46d-6e2c-4bb0-809a-3f0149fec5c0' and label = 'copper-cable'

select * from public.dataset_pollution where trial_id  = 'cc2ab46d-6e2c-4bb0-809a-3f0149fec5c0'


select length * trial.tick_interval / 1000, * from trial


select *, length(text) from public.source;


-- truncate trial, source, modlist, all of the tables
truncate table public.trial cascade;
truncate table public.source cascade;
truncate table public.modlist cascade;
truncate table public.factory_status cascade
truncate table public.factory_request cascade ;
truncate table public.dataset_system cascade
truncate table public.dataset_pollution cascade
truncate table public.dataset_items cascade
truncate table public.dataset_electric cascade
truncate table public.dataset_circuit cascade