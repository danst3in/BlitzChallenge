const { LolProbability } = require("./lolProbability");
const { loadData } = require("./loadData");

// initialize test class object
const lolBattleTest = new LolProbability();
// process incoming data
loadData(lolBattleTest);

// compute p values for a given Mined Battle Stats: object, Champion: string, Opposing Team [string:5]
// additional test
// console.log(
//   lolBattleTest.computePVals(lolBattleTest.statsObj, "Leblanc", [
//     "Braum",
//     "Kayle",
//     "Anivia",
//     "Quinn",
//     "Mordekaiser",
//   ])
// );

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
