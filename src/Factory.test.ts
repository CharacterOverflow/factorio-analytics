import { ModList } from './ModList';
import "jest";
import * as fs from 'fs-extra';
import {Factory} from "./Factory";
import {Trial} from "./Trial";
import {GameFlowItemRecord, IGameFlowItemTick} from "./Dataset";

require('dotenv').config();

describe("Testing the Factory class", () => {
/*
    afterEach(() => {
        jest.resetAllMocks();
    });*/

    it("should initialize the factory with the given parameters, and have status set to ready", async () => {
        await Factory.initialize({
            installDir: '/home/overflow/Apps/unit_test_factorio',
            hideConsole: false,
            username: process.env.FACTORIO_USER,
            token: process.env.FACTORIO_TOKEN,
            // user info is provided auto-magically from .env
        })

        expect(Factory.factoryInstallPath).toBe('/home/overflow/Apps/unit_test_factorio');
        expect(Factory.modsPath).toBe('/home/overflow/Apps/unit_test_factorio/mods');
        expect(Factory.savesPath).toBe('/home/overflow/Apps/unit_test_factorio/saves');
        expect(Factory.initStatus).toBe('ready');
    }, 60000)
/*

    it('should correctly parse the item data file example', async () => {
        const trial = new Trial();  // Create an instance of Trial
        trial.length = 3600; // 1 hour
        trial.tickInterval = 500; // 500ms
        trial.id = "test_trial";

        // Customize the raw string as you need for your mock data
        const raw = `{ "cons": { "item1": 1 }, "prod": { "item2": 2 }}\n{ "cons": { "item3": 3 }, "prod": { "item4": 4 }}`;

        jest.spyOn(fs, 'readFile').mockImplementation((_path, callback) => {
            callback(null, Buffer.from(raw, 'utf-8'));
        });

        const results: IGameFlowItemTick[] = await Factory.parseItemDataFile('mock_file_path', trial);

        // Use whatever assertions are relevant for your use case.
        // This is just a placeholder assertion.
        expect(results).toHaveLength(4);  // Assuming you get four items in your items ticks array
        expect(trial.itemMetadata.total["item1"].cons).toBe(1);
        expect(trial.itemMetadata.total["item2"].prod).toBe(2);

        // Check that records have been converted
        expect(results[0]).toBeInstanceOf(GameFlowItemRecord);
    });
*/



})