import {FactoryApiIngestServer} from "../src/api/FactoryApiIngest";

require('dotenv').config();

async function main() {

    await FactoryApiIngestServer.startServer(Number.parseInt(process.env.PORT) ?? 3001)
}

main().then((t) => {
    console.log('done')
}).catch((e) => {
    console.error(e);
})
