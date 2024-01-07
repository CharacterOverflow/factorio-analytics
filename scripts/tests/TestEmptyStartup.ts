
/*
* This test is meant to test a brand new startup with NO DATA in folders at all to start with
* - Delete files in the installDir first
* */

import {Factory} from "../../src/Factory";
import path from "path";
import fs from "fs-extra";
require('dotenv').config()
async function main() {

    // setup directory for the 'noInstall' test
    const installDir = path.join(process.cwd(), 'tests','noInstall')

    // ensure directory, then empty it
    await fs.ensureDir(installDir)
    await fs.emptyDir(installDir)

    // initialize the factory
    await Factory.initialize({
        installDir
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
