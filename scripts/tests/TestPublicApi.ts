import path from "path";
import * as fs from "fs-extra";
import {FactorioAnalyticsApi} from "../../src/FactorioAnalyticsApi";

require('dotenv').config();

async function main() {

    /*
    * #TODO
    *   - Add more logging - use ai if anything, but log constatntlyyyy anything big that happens
    * */
    const bpFile = '/home/overflow/Projects/factorio-analytics/factory/examples/45spm_base.bp'
    const bpStr = await fs.readFile(bpFile, 'utf8')

    // submit a blueprint
    let source = await FactorioAnalyticsApi.submitSource(bpStr);
    console.log('Submitted source:', source)

    // submit a trial to run for this source - this will be a long-running trial!
    let longTrial = await FactorioAnalyticsApi.submitTrial({
        name: '45spm_base 3_27_2024',
        desc: 'Basic base blueprint - long test. 108k ticks, 300 tick interval, all data recorded',
        source: source,
        length: 108000,
        tickInterval: 300,
        recordItems: true,
        recordElectric: true,
        recordCircuit: true,
        recordPollution: true,
        recordSystem: true
    })

    // submit a short trial
    let shortTrial = await FactorioAnalyticsApi.submitTrial({
        //TEST GENERATING NAME FOR TRIAL name: '45spm_base 3_27_2024_short',
        //desc: 'Basic base blueprint - short test. 18k ticks, 60 tick interval, only item data',
        source: source,
        length: 36000,
        tickInterval: 60,
        recordItems: true,
        recordElectric: false,
        recordCircuit: false,
        recordPollution: false,
        recordSystem: false
    })

    // both trials above
    console.log('Submitted trials:')
    console.table([longTrial, shortTrial])

    let ltHandle = setInterval(async () => {
        try {
            let longTrialStatus = await FactorioAnalyticsApi.queryStatus(longTrial.execution_id)
            if (longTrialStatus) {
                console.log('Long trial status:')
                console.table(longTrialStatus)
                if (longTrialStatus.success != null) {
                    clearInterval(ltHandle)
                    longTrial = await FactorioAnalyticsApi.query('trial', longTrial.trialId)
                }
            }
        } catch (e) {
            console.log('Error querying long trial status:', e)
        }
    }, 2000)
    let stHandle = setInterval(async () => {
        try {
            let shortTrialStatus = await FactorioAnalyticsApi.queryStatus(shortTrial.execution_id)
            if (shortTrialStatus) {
                console.log('Short trial status:')
                console.table(shortTrialStatus)
                if (shortTrialStatus?.success != null) {
                    clearInterval(stHandle)
                    shortTrial = await FactorioAnalyticsApi.query('trial', shortTrial.trialId)
                }
            }
        } catch (e) {
            console.log('Error querying short trial status:', e)
        }
    }, 2000)

    //let s = source.gridSize


}

main().then(async (t) => {
    console.log('Finished running TestPublicApi.ts');
}).catch((e) => {
    console.error(e);
})
