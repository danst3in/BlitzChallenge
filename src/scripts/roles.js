const { LolRoleProb } = require("../lib/LeagueOfLegendsRoleProbability");
const { loadRole } = require("../utils/load-role");

// initialize test class object
const lolTierRole = new LolRoleProb();
// process incoming data

loadRole().then((data) => console.log(data.results)).catch((err) => console.error(err));

/*
 // data structure
{
  char1: {
    role: "",
    role_percentage: ##,
    win%: ##, 
    stdDevs: ###,
    deviant: > 1 || < -1 = true,
    charA: {
      win: ##,
      loss: ##,
      win%: ##,
    },
    charB: {
      win: ##,
      loss: ##,
      win%: ##,
    },
    charC...,
  },
  

}
 */