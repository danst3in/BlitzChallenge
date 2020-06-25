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
console.log("typeof lolData", typeof lolData);

// receives Input: array of arrays, returns Output: Stats Object
const mineData = (arr) => {
  if (!arr) {
    throw new Error("Dataset contains undefined matches");
  }
  const statsObj = {};
  const length = arr.length;
  console.log("mineData -> length", length);

  arr.forEach((match, i) => {
    if (match.length < 3) {
      console.error(`Match #${i + 1} - is missing data.`);
    } else {
      // sort names in case data contains teams with same members listed in diff order
      // would be great if they were sorted beforehand
      // console.log("mineData -> match[0]", match[0]);
      let champOne = match[0].sort().join("");
      let champTwo = match[1].sort().join("");

      if (match[2] === 1) {
        // console.log("mineData -> before swap [champOne, champTwo]", [
        //   champOne,
        //   champTwo,
        // ]);

        [champOne, champTwo] = [champTwo, champOne];

        // console.log("mineData -> after swap  [champOne, champTwo]", [
        //   champOne,
        //   champTwo,
        // ]);
      }

      if (statsObj[champOne] === undefined) {
        // console.log(
        //   "mineData -> typeof statsObj[champOne]",
        //   typeof statsObj[champOne]
        // );
        statsObj[champOne] = { win: 0, loss: 0, winP: 0 };
      }

      if (statsObj[champTwo] === undefined) {
        // console.log(
        //   "mineData -> typeof statsObj[champTwo]",
        //   typeof statsObj[champTwo]
        // );
        statsObj[champTwo] = { win: 0, loss: 0, winP: 0 };
      }

      statsObj[champOne].win++;
      statsObj[champOne].winP =
        statsObj[champOne].win /
        (statsObj[champOne].win + statsObj[champOne].loss);

      statsObj[champTwo].loss++;
      statsObj[champTwo].winP =
        statsObj[champTwo].win /
        (statsObj[champTwo].win + statsObj[champTwo].loss);
    }
  });

  return statsObj;
};

const runTeamStats = (teamStats) => {
  // console.log("runTeamStats -> typeof teamStats", typeof teamStats);
  let meanSum = 0;
  let meanP = 0;
  let stdDev = 0;
  let teamCount = Object.keys(teamStats).length;
  console.log("runTeamStats -> teamCount", teamCount);

  // console.log(
  //   "runTeamStats -> Object.keys(teamStats).sort();",
  //   Object.keys(teamStats).sort()
  // );

  for (const [team, val] of Object.entries(teamStats)) {
    console.log("runTeamStats -> team", team);
    console.log("runTeamStats -> val", val);
    meanSum += val.winP;
  }

  console.log("runTeamStats -> meanSum", meanSum);
  meanP = meanSum / teamCount;
  console.log("runTeamStats -> meanP", meanP);

  // for (const team of Object.keys(teamStats)) {
  // }
  return teamStats;
};

const lolBattleStats = mineData(lolData);
const lolTeamStats = runTeamStats(lolBattleStats);
console.log("typeof lolBattleStats", typeof lolBattleStats);
// console.log("lolTeamStats", lolTeamStats);
