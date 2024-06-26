-- BENCHMARK SCENARIO - V 1.0a (alpha)
-- 6/6/23 - CharacterOverflow (overflow@easton6.com)
-- If you're reading this, please feel free to make changes/improvements to this scenario if you'd like. I'm not a LUA expert!
-- If the changes are something you'd like to share with others, please make a pull request at:

-- THIS SCENARIO IS VERY SPECIFIC TO THE BENCHMARKING PROCESS.
-- You can run it manually, but you MUST run 'buildTrial' first. This will populate this scenario with appropriate data
-- for the trial that you wish to test. You can then run the trial by loading this scenario in-game, and observe how it functions.
--- NOTE this will disable any data extraction available via code, and just place you into the benchmarking scenario to inspect potential issues

-- VERSION NOTES
-- 1.0a - Initial test release. Has been through weeks of slow-ass testing and tweaking. So far, have not had any crashes.
--- Still need to test with bad blueprints and invalid inputs. The scenario, ideally, should error out and crash if anything
-- 1.1a - Added circuits and electrical connections in a 'debug' kinda format - bad formatting and all, but basic enough to test

local util = require("util")
local version = 1

-- DO NOT MANUALLY CHANGE ANY VARIABLE NAMES BELOW, OR THE COMMENTS AROUND THEM.
-- these are replaced when trial is 'BUILT' with the relevant desired settings

--[[
The parameters are as follows...
UID - uid of the trial - REQUIRED
BLUEPRINT - blueprint string to test - REQUIRED
ITEM_TICKS - how often to export item specific data (production/consumption since last ITEM_TICK export). Default nil, which will disable this export
ELEC_TICKS - how often to export electric network data (production/consumption OF THE TICK IT WAS CALLED ON (not historical)). Default nil, which will disable this export
CIRC_TICKS - how often to export circuit network data (per-network, all signals are exported OF THE TICK IT WAS CALLED ON (not historical)). Default nil, which will disable this export
BOTS - how many logistic bots to automatically place into roboports, if they exist. Default nil, which will not place any bots
--]]

--<UID>--
local UID = '662eec4a-253c-4e4e-a825-918cf8ef19c7'
--</UID>--
--<BLUEPRINT>--
local BLUEPRINT = '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'
--</BLUEPRINT>--
--<ITEM_TICKS>--
local ITEM_TICKS = 300
--</ITEM_TICKS>--
--<ELEC_TICKS>--
local ELEC_TICKS = 30
--</ELEC_TICKS>--
--<CIRC_TICKS>--
local CIRC_TICKS = 300
--</CIRC_TICKS>--
--<POLL_TICKS>--
local POLL_TICKS = 900
--</POLL_TICKS>--


local setup = false;
--<BOTS>--
local BOTS = 300
--</BOTS>--

local lcons = {};
local lprod = {};
local lpoll = 0;
local lElecMap = {};

local draw_bp = function(bp)

    local s = game.get_surface('nauvis');
    local f = game.forces['bench']
    f.research_all_technologies();

    -- Creates a blueprint entitiy in-game - it's weird, but it works. This blueprint entity has the blueprint loaded we want to run.
    local bp_entity = s.create_entity { name = 'item-on-ground', position = { 0, 0 }, stack = 'blueprint' }
    bp_entity.stack.import_stack(bp)

    -- Now we call build_blueprint - this does not do *anything* like what you'd expect though. The force_build options is
    -- only there simply to hold 'shift' while the blueprint is placed, meaning the blueprint itself still does not get
    -- spawned, only the ghosts do. So, we then have much more actual work to do.
    -- #TODO - Try to talk to factorio devs and have them either make an additional function (like auto_build_blueprint) or parameter. Would eliminate most of the lua code below, and likely be a speed boost
    local bp_ghost = bp_entity.stack.build_blueprint { surface = s, force = f, position = { 0, 0 }, force_build = true }
    bp_entity.destroy()

    -- Go through and spawn the actual entities - except for ones that REQUIRE other entities, such as locomotives
    local afterSpawns = {}
    for _, entity in pairs(bp_ghost) do

        -- Should change this to go by ghost_type, if that's even a valid field.
        if (entity.ghost_name == 'locomotive' or entity.ghost_name == 'cargo-wagon' or entity.ghost_name == 'fluid-wagon') then
            table.insert(afterSpawns, entity)
        else
            if (entity ~= nil and entity.name == 'entity-ghost' and entity.ghost_type ~= nil and entity.item_requests ~= nil) then
                local items = util.table.deepcopy(entity.item_requests)
                local p, ri = entity.revive();
                if (ri ~= nil) then
                    for k, v in pairs(items) do
                        ri.get_module_inventory().insert({ name = k, count = v })
                    end
                end
            else
                -- it's a normal thing like a belt or arm - we can just 'revive' the ghost, which will place the entity with all of the correct settings from the blueprint
                entity.revive();
            end
        end

    end

    -- This is used to place all locomotives and other train objects AFTER rails have been placed
    for _, entity in pairs(afterSpawns) do
        local r, to = entity.revive();
    end

    -- Set all trains to AUTOMATIC mode (manual = false)
    for _, locomotive in pairs(game.surfaces["nauvis"].get_trains()) do
        locomotive.manual_mode = false
    end

    -- Add logistic bots to each roboport, based on input. One of the few variables, as some designs may be self-sufficient on bots
    if (BOTS ~= nil and BOTS > 0) then
        for _, roboport in pairs(game.surfaces["nauvis"].find_entities_filtered({ type = "roboport" })) do
            roboport.insert({ name = "logistic-robot", count = BOTS })
        end
    end

end

local run_trial = function()
    -- we assume the variables were set before the game was loaded - go from there!
    draw_bp(BLUEPRINT)
end

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
local sandbox = {}
sandbox.events = {
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
            local f = game.forces['bench']
            local cons = util.merge({ f.item_production_statistics.output_counts, f.fluid_production_statistics.output_counts });
            local prod = util.merge({ f.item_production_statistics.input_counts, f.fluid_production_statistics.input_counts });

            -- calculate the differences between the lcons (last consumption) and lprod (last production). this is used to
            -- generate the DELTA in data, rather than just the total.
            local d_cons = diff_dicts(cons, lcons);
            local d_prod = diff_dicts(prod, lprod);

            -- After we do our calculation with lcons and lprod, we need to set them to the 'current' cons and prod
            -- lcons and lprod means 'last consumption' and 'last production'
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
            local fe = s.find_entities_filtered { type = {'electric-pole','medium-electric-pole','big-electric-pole','substation'} };

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

             -- DEBUG - I am adding an additional file export for testing purposes. This will output the 'current' elecMap to a new file based on tick
             -- its gonna be alot of data.... that's fine
             --game.write_file('data/' .. UID .. '_debug.jsonl', game.table_to_json(elecMap) .. '\n',
               --     true);

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
                                    network_id = net.network_id,
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
                                    network_id = net.network_id,
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
        local s = game.get_surface('nauvis');
        local f = game.create_force('bench');

        -- Clear all pollution, in the off chance something was 'saved' from someone loading the scenario manually and doing things.
        s.clear_pollution();

        -- Is chart_all really needed if we already have the whole world rendered and saved in .dat files? I don't know, so keep it to be safe
        f.chart_all();

        -- Now that we're ready to start the trial, we will call the 'run_trial' function which does the actual work of
        -- beginning the trial, placing objects, etc. Assuming no errors in that process, we continue as intended
        run_trial()
        setup = true;

        -- take a screenshot last thing before we quit
        --game.take_screenshot({ path = 'data/' .. UID .. '.png', show_entity_info = true }) -- DOESNT WORK ON HEADLESS

    end


end

-- This 'on tick' event is set up to run once a day - literally, that many ticks equals 24 hours.
-- this is done so that we can have an event fire on 'first tick', but not prevent a user from trying to schedule something to a specific tick rate.
-- as far as i understand, only 1 funciton can be fired per 'tick' that is set up. So, we can't have multiple functions be set up for the same tick rate.
script.on_nth_tick(5184000, function()
    if (setup) then

        script.on_nth_tick(5184000, nil);

        -- At this point, the main data collection lua segment is complete. This will occur every interval * 60 ticks in-game, until complete
    else
        -- If this is not yet 'setup', then we are current running in tick 0. This is how we run something on 'game start'
        -- without needing other events such as player created, which do not function in benchmark execution (so far as I've found)

        -- Creates a force specifically for recording data, so as to not confuse potential other trials or setup information
        -- from the scenario's creation. All data is tied to a 'force', so we can just read from this force at any time
        -- to get needed stats.
        local s = game.get_surface('nauvis');
        local f = game.create_force('bench');

        -- Clear all pollution, in the off chance something was 'saved' from someone loading the scenario manually and doing things.
        s.clear_pollution();

        -- Is chart_all really needed if we already have the whole world rendered and saved in .dat files? I don't know, so keep it to be safe
        f.chart_all();

        -- Now that we're ready to start the trial, we will call the 'run_trial' function which does the actual work of
        -- beginning the trial, placing objects, etc. Assuming no errors in that process, we continue as intended
        run_trial()
        setup = true;

        -- take a screenshot last thing before we quit
        -- EDIT - this requires the full version of the game, and a working xserver for graphics
        -- #TODO make this a parameter later on, and modify the backend to be able to handle this
        -- game.take_screenshot({ path = 'data/' .. UID .. '.png', show_entity_info = true }) -- DOESNT WORK ON HEADLESS

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

sandbox.on_configuration_changed = function(event)
end

sandbox.add_remote_interface = function()
    remote.add_interface("benchmark",
            {
                run_trial = run_trial,
                runExports = runExports
            })
end

return sandbox
