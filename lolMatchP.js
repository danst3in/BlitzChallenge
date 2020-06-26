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

    const updateOpp = (champion, oppChamp, win = true) => {
      if (statsObj[champion][oppChamp] === undefined) {
        statsObj[champion][oppChamp] = { win: 0, loss: 0, winP: 0 };
      }
      if (win) {
        statsObj[champion][oppChamp].win++;
        statsObj[champion][oppChamp].winP =
          statsObj[champion][oppChamp].win /
          (statsObj[champion][oppChamp].win +
            statsObj[champion][oppChamp].loss);
      } else {
        statsObj[champion][oppChamp].loss++;
        statsObj[champion][oppChamp].winP =
          statsObj[champion][oppChamp].win /
          (statsObj[champion][oppChamp].win +
            statsObj[champion][oppChamp].loss);
      }
    };

    const updateChamp = (champion, oppTeam, win = true) => {
      if (statsObj[champion] === undefined) {
        statsObj[champion] = { win: 0, loss: 0, winP: 0 };
      }

      if (win) {
        statsObj[champion].win++;
        statsObj[champion].winP =
          statsObj[champion].win /
          (statsObj[champion].win + statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent));
      } else {
        statsObj[champion].loss++;
        statsObj[champion].winP =
          statsObj[champion].win /
          (statsObj[champion].win + statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent, false));
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

        champOne.forEach((champ) => updateChamp(champ, champTwo));
        champTwo.forEach((champ) => updateChamp(champ, champOne, false));
      }
    });
    return statsObj;
  }

  runChampStats(champStats) {
    let meanSum = 0;
    let meanP = 0;
    let variance = 0;
    let stdDev = 0;
    let champCount = 0;
    // champStats.deviants = {};

    for (const champ of Object.values(champStats)) {
      meanSum += champ.winP;
      champCount++;
    }

    console.log("runChampStats -> champCount", champCount);
    console.log("runChampStats -> meanSum", meanSum);
    meanP = meanSum / champCount;
    console.log("runChampStats -> meanP", meanP);

    for (const champ of Object.values(champStats)) {
      variance += (champ.winP - meanP) * (champ.winP - meanP);
    }

    variance = variance / champCount;
    console.log("runChampStats -> variance", variance);
    stdDev = Math.sqrt(variance);
    console.log("runChampStats -> stdDev", stdDev);

    for (const champ of Object.values(champStats)) {
      champ.deviations = (champ.winP - meanP) / stdDev;
      champ.deviant =
        champ.deviations > 1 ? true : champ.deviations < -1 ? true : false;
      if (champ.deviant === true) {
        console.log(
          "LolProbability -> runChampStats -> champ.deviations",
          champ.deviations
        );
      }
    }

    return champStats;
  }

  computePVals(statObj, champion, oppArr) {
    const champProbObj = {
      pVal: statObj[champion].winP,
      cProb: {},
      teamProb: 1,
    };

    // P(A intersect B)
    // win% vs particular opponent
    let champProbs = oppArr.map((opp) => {
      console.log(
        "LolProbability -> computePVals -> statObj[champion][opp].winP",
        statObj[champion][opp].winP
      );
      return statObj[champion][opp].winP;
    });

    // P(B)
    // loss% vs any/all champion
    let oppProbs = oppArr.map((opp) => {
      console.log(
        "LolProbability -> computePVals -> 1 - statObj[opp].winP",
        1 - statObj[opp].winP
      );
      return 1 - statObj[opp].winP;
    });

    // // loss% vs particular champion
    // let oppProbs = oppArr.map((opp) => {
    //   return 1 - statObj[opp][champion].winP;
    // });

    for (let i = 0; i < oppArr.length; i++) {
      // P(A |B) = P(A intersect B)/P(B)
      // probability champion wins and opponent loses divided
      // by probability opponent loses
      champProbObj.cProb[oppArr[i]] = champProbs[i] / oppProbs[i];
      // probability champion loses to every opponent of opposing team (based on cProb)
      champProbObj.teamProb =
        champProbObj.teamProb * (1 - champProbObj.cProb[oppArr[i]]);
    }

    // P(at least 1 success) = 1−P(all failures)
    // 1 - probability champion loses to every opponent of opposing team (based on cProb) = Beats at least 1 opponent
    champProbObj.teamProb = 1 - champProbObj.teamProb;

    console.log("LolProbability -> computePVal -> champProbObj", champProbObj);
    return champProbObj;
  }
}

// initialize test class object
const lolBattleTest = new LolProbability();
//  mine json data file
const lolBattleStats = lolBattleTest.mineData(lolData);
// console.log("typeof lolBattleStats", typeof lolBattleStats);

// compute p values for a given Mined Battle Stats: object, Champion: string, Opposing Team [string:5]
const lolPValTest = lolBattleTest.computePVals(lolBattleStats, "Gangplank", [
  "Taric",
  "Fiddlesticks",
  "Rakan",
  "Warwick",
  "Sett",
]);

// additional test
console.log(
  lolBattleTest.computePVals(lolBattleStats, "Leblanc", [
    "Braum",
    "Kayle",
    "Anivia",
    "Quinn",
    "Mordekaiser",
  ])
);
// compute general statistics for a given mined battle data object
const lolChampStats = lolBattleTest.runChampStats(lolBattleStats);
// console.log("lolChampStats", lolChampStats);
