
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
    const installDir = path.join(process.cwd(), 'tests','credTest')

    // init API
    await FactorioApi.initialize({
        dataPath: installDir,
        username: process.env.FACTORIO_USER,
        token: process.env.FACTORIO_TOKEN
    })

    // if authenticated, passed else error
    if (!FactorioApi.isAuthenticated) {
        throw new Error(`Not authenticated!`)
    }


    // console log the test name and result
    console.log(`TestCredentialStartup: Passed`)
}

main().catch((err) => {
    console.error(err);
    console.log(`TestCredentialStartup: Failed`)
    process.exit(1);
});
