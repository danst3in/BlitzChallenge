const { LolProbability } = require("../lib/LeagueOfLegendsMatchProbability");
const { loadData } = require("../utils/load-data");

// initialize test class object
const lolBattleTest = new LolProbability();
// process incoming data

loadData(lolBattleTest, "Gangplank", [
  "Evelynn",
  "Fiddlesticks",
  "Rakan",
  "Warwick",
  "Sett",
])
  .then((data) => console.log(data.results))
  .catch((err) => console.error(err));

//    Additional test set
//    "Leblanc", [
//     "Braum",
//     "Kayle",
//     "Anivia",
//     "Quinn",
//     "Mordekaiser",
//   ])

/*
 // data structure
{
  char1: {
    win: ##,
    loss: ##,
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
