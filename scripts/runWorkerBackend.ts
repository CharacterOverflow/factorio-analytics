import {FactoryApiWorker} from "../src/api/FactoryApiWorker";

require('dotenv').config();

async function main() {

    await FactoryApiWorker.initialize()
}

main().then((t) => {
    console.log('Worker Started!')
}).catch((e) => {
    console.error(e);
})
