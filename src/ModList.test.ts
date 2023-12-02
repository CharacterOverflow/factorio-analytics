import { ModList } from './ModList';
import "jest";

describe("Testing the ModList class", () => {
    let modList: ModList;

    beforeEach(() => {
        modList = new ModList({
            name: "TestModList",
            desc: "This is a test modlist",
            mods: ["textplates", "informatron","flib"]
        })
    })

    it("should initialize the ModList with given parameters", () => {
        expect(modList.name).toBe("TestModList");
        expect(modList.desc).toBe("This is a test modlist");
    })

})