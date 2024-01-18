import path from "path";
import * as fs from "fs-extra";
import {Factory} from "../src/Factory";
import {FactoryDatabase} from "../src/FactoryDatabase";
import {Source, SourceBlueprintDetails} from "../src/Source";
import {Trial} from "../src/Trial";

async function main() {

    /*
    * #TODO
    *   - Add more logging - use ai if anything, but log constatntlyyyy anything big that happens
    * */

    await Factory.initialize({
        hideConsole: false,
        // user info is provided auto-magically from oldenv.txt
    })
    await FactoryDatabase.initialize();

    // Load trial requirements
    //const smallBpStr = '0eNqVk9FuwyAMRf/Fz6QKdFE7fmWqJpJ4LRIhEbhT04h/HzRbNa1qFt4wXF8fGXuC2pxxcNoSyAl001sP8m0Cr49WmXRH44AgQRN2wMCqLkXklPVD76io0RAEBtq2eAHJw4EBWtKkcXa6BeO7PXc1uih45sFg6H1M622qGq0KvqkYjPEgNlWs0GqHzfwuAnswFquN775l9E28pM037F8EMQu34W4eO9Q4JISE8EQu8uR8pZznwfAHmJO6KtcWP1mFwQ9aSl0JVmZxlf9iOX080ULqSqy8dvGsr1tqUByo27LIX7vF4BOdn2d3z192r2K3F1teVSKEL+hPIgk='
    const bpFile = path.join(process.cwd(), 'factory/examples/vanilla_forge_blitz1.bp');
    const bpString = await fs.readFile(bpFile, 'utf8');

    let source = new SourceBlueprintDetails({
        name: 'CharacterOverflow - BlueprintBlitz1',
        text: bpString,
        variant: 'blueprint',
        tags: ['blitz','blueprintblitz1']
    });
    //await FactoryDatabase.saveSource(source);
    let o = {
        entityCounts: source.entityCounts,
        gridRange: source.gridRange,
        gridSize: source.gridSize,
    }
    console.log(o)


    //let s = source.gridSize


}

main().then(async (t) => {
    console.log('Finished running miscTesting.ts');
}).catch((e) => {
    console.error(e);
})
