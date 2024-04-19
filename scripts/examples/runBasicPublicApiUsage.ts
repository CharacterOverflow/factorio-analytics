import path from "path";
import * as fs from "fs-extra";
import {FactorioAnalyticsApi} from "../../src/FactorioAnalyticsApi";

require('dotenv').config();

async function main() {

    //const factoryA  = 'factory/examples/1200spm_base.bp';
    //const factoryB  = 'factory/examples/45spm_base.bp';
    const factoryC  = 'factory/examples/smallbasev2.txt';

    //const factoryAFile = path.join(process.cwd(), factoryA);
    //const factoryBFile = path.join(process.cwd(), factoryB);
    const factoryCFile = path.join(process.cwd(), factoryC);

    // For the basic test, we will just do the quick-submit and wait for a response
    let execResponse = await FactorioAnalyticsApi.submitQuick(fs.readFileSync(factoryCFile, 'utf8'));
    console.log('Submitted source response:', execResponse)

    // Now, we can listen and wait for the execution_id to be processed
    console.table(await FactorioAnalyticsApi.queryStatusOnTick(execResponse.execution_id));

    let td =  await FactorioAnalyticsApi.queryTrial(execResponse.trialId);
    console.table(td.itemMetadata.avg)

}

main().then(async (t) => {
    console.log('Finished running BasicPublicApiUsage');
}).catch((e) => {
    console.error(e);
})
