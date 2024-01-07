
/*
* This test is meant to test a brand new startup with NO DATA in folders at all to start with
* - Delete files in the installDir first
* */

import {Factory} from "../../src/Factory";
import path from "path";
import fs from "fs-extra";
import {FactorioApi} from "../../src/FactorioApi";
require('dotenv').config()
async function main() {

    // setup directory for the 'noInstall' test
    const installDir = path.join(process.cwd(), 'tests','oldInstall')

    // ensure directory, then empty it
    await fs.ensureDir(installDir)
    await fs.emptyDir(installDir)

    await FactorioApi.initialize({
        dataPath: installDir
    })

    // install game as normal with old version.
    await Factory.installGame('1.1.90','headless')

    // initialize the factory now -
    await Factory.initialize({
        installDir,
        updateInstall: true
    })

    // make sure factory is initialized and ready to go
    if (Factory.initStatus !== 'ready') {
        throw new Error(`Factory is not ready! Status: ${Factory.initStatus}`)
    }

    if (Factory.factoryVersion === '1.1.90') {
        throw new Error(`Factory version is not updated! Version: ${Factory.factoryVersion}`)
    }

    // console log the test name and result
    console.log(`TestOutdatedInstall: ${Factory.initStatus === 'ready' ? 'Passed' : 'Failed'}`)
}

main().catch((err) => {
    console.error(err);
    console.log(`TestOutdatedInstall: Failed`)
    process.exit(1);
});
