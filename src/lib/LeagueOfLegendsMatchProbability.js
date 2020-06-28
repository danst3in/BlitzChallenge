class LolProbability {
  constructor() {
    (this._statsObj = {}),
      (this._genStats = {}),
      (this._champProb = {}),
      (this._results = "");
  }

  get statsObj() {
    return this._statsObj;
  }

  get genStats() {
    return this._genStats;
  }

  get champProb() {
    return this._champProb;
  }

  get results() {
    return this._results;
  }
  set results(str) {
    this._results = str;
  }

  // receives Input: array of arrays, returns Output: Stats Object
  // Runtime ~O(n*2m^2) ~~O(n*k)
  mineData(arr) {
    if (!arr) {
      throw new Error("Dataset contains undefined matches");
    }

    const updateOpp = (champion, oppChamp, win = true) => {
      if (this._statsObj[champion][oppChamp] === undefined) {
        this._statsObj[champion][oppChamp] = { win: 0, loss: 0, winP: 0 };
      }
      if (win) {
        this._statsObj[champion][oppChamp].win++;
        this._statsObj[champion][oppChamp].winP =
          this._statsObj[champion][oppChamp].win /
          (this._statsObj[champion][oppChamp].win +
            this._statsObj[champion][oppChamp].loss);
      } else {
        this._statsObj[champion][oppChamp].loss++;
        this._statsObj[champion][oppChamp].winP =
          this._statsObj[champion][oppChamp].win /
          (this._statsObj[champion][oppChamp].win +
            this._statsObj[champion][oppChamp].loss);
      }
    };

    const updateChamp = (champion, oppTeam, win = true) => {
      if (this._statsObj[champion] === undefined) {
        this._statsObj[champion] = { win: 0, loss: 0, winP: 0 };
      }

      if (win) {
        this._statsObj[champion].win++;
        this._statsObj[champion].winP =
          this._statsObj[champion].win /
          (this._statsObj[champion].win + this._statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent));
      } else {
        this._statsObj[champion].loss++;
        this._statsObj[champion].winP =
          this._statsObj[champion].win /
          (this._statsObj[champion].win + this._statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent, false));
      }
    };

    if (arr.length < 3) {
      console.error(`Match #${arr} - is missing data.`);
    } else {
      let champOne = arr[0];
      let champTwo = arr[1];

      if (arr[2] === 1) {
        [champOne, champTwo] = [champTwo, champOne];
      }

      champOne.forEach((champ) => updateChamp(champ, champTwo));
      champTwo.forEach((champ) => updateChamp(champ, champOne, false));
    }

    return this._statsObj;
  }

  // Runtime O(3n)
  runChampStats() {
    this._genStats.meanSum = 0;
    this._genStats.meanP = 0;
    this._genStats.variance = 0;
    this._genStats.stdDev = 0;
    this._genStats.champCount = 0;
    this._genStats.deviants = [];

    for (const champ of Object.values(this._statsObj)) {
      this._genStats.meanSum += champ.winP;
      this._genStats.champCount++;
    }

    this._genStats.meanP = this._genStats.meanSum / this._genStats.champCount;

    for (const champ of Object.values(this._statsObj)) {
      this._genStats.variance +=
        (champ.winP - this._genStats.meanP) *
        (champ.winP - this._genStats.meanP);
    }

    this._genStats.variance =
      this._genStats.variance / this._genStats.champCount;

    this._genStats.stdDev = Math.sqrt(this._genStats.variance);

    for (const champ of Object.values(this._statsObj)) {
      champ.deviations =
        (champ.winP - this._genStats.meanP) / this._genStats.stdDev;
      champ.deviant =
        champ.deviations > 1 ? true : champ.deviations < -1 ? true : false;
      if (champ.deviant === true) {
        this._genStats.deviants.push([champ.deviations]);
      }
    }

    return this._statsObj;
  }

  // Prob Formula Source - https://sabr.org/journal/article/probabilities-of-victory-in-head-to-head-team-matchups/
  // Probabilities of Victory in Head-to-Head Team Matchups by John A. Richards
  // PA = WPA*(1 - WPB)   // PA = winning%AvsB *(loss%BvsA)
  // PB = WPB*(1 - WPA)   // PB = winning%BvsA *(loss%AvsB)

  // PDraw = 1 - WPA*(1 - WPB)  + WPB*(1 - WPA)

  // PA = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw
  // PB = WPB*(1 - WPA) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PB = winning%BvsA *(loss%AvsB) / PNoDraw

  // P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw

  // Runtime O(2m)  ~O(k)
  computePVals(champion, oppArr) {
    this._champProb[champion] = {
      pVal: this._statsObj[champion].winP,
      cProb: {},
      teamProb: 0,
    };

    let champProbs = [];
    let oppProbs = [];

    oppArr.forEach((opp, i) => {
      // WPA    // win% vs particular opponent
      champProbs[i] = this._statsObj[champion][opp].winP;
      // WP(B)  // opp win% vs vs particular champion
      oppProbs[i] = this._statsObj[opp][champion].winP;
    });

    // Secondary Challenge
    // P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw
    for (let i = 0; i < oppArr.length; i++) {
      // "probability champion wins and opponent loses divided" by "probability there is no draw"
      this._champProb[champion].cProb[oppArr[i]] =
        (champProbs[i] * (1 - oppProbs[i])) /
        (champProbs[i] * (1 - oppProbs[i]) + oppProbs[i] * (1 - champProbs[i]));
      // Law of Total Probability
      // P(A) = P(A|B1)*P(B1) + P(A|B2)*P(B2)... P(A|Bn)*P(Bn)
      // P(B) = 1/teamsize
      this._champProb[champion].teamProb +=
        this._champProb[champion].cProb[oppArr[i]] / oppArr.length;
    }

    const compileResults = (champion) => {
      this.results = `Champion Name: ${champion}
Champion p-value: ${this._champProb[champion].pVal}
Conditional Probability vs. ${oppArr[0]}: ${
        this._champProb[champion].cProb[oppArr[0]]
      }
Conditional Probability vs. ${oppArr[1]}: ${
        this._champProb[champion].cProb[oppArr[1]]
      }
Conditional Probability vs. ${oppArr[2]}: ${
        this._champProb[champion].cProb[oppArr[2]]
      }
Conditional Probability vs. ${oppArr[3]}: ${
        this._champProb[champion].cProb[oppArr[3]]
      }
Conditional Probability vs. ${oppArr[4]}: ${
        this._champProb[champion].cProb[oppArr[4]]
      }
Total Conditional Probability vs. Team ${oppArr
        .toString()
        .split(",")
        .join(",")}: ${this._champProb[champion].teamProb}
Champion's standard deviations from the mean ${
        this._statsObj[champion].deviations
      }
Champion is an outlier based on std dev: ${
        this._statsObj[champion].deviant === true
      }
General Statistics:
Mean Probability for all champions: ${this._genStats.meanP}
Variance for all champions: ${this._genStats.variance}
Standard Deviation for population: ${this._genStats.stdDev}
Champion (Population) Count: ${this._genStats.champCount}`;
    };

    compileResults(champion);
    return this._results;
  }
}
module.exports = {
  LolProbability,
};
