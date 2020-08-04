const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");


function loadRole(testSuiteObj, challenger, opponents) {
  // return unparsed json in style of previous solution
  return fetch("https://beta.iesdev.com/api/lolstats/champions?region=world&tier=PLATINUM_PLUS&queue=420");
}

module.exports = { loadRole };
