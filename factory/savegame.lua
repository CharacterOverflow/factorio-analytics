-- BENCHMARK SAVEGAME CONVERSION - V1.2
--[[
This file is meant to be placed into a savegame, along with being 'included' from control.lua.
It will allow the normal benchmarking to occur - but this time, no blueprint is tested, only a savegame itself
Can be used to gather outputs of an entire 'save' if you'd like.... but it WILL be slow. Entire save is simulated

Code does the following to make this happen...

1. Extracts specified savegame to a folder
2. copies 'savegame.lua' to 'savegame.lua' in the extracted folder
3. replace values inside 'savegame.lua' just like a normal trial run - BOTS and BP are not valid strings anymore
4. appends 'handler.add_lib(require("savegame"))' to the end of control.lua

Going to just say this again - THIS WILL LIKELY BE VERY SLOW IF YOU ARE GRABBING ALL DATA TYPES!
I recommend choosing just 1 or 2 data files to export (eg, Item and Electric) to avoid the simulation from taking forever.

]]--

local util = require("util")
local version = 1

--[[
The parameters are as follows...
UID - uid of the trial - REQUIRED
ITEM_TICKS - how often to export item specific data (production/consumption since last ITEM_TICK export). Default nil, which will disable this export
ELEC_TICKS - how often to export electric network data (production/consumption OF THE TICK IT WAS CALLED ON (not historical)). Default nil, which will disable this export
CIRC_TICKS - how often to export circuit network data (per-network, all signals are exported OF THE TICK IT WAS CALLED ON (not historical)). Default nil, which will disable this export
BOTS - how many logistic bots to automatically place into roboports, if they exist. Default nil, which will not place any bots
--]]

--<UID>--
local UID = 'SAVE_GAME_TRIAL2'
--</UID>--
--<ITEM_TICKS>--
local ITEM_TICKS = 300
--</ITEM_TICKS>--
--<ELEC_TICKS>--
local ELEC_TICKS = 300
--</ELEC_TICKS>--
--<CIRC_TICKS>--
local CIRC_TICKS = 300
--</CIRC_TICKS>--
--<POLL_TICKS>--
local POLL_TICKS = 300
--</POLL_TICKS>--


local setup = false;
--<BOTS>--
local BOTS = 300
--</BOTS>--

local lcons = {};
local lprod = {};
local lpoll = 0;
local lElecMap = {};

-- Required for if a player does happen to run manual mode and wants to view the trial execution
local on_player_created = function(event)
    local player = game.players[event.player_index]
    local character = player.character
    player.character = nil

    if character then
        character.destroy()
    end
end

-- Function used to compare two dictionaries of results, and subtract differences. This is used to calculate the difference
-- between two ticks before writing to a file for item data. Otherwise, each file output would contain the TOTAL items produced up till
-- that point, and would ultimately require more processing to get the difference between two ticks later.
local diff_dicts = function(dict1, dict2)
    local result = {}

    for key, value in pairs(dict1) do
        if dict2[key] ~= nil then
            result[key] = value - dict2[key]
        else
            result[key] = value
        end
    end

    return result
end

-- This one is slightly different, it will ensure that if 'dict1' and 'dict2' are network dictionaries, it will only subtract the cons/prod values
local diff_network_dicts = function(dict1, dict2)
    local result = {}

    for key, value in pairs(dict1) do
        if dict2[key] ~= nil then
            result[key] = {
                cons = diff_dicts(value.cons, dict2[key].cons),
                prod = diff_dicts(value.prod, dict2[key].prod)
            }
        else
            result[key] = value
        end
    end

    return result
end

-- Boilerplate code for most factorio scenarios
local savegame = {}
savegame.events = {
    [defines.events.on_player_created] = on_player_created
}
script.on_init = function()
    global.version = version;
end

-- this function is called many times, by many different tick functions. It is responsible for doing the actual 'exports' of data.
-- This way, if 2 are set up on tick '300', they will both run despite only being able to register 1 function per tick rate.
-- the 'tick' passed in is the tick rate that this function is being called on.
local runExports = function(tick)
    if (setup) then
        if (ITEM_TICKS ~= nil and tick == ITEM_TICKS) then
            -- do item export
            -- Buffer the current values here from our force
            local f = game.forces['player']
            local cons = util.merge({ f.item_production_statistics.output_counts, f.fluid_production_statistics.output_counts });
            local prod = util.merge({ f.item_production_statistics.input_counts, f.fluid_production_statistics.input_counts });

            -- calculate the differences between the lcons (last consumption) and lprod (last production). this is used to
            -- generate the DELTA in data, rather than just the total.
            local d_cons = diff_dicts(cons, lcons);
            local d_prod = diff_dicts(prod, lprod);

            -- After we do our calculation with lcons and lprod, we need to set them to the 'current' cons and prod
            lcons = cons;
            lprod = prod;

            -- REMEMBER - lcons, lprod, cons, prod.... all of these refer to the TOTAL amount of items produced/consumed.
            -- we want to write our 'changes' in data, what was actually used/produced. Use d_cons and d_prod (delta) for this.
            game.write_file('data/' .. UID .. '_item.jsonl', game.table_to_json({
                cons = d_cons,
                prod = d_prod,
            }) .. '\n',
                    true);
        end
        if (ELEC_TICKS ~= nil and tick == ELEC_TICKS) then
            -- do elec export
            -- grab electric info from each pole - grouped by id
            local s = game.get_surface('nauvis');
            local elecMap = {};
            local fe = s.find_entities_filtered { type = 'electric-pole' };

            -- Map all pole's electric networks to their appropriate stats, no duplications
            for _, entity in ipairs(fe) do

                -- find the ID, set or increment the map value
                elecMap[entity.electric_network_id] = {
                    prod = entity.electric_network_statistics.output_counts,
                    cons = entity.electric_network_statistics.input_counts
                }
            end

            -- Do buffer math, then set buffer var again
            local d_elec = diff_network_dicts(elecMap, lElecMap);
            lElecMap = elecMap;

            -- we now compare the data in elecMap, subtracting data in lElecMap
            -- this is used to generate the DELTA in data, rather than just the total.
            -- afterwards, we set lElecMap to elecMap, so we can use it next time.

            game.write_file('data/' .. UID .. '_elec.jsonl', game.table_to_json(d_elec) .. '\n',
                    true);
        end
        if (CIRC_TICKS ~= nil and tick == CIRC_TICKS) then
            -- do circuit export
            -- grab all circuit info - if we can that is
            local s = game.get_surface('nauvis');
            local circuitMap = {};
            local fe = s.find_entities()

            for _, entity in ipairs(fe) do

                if (entity.circuit_connected_entities ~= nil) then
                    local redEntities = entity.circuit_connected_entities['red'];
                    local greenEntities = entity.circuit_connected_entities['green'];

                    -- if either red or green is more than 0 records - then we have some work to do!
                    if (#redEntities > 0) then
                        local defsArr = entity.circuit_connection_definitions;
                        local uniqConnections = {};
                        for k, def in ipairs(defsArr) do
                            if not uniqConnections[def.source_circuit_id] then
                                uniqConnections[def.source_circuit_id] = def;
                            end
                        end

                        -- now, iterate over the 'unique' connections for 'this' entity, giving us all connected networks on RED
                        for k, def in pairs(uniqConnections) do
                            -- grab the actual circuit network
                            local net = entity.get_circuit_network(defines.wire_type.red, def.source_circuit_id);

                            if (net ~= nil and net.network_id ~= nil) then
                                -- now, we have all the data we need to store in our map
                                circuitMap[net.network_id] = {
                                    color = 'red',
                                    signals = net.signals
                                }
                            end
                        end
                    end

                    -- if either red or green is more than 0 records - then we have some work to do!
                    if (#greenEntities > 0) then
                        local defsArr = entity.circuit_connection_definitions;
                        local uniqConnections = {};
                        for _, def in ipairs(defsArr) do
                            if not uniqConnections[def.source_circuit_id] then
                                uniqConnections[def.source_circuit_id] = def;
                            end
                        end

                        -- now, iterate over the 'unique' connections for 'this' entity, giving us all connected networks on RED
                        for _, def in pairs(uniqConnections) do
                            -- grab the actual circuit network
                            local net = entity.get_circuit_network(defines.wire_type.green, def.source_circuit_id);

                            if (net ~= nil and net.network_id ~= nil) then
                                -- now, we have all the data we need to store in our map
                                circuitMap[net.network_id] = {
                                    color = 'green',
                                    signals = net.signals
                                }
                            end
                        end
                    end
                end
            end

            game.write_file('data/' .. UID .. '_circ.jsonl', game.table_to_json(circuitMap) .. '\n',
                    true);
        end
        if (POLL_TICKS ~= nil and tick == POLL_TICKS) then
            -- do pollution export
            local s = game.get_surface('nauvis');
            local tp = s.get_total_pollution();

            -- get difference in pollution since last poll
            local dp = tp - lpoll;
            lpoll = tp;

            -- grab pollution info
            game.write_file('data/' .. UID .. '_poll.jsonl', game.table_to_json({
                pollution = dp
            }) .. '\n',
                    true);
        end
    else
        -- If this is not yet 'setup', then we are current running in tick 0. This is how we run something on 'game start'
        -- without needing other events such as player created, which do not function in benchmark execution (so far as I've found)

        -- Creates a force specifically for recording data, so as to not confuse potential other trials or setup information
        -- from the scenario's creation. All data is tied to a 'force', so we can just read from this force at any time
        -- to get needed stats.
        --local s = game.get_surface('nauvis');

        -- Clear all pollution, in the off chance something was 'saved' from someone loading the scenario manually and doing things.
        --s.clear_pollution();

        -- Now that we're ready to start the trial, we will call the 'run_trial' function which does the actual work of
        -- beginning the trial, placing objects, etc. Assuming no errors in that process, we continue as intended
        setup = true;
    end


end

-- This 'on tick' event is set up to run once a day - literally, that many ticks equals 24 hours.
-- this is done so that we can have an event fire on 'first tick', but not prevent a user from trying to schedule something to a specific tick rate.
-- as far as i understand, only 1 function can be fired per 'tick' that is set up. So, we can't have multiple functions be set up for the same tick rate.
script.on_nth_tick(5184000, function()
    if (setup) then

        script.on_nth_tick(5184000, nil);

        -- At this point, the main data collection lua segment is complete. This will occur every interval * 60 ticks in-game, until complete
    else
        -- Normally.... this is  where we would clear pollution, graph the world, etc. But operating from an existing savegame means we should make no such changes
        -- leaving the current 'on_nth_tick(5184000)' as is for now, so that the process still flows as intended

        setup = true;
    end
end)

-- Setup item tick, if the output is desired
if (ITEM_TICKS ~= nil) then
    script.on_nth_tick(ITEM_TICKS, function()
        runExports(ITEM_TICKS);
    end)
end

-- Setup electric tick, if desired
if (ELEC_TICKS ~= nil) then
    script.on_nth_tick(ELEC_TICKS, function()
        runExports(ELEC_TICKS);
    end)
end

-- Setup circuit tick, if desired
if (CIRC_TICKS ~= nil) then
    script.on_nth_tick(CIRC_TICKS, function()
        runExports(CIRC_TICKS);
    end)
end

if (POLL_TICKS ~= nil) then
    script.on_nth_tick(POLL_TICKS, function()
        runExports(POLL_TICKS);
    end)
end

savegame.on_configuration_changed = function(event)
end

savegame.add_remote_interface = function()
    remote.add_interface("benchmark",
            {
                run_trial = run_trial,
                runExports = runExports
            })
end

return savegame
