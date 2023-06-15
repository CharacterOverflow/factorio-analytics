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
local uid = 'DEFAULT_UID'
--</UID>--
--<BLUEPRINT>--
local bpStr = '0eNrNWd2SqygQfheu9ZSA+JPay32LU1MpYkiGWgULcerMmfLdF3ViTAIT8MxWbe4M+HXTP1/T7Qc41D1rFRca7D4Ar6TowO7nB+j4WdB6/E+/twzsANesAREQtBmfOllTFbdUsBoMEeDiyH6BHRxeIsCE5pqzGWZ6eN+LvjkwZTZYASLQys68I8Uoz+CkP0gE3sEuLn6QYYgeYNACc6KdjrnomNJm4QEouQBlBigCR65YNS+nFli8wHJx4sIsxdUr6/QXuPmEe9m+75jWXJy7cZtijXxj+96s1UY5dtyPJjRLWvXMdqp0Ed+wI++bmNVGW8WruJU1e1QCXpQgkxLGdWI+3SQezjoc127g5qkYXgabdBJ+eLLx8BGY/51DxBoQlezHiCRJBBp5HNepjmtGJ32u0WY7SOYXYzEkl3NAe5TlvkDwCVBxBdKM1S675heYJMSfqcOfpZ/Qq/JuqWfFmLiXi7BDMExCHYDsZoMw1AEuIBSYWTHEn4hBroBOk1yZZSRYTYWOK9kcuKBaWmgrvoQCfKCtSRmtZL0/sFf6xs3r5p11Pj0w9xtXuqf1irynHTEBwzXRyCqtoqf0z5UUcVtTzVYYMUySBQUZU/gbDo2Fwx5mrviG6W0R0IqKrpVKxwdWWwIdrUxqgyO+NQW7fJPZYFdspKVg8alXglaWmPsEtep2ZaJainP8So2Nj1+omAWpWIQZMn9iyDXx0OqfL9TMb5LsSXFGSWASlzdGEIyfXw+yn5IEk4jgF5sQGGaLIsTQCIWBL7TmsDTCviG7ICWefFJxVfVc783acQE6cdXpfSAzzGxnJI8PTUvVxHg78BcY/PkBEyc/lA56QFd6OPDzU8KfzZMGlN18JXT8g2CnjqYuPO4d7oPSEZFXXlrOwART53fjb+Psk5VMYryc59bZh/50Yso48TcbK/Xys0nOthEsdkRrHpi/eIXnZ6pim8KOWwMqQysC8mEBnIRVBGzTDcONFcFPRbSNBR2GxHgj7zkiCacb8Vz6kdDG69bhnoyBvFjAlDmS2aIbb0xH4jh0vg0udcAVG31CvBrzciO6Q9s0CcTDLm1t6ZMGXiIgCkJHG3VPvdDxRt390K+Zy361inVdXEt6tF5ZModJosu9Q/a67TWwiSEPYrq25tp+N7oMm3z0z7yHJDC/ceo3DUlWt6ul7Zq6rtAhSZpv7Eiz7+hIvZrJZx2pq639e4WSZdkVBYa0pM6+My38Y/jTZsXgE7ShHOdyCLIN9xJvpXGI0gRuqyKZnZdJILdhlw1syUtwSEdQTMB5UI8S3UfQXb0vv5py3O3N7HcD09aYi7T9hkC23otynxpMyEZ0r9E7Wc1JGlrX3lewPGxqSbDFKYP3fIDk/gXgU8Hy2/lfKvZnE3JSeJ8C/xenqCT9wxk/KYNHH+UlUP7vw44vBgkku4veDDqqVJZszNbCJ1szGPhxAQZ+XJizcrTDZPDd6itlBN5MOM2VroBpXqI8K1FSYDQM/wIJvpEC'
--</BLUEPRINT>--
--<ITEM_TICKS>--
local item_ticks = 300
--</ITEM_TICKS>--
--<ELEC_TICKS>--
local elec_ticks = 30
--</ELEC_TICKS>--
--<CIRC_TICKS>--
local circ_ticks = 60
--</CIRC_TICKS>--
--<POLL_TICKS>--
local poll_ticks = 300
--</POLL_TICKS>--


local setup = false;
--<BOTS>--
local bots = nil
--</BOTS>--

local lcons = {};
local lprod = {};
local lpoll = 0;

local draw_bp = function(bp)

    --build_blueprint_from_string(bp, surfaceRef, forceRef, offset)
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
                for k, v in pairs(items) do
                    ri.get_module_inventory().insert({ name = k, count = v })
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
    if (bots ~= nil and bots > 0) then
        for _, roboport in pairs(game.surfaces["nauvis"].find_entities_filtered({ type = "roboport" })) do
            roboport.insert({ name = "logistic-robot", count = bots })
        end
    end

end

local run_trial = function()
    -- we assume the variables were set before the game was loaded - go from there!
    draw_bp(bpStr)
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
        if (item_ticks ~= nil and tick == item_ticks) then
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
            lcons = cons;
            lprod = prod;

            -- REMEMBER - lcons, lprod, cons, prod.... all of these refer to the TOTAL amount of items produced/consumed.
            -- we want to write our 'changes' in data, what was actually used/produced. Use d_cons and d_prod (delta) for this.
            game.write_file('data/' .. uid .. '_item.jsonl', game.table_to_json({
                cons = d_cons,
                prod = d_prod,
            }) .. '\n',
                    true);
        end
        if (elec_ticks ~= nil and tick == elec_ticks) then
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

            game.write_file('data/' .. uid .. '_elec.jsonl', game.table_to_json(elecMap) .. '\n',
                    true);
        end
        if (circ_ticks ~= nil and tick == circ_ticks) then
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

            game.write_file('data/' .. uid .. '_circ.jsonl', game.table_to_json(circuitMap) .. '\n',
                    true);
        end
        if (poll_ticks ~= nil and tick == poll_ticks) then
            -- do pollution export
            local s = game.get_surface('nauvis');
            local tp = s.get_total_pollution();

            -- get difference in pollution since last poll
            local dp = tp - lpoll;
            lpoll = tp;

            -- grab pollution info
            game.write_file('data/' .. uid .. '_poll.jsonl', game.table_to_json({
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
    end
end)

-- Setup item tick, if the output is desired
if (item_ticks ~= nil) then
    script.on_nth_tick(item_ticks, function()
        runExports(item_ticks);
    end)
end

-- Setup electric tick, if desired
if (elec_ticks ~= nil) then
    script.on_nth_tick(elec_ticks, function()
        runExports(elec_ticks);
    end)
end

-- Setup circuit tick, if desired
if (circ_ticks ~= nil) then
    script.on_nth_tick(circ_ticks, function()
        runExports(circ_ticks);
    end)
end

if (poll_ticks ~= nil) then
    script.on_nth_tick(poll_ticks, function()
        runExports(poll_ticks);
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
