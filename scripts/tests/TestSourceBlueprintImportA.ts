
/*
* This test is meant to test a brand new startup with NO DATA in folders at all to start with
* - Delete files in the installDir first
* */

import {Factory} from "../../src/Factory";
import path from "path";
import fs from "fs-extra";
import {Source} from "../../src/Source";

require('dotenv').config()

async function main() {

    // setup directory for the 'noInstall' test
    const installDir = path.join(process.cwd(), 'tests','installA')

    // ensure directory, then empty it
    await fs.ensureDir(installDir)
    await fs.emptyDir(installDir)

    // initialize the factory
    await Factory.initialize({
        installDir,
        hideConsole: true
    })

    // Create a source from a blueprint string (45spm base test)
    const bpFile = path.join(process.cwd(), 'factory/examples/45spm_base.bp');
    const bpString = await fs.readFile(bpFile, 'utf8');
    let mySource = new Source({
        name: '45spm_base',
        variant: 'blueprint',
        text: bpString,
        tags: ['test', 'debug'],
        desc: `Loaded from ${bpFile}`
    })

    // make sure factory is initialized and ready to go
    if (Factory.initStatus !== 'ready') {
        throw new Error(`Factory is not ready! Status: ${Factory.initStatus}`)
    }

    // console log the test name and result
    console.log(`TestEmptyStartup: ${Factory.initStatus === 'ready' ? 'Passed' : 'Failed'}`)
}

main().catch((err) => {
    console.error(err);
    console.log(`TestEmptyStartup: Failed`)
    process.exit(1);
});
