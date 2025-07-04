// testCrunchyroll.ts
const Crunchyroll = require("crunchyroll-js-api")

async function testApi() {
  try {
    const cr = await Crunchyroll.create()
    const results = await cr.cms.getBrowse({ limit: 5 })
    console.log("Fetched anime results:")
    results.items.forEach(item => {
      console.log("- ", item.title)
    })
  } catch (err) {
    console.error("Error using Crunchyroll API:", err)
  }
}

testApi()