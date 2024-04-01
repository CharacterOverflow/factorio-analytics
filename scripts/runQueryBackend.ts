import {FactoryApiQueryServer} from "../src/api/FactoryApiQuery";

require('dotenv').config();

async function main() {
    await FactoryApiQueryServer.startServer( Number.parseInt(process.env.PORT) ?? 3009)
}

main().then((t) => {
    console.log('done')
}).catch((e) => {
    console.error(e);
})
