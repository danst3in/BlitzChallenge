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
  // Runtime ~O(2n^3)
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

  // Runtime O(3n)
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

  // Prob Formula Source - https://sabr.org/journal/article/probabilities-of-victory-in-head-to-head-team-matchups/
  // Probabilities of Victory in Head-to-Head Team Matchups by John A. Richards
  // PA = WPA*(1 - WPB)   // PA = winning%AvsB *(loss%BvsA)
  // PB = WPB*(1 - WPA)   // PB = winning%BvsA *(loss%AvsB)

  // PDraw = 1 - WPA*(1 - WPB)  + WPB*(1 - WPA)

  // PA = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw
  // PB = WPB*(1 - WPA) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PB = winning%BvsA *(loss%AvsB) / PNoDraw

  // P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw

  // Runtime O(2n)
  computePVals(statObj, champion, oppArr) {
    const champProbObj = {
      pVal: statObj[champion].winP,
      cProb: {},
      teamProb: 0,
    };

    let champProbs = [];
    let oppProbs = [];
    oppArr.forEach((opp, i) => {
      console.log(
        "LolProbability -> computePVals -> statObj[champion][opp].winP",
        statObj[champion][opp].winP
      );

      // WPA    // win% vs particular opponent
      champProbs[i] = statObj[champion][opp].winP;
      // WP(B)  // opp win% vs vs particular champion
      oppProbs[i] = statObj[opp][champion].winP;
    });

    // Secondary Challenge
    // P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw
    for (let i = 0; i < oppArr.length; i++) {
      // "probability champion wins and opponent loses divided" by "probability there is no draw"
      champProbObj.cProb[oppArr[i]] =
        (champProbs[i] * (1 - oppProbs[i])) /
        (champProbs[i] * (1 - oppProbs[i]) + oppProbs[i] * (1 - champProbs[i]));
      // Law of Total Probability
      // P(A) = P(A|B1)*P(B1) + P(A|B2)*P(B2)... P(A|Bn)*P(Bn)
      // P(B) = 1/teamsize
      champProbObj.teamProb += champProbObj.cProb[oppArr[i]] / oppArr.length;
    }

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
