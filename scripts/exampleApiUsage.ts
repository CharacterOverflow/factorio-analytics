import axios from "axios";
import fs from 'fs'

const baseUrl: string = 'https://api.factorioanalytics.com'

async function main() {
    // lets first create a new source from a big example
    // https://factorioblueprints.tech/blueprint/0bbc20a5-81bb-45f7-a884-dcea8787680e
    const file = '/home/overflow/Projects/factorio-analytics/factory/examples/1200spm_base.bp'
    const bpStr = fs.readFileSync(file,'utf8')

    // Submit the blueprint first
    const sourceResp = await axios.post(baseUrl + '/submit', {
        variant: 'source',
        source: bpStr
    })

    // save the 'sourceID' for use later. NOTE - this can be calculated client-side as well, as it's a hash
    const sourceId = sourceResp.data

    // now lets create a trial to run this source
    // we will run it for 1 hour, and record all data types (heavy test). Data polls every 60 ticks (1 second)
    // then the 2nd trial we submit will be the same source, but for only 15 minutes, recording data every 300 ticks (5 seconds). Also records all data
    let trialLight = await axios.post(baseUrl + '/submit', {
        variant: 'trial',
        trial: {
            source: sourceId,
            length: 54000,
            tickInterval: 300,
            recordItems: true,
            recordElectric: true,
            recordCircuit: true,
            recordPollution: true,
            recordSystem: true
        }
    })
    let trialHeavy = await axios.post(baseUrl + '/submit', {
        variant: 'trial',
        trial: {
            source: sourceId,
            length: 216000,
            tickInterval: 60,
            recordItems: true,
            recordElectric: true,
            recordCircuit: true,
            recordPollution: true,
            recordSystem: true
        }
    })


    // the returned values from running a trial contain the execution request id, and the trial id
    // you can then use these values going forward in a variety of other paths, listed below
    // Once the trial is finished running, data will become available. Specific paths can be hit to check status easily
/*
    const trialIdHeavy = trialHeavy.data.trialId
    const execIdHeavy = trialHeavy.data.executionId
    const trialIdLight = trialLight.data.trialId
    const execIdLight = trialLight.data.executionId

    // the /status/ paths use the EXECUTION ID not the trial ID. they're the best way to check the status of a trial.
    // once 'success' is set to true or false, the trial is run and will not be attempted again

    // 30 second wait, just to let things process and the heavy to run
    await new Promise((resolve) => setTimeout(resolve, 10000))

    // NOTE WARNING #TODO if you try requesting the 'status' and it hasn't been started yet by a worker - it will return 404
    // Will be fixing this in the future, but for now, just wait a bit before checking status

    // now check the light trial status1
    const statusLight = await axios.get(baseUrl + '/query/' + execIdLight + '/status')
    console.log('Light trial status:', statusLight.data)

    // now we can check the status of the heavy trial. Will grab one, wait, then grab the next
    const statusHeavy = await axios.get(baseUrl + '/query/' + execIdHeavy + '/status')
    console.log('Heavy trial status:', statusHeavy.data)

    // you can request the trial information in-full - this will include metadata about the trial if it's finished
    const trialHeavyData = await axios.get(baseUrl + '/query/' + trialIdHeavy + '/trial')
    console.log('Heavy trial data:', trialHeavyData.data)

    const trialLightData = await axios.get(baseUrl + '/query/' + trialIdLight + '/trial')
    console.log('Light trial data:', trialLightData.data)

    // you can also request the source data in-full
    const sourceData = await axios.get(baseUrl + '/query/' + trialIdHeavy + '/data_items')
*/
    // other 'data' options are available for the other types - data_pollution gets pollution data, data_system gets game process data, etc
    // data_all can be used to return ALL datasets



}

main().then((t) => {
    console.log('Source and Trial submitted!')
}).catch((e) => {
    console.error(e)
})
