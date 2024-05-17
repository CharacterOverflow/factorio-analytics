
import * as fs from "fs-extra";
import {Factory} from "../../src/Factory";
import {FactoryDatabase} from "../../src/FactoryDatabase";
import {Trial} from "../../src/Trial";
import {Source} from "../../src/Source";
import path from "path";


require('dotenv').config();

async function main() {

    // startup factory
    await Factory.initialize({
        hideConsole: false,
        updateInstall: true
    })

    await FactoryDatabase.initialize();

    console.log('Factory started! running trial');

    const bpFile = path.join(process.cwd(), 'factory/examples/1200spm_base.bp');
    const bpStr = await fs.readFile(bpFile, 'utf8')

    // make a source, then run a trial with this source as well
    let source = new Source({
        name: '1200spm_base',
        desc: 'Big science blueprint',
        variant: 'blueprint',
        text: bpStr
    });
    let t = new Trial({
        name: '1200spm_base',
        desc: 'Big base!',
        source: source,
        length: 108000,
        tickInterval: 300,
        initialBots: 150,
        recordItems: true,
        recordCircuits: true,
        recordPollution: true,
        recordSystem: true
    });
    await FactoryDatabase.saveTrial(t, true);

    // run trial
    await Factory.analyzeTrial(t, true, true);

    console.log('trial done!');
}

main().then((t) => {
    console.log('Worker Started!')
}).catch((e) => {
    console.error(e);
})
