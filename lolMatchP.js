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

// const lolData = require("./matches.json");
// console.log(typeof lol);
// receives Input: array of arrays, returns Output: Stats Object
const mineData = (arr) => {
  if (!arr) {
    throw new Error("Dataset contains undefined matches");
  }
  const statsObj = {};
  const length = arr.length;

  arr.forEach((match, i) => {
    if (match.length < 3) {
      console.error(`Match #${i + 1} - is missing data.`);
    } else {
      // sort names in case data contains teams with same members listed in diff order
      // would be great if they were sorted beforehand
      let champOne = match[i][0].sort().split().join("");
      let champTwo = match[i][1].sort().split().join("");

      if (match[i][2] === 1) {
        [champOne, champTwo] = [champTwo, champOne];
      }

      statsObj[champOne] = statsObj[champOne] || { win: 0, loss: 0, winP: 0 };
      statsObj[champTwo] = statsObj[champTwo] || { win: 0, loss: 0, winP: 0 };

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

const lolStats = (teamStats) => {
  let meanSum = 0;
  let meanP = 0;
  let teamCount = Object.keys(teamStats).length;

  for (const team of Object.keys(teamStats)) {
    meanSum += team.winP;
  }

  meanP = meanSum / teamCount;

  return teamStats;
};

const lolStats = mineData(lolData);
