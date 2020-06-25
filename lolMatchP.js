/*
  analyze all data
  - create object for char stats
  - create object for each character 
    - store win count (or win %?) for each character
  - Determine average win count (or win %?) for all characters
    - Determine mean win count (or win %?)
    - Determine global Character variance and std deviation
    - Determine population variance btw characters [squared diff btw each win num and mean]
    - Determine standard deviation btw characters [sqrt of variance]
  - Determine Team based stats (per team)
    - Determine population variance [squared diff btw each num and mean]
    - Determine standard deviation [sqrt of variance]
  - In each character object
    - store how many std deviations from the mean for character win count (or win %?)
  ?? variance of winning percentage overall from the sum of the individual game variances.??

{
  char1: {
    win: ##,
    loss: ##,
    win%: ## 
    stdDevs: ###
  },
  

}
 */

const lolData = require("./matches.json");

class LolProbability {
  // receives Input: array of arrays, returns Output: Stats Object
  mineData(arr) {
    if (!arr) {
      throw new Error("Dataset contains undefined matches");
    }
    const statsObj = {};
    const length = arr.length;
    console.log("mineData -> length", length);

    const updateChamp = (champion, win = true) => {
      if (statsObj[champion] === undefined) {
        statsObj[champion] = { win: 0, loss: 0, winP: 0 };
      }

      if (win) {
        statsObj[champion].win++;
        statsObj[champion].winP =
          statsObj[champion].win /
          (statsObj[champion].win + statsObj[champion].loss);
      } else {
        statsObj[champion].loss++;
        statsObj[champion].winP =
          statsObj[champion].win /
          (statsObj[champion].win + statsObj[champion].loss);
      }
    };

    arr.forEach((match, i) => {
      if (match.length < 3) {
        console.error(`Match #${i + 1} - is missing data.`);
      } else {
        let champOne = match[0];
        let champTwo = match[1];

        if (match[2] === 1) {
          [champOne, champTwo] = [champTwo, champOne];
        }

        champOne.forEach((champ) => updateChamp(champ));
        champTwo.forEach((champ) => updateChamp(champ, false));
      }

      // console.log("mineData -> statsObj", statsObj);
    });
    return statsObj;
  }

  runChampStats(champStats) {
    // console.log("runchampStats -> typeof champStats", typeof champStats);
    let meanSum = 0;
    let meanP = 0;
    let variance = 0;
    let stdDev = 0;
    let champCount = 0;
    console.log("runChampStats -> champCount", champCount);

    for (const champ of Object.values(champStats)) {
      // console.log("runTeamStats -> champ", champ);
      meanSum += champ.winP;
      champCount++;
    }

    console.log("runChampStats -> meanSum", meanSum);
    meanP = meanSum / champCount;
    console.log("runChampStats -> meanP", meanP);

    for (const champ of Object.values(champStats)) {
      // console.log("runTeamStats -> champ", champ);
      variance += (champ.winP - meanP) * (champ.winP - meanP);
    }

    variance = variance / champCount;
    console.log("runChampStats -> variance", variance);
    stdDev = Math.sqrt(variance);
    console.log("runChampStats -> stdDev", stdDev);

    for (const champ of Object.values(champStats)) {
      // console.log("runTeamStats -> champ", champ);
      champ.deviations = Math.abs(champ.winP - meanP) / stdDev;
      champ.deviant = champ.deviations > 1 ? true : false;
    }

    return champStats;
  }
}

const lolBattleTest = new LolProbability();

const lolBattleStats = lolBattleTest.mineData(lolData);
// console.log("typeof lolBattleStats", typeof lolBattleStats);
const lolChampStats = lolBattleTest.runChampStats(lolBattleStats);
console.log("lolChampStats", lolChampStats);
