const state = require('./state.js')
const google = require('googleapis').google
const customSearch = google.customsearch('v1')

const googleSearchCredentials = require("../credentials/google-search.json")
async function robot() {
  const content = state.load()

  const reponse = await customSearch.cse.list({
    auth: googleSearchCredentials.apikey,
    cx:googleSearchCredentials.searchEngineId,
    q: 'Michel Jackson',
    num: 2
  })

  console.dir(response, {depth: null});
  process.exit(0)
}

module.exports = robot
