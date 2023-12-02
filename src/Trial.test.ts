import { Trial, TTrialStages } from './Trial';
import 'jest';

describe('Testing the Trial class', () => {
    let trial: Trial;

    beforeAll(() => {
        trial = new Trial({
            length: 7200,
            tickInterval: 60,
            initialBots: 200,
            recordItems: true,
            recordElectric: false,
            recordCircuits: true,
            recordPollution: true,
            recordSystem: true
        });
    });

    it('should initialize the Trial with the given parameters', () => {
        expect(trial.id).toBeDefined()
        expect(trial.length).toBe(7200);
        expect(trial.tickInterval).toBe(60);
        expect(trial.initialBots).toBe(200);
    });

    it('should change the stage of the trial', () => {
        trial.setStage('ran');
        expect(trial.stage).toBe('ran');
    });

});