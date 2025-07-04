import { AuthWrapper } from "./services/authWrapper";

const test = async () => {
    const wrapper = new AuthWrapper()

    console.log("testing anime list fetch (no auth)...")
    try {
        const list = await wrapper.getAnimeList()
        console.log(`success. received: ${list.items?.length ?? "some"} items`)
    } catch (error) {
        console.error("failed to fetch", error)
    }

    console.log("testing search (no auth)...")
    try {
        const results = await wrapper.searchAnime("Naruto")
        console.log(`search returned ${results.items?.length ?? "some"} results`)
    } catch (error) {
        console.log("Error, search failed.", error)
    }
}

test()