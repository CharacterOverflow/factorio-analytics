import path from "path";
import * as fs from "fs-extra";
import {FactorioAnalyticsApi} from "../../src/FactorioAnalyticsApi";

require('dotenv').config();

async function main() {

    const factoryA = 'factory/examples/1200spm_base.bp';
    const factoryB = 'factory/examples/45spm_base.bp';
    const factoryC = 'factory/examples/smallbasev2.txt';

    const factoryAFile = path.join(process.cwd(), factoryA);
    const factoryBFile = path.join(process.cwd(), factoryB);
    const factoryCFile = path.join(process.cwd(), factoryC);

    // submit all 3
    let sourceA = await FactorioAnalyticsApi.submitSource(fs.readFileSync(factoryAFile, 'utf8'));
    let sourceB = await FactorioAnalyticsApi.submitSource(fs.readFileSync(factoryBFile, 'utf8'));
    let sourceC = await FactorioAnalyticsApi.submitSource(fs.readFileSync(factoryCFile, 'utf8'));
    console.table('Submitted sources:', [sourceA, sourceB, sourceC])

    // make trials for each as well
    let trialA = await FactorioAnalyticsApi.submitTrial({
        name: '1200spm_base 2',
        desc: '1200spm base blueprint',
        source: sourceA,
        length: 10800,
        tickInterval: 300,
        recordItems: true,
        recordElectric: false,
        recordCircuit: true,
        recordPollution: true,
        recordSystem: true
    })
    let trialB = await FactorioAnalyticsApi.submitTrial({
        name: '45spm_base 2',
        desc: '45spm base blueprint',
        source: sourceB,
        length: 10800,
        tickInterval: 300,
        recordItems: true,
        recordElectric: false,
        recordCircuit: true,
        recordPollution: true,
        recordSystem: true
    })
    let trialC = await FactorioAnalyticsApi.submitTrial({
        name: 'smallbasev2 2',
        desc: 'Small base blueprint',
        source: sourceC,
        length: 10800,
        tickInterval: 300,
        recordItems: true,
        recordElectric: false,
        recordCircuit: true,
        recordPollution: true,
        recordSystem: true
    })

    await Promise.allSettled([
        FactorioAnalyticsApi.queryStatusOnTick(trialA.execution_id),
        FactorioAnalyticsApi.queryStatusOnTick(trialB.execution_id),
        FactorioAnalyticsApi.queryStatusOnTick(trialC.execution_id)
    ]);

    // now we can query trial data - grab them
    let tdA = await FactorioAnalyticsApi.queryTrial(trialA.trialId);
    // let tdB = await FactorioAnalyticsApi.queryTrial(trialB.trialId);
    // let tdC = await FactorioAnalyticsApi.queryTrial(trialC.trialId);
    // lets do a test of the other functions for grabbing data for trial B
    let itemDataB = await FactorioAnalyticsApi.queryItemData(trialB.trialId);
    //let electricDataB = await FactorioAnalyticsApi.queryElectricData(trialB.trialId);
    let circuitDataB = await FactorioAnalyticsApi.queryCircuitData(trialB.trialId);
    let pollutionDataB = await FactorioAnalyticsApi.queryPollutionData(trialB.trialId);
    let systemDataB = await FactorioAnalyticsApi.querySystemData(trialB.trialId);

    // output a table showing the length of the above data objects
    console.table({
        itemDataB: itemDataB.length,
        //electricDataB: electricDataB.length,
        circuitDataB: circuitDataB.length,
        pollutionDataB: pollutionDataB.length,
        systemDataB: systemDataB.length
    })

    // for the sake of testing, grab ALL data related to test A
    let dataA = await FactorioAnalyticsApi.query('data_all', trialA.trialId);
    console.table(dataA)

}

main().then(async (t) => {
    console.log('Finished running ComplexPublicApiUsage');
}).catch((e) => {
    console.error(e);
})
