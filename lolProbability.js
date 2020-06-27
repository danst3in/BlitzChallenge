class LolProbability {
  constructor() {
    (this.statsObj = {}), (this.genStats = {});
  }
  // receives Input: array of arrays, returns Output: Stats Object
  // Runtime ~O(n*2m^2) ~~O(n*k)
  mineData(arr) {
    if (!arr) {
      throw new Error("Dataset contains undefined matches");
    }
    // const statsObj = {};
    // const length = arr.length;
    // console.log("mineData -> length", length);

    const updateOpp = (champion, oppChamp, win = true) => {
      if (this.statsObj[champion][oppChamp] === undefined) {
        this.statsObj[champion][oppChamp] = { win: 0, loss: 0, winP: 0 };
      }
      if (win) {
        this.statsObj[champion][oppChamp].win++;
        this.statsObj[champion][oppChamp].winP =
          this.statsObj[champion][oppChamp].win /
          (this.statsObj[champion][oppChamp].win +
            this.statsObj[champion][oppChamp].loss);
      } else {
        this.statsObj[champion][oppChamp].loss++;
        this.statsObj[champion][oppChamp].winP =
          this.statsObj[champion][oppChamp].win /
          (this.statsObj[champion][oppChamp].win +
            this.statsObj[champion][oppChamp].loss);
      }
    };

    const updateChamp = (champion, oppTeam, win = true) => {
      if (this.statsObj[champion] === undefined) {
        this.statsObj[champion] = { win: 0, loss: 0, winP: 0 };
      }

      if (win) {
        this.statsObj[champion].win++;
        this.statsObj[champion].winP =
          this.statsObj[champion].win /
          (this.statsObj[champion].win + this.statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent));
      } else {
        this.statsObj[champion].loss++;
        this.statsObj[champion].winP =
          this.statsObj[champion].win /
          (this.statsObj[champion].win + this.statsObj[champion].loss);
        oppTeam.forEach((opponent) => updateOpp(champion, opponent, false));
      }
    };

    if (arr.length < 3) {
      console.error(`Match #${i + 1} - is missing data.`);
    } else {
      let champOne = arr[0];
      let champTwo = arr[1];

      if (arr[2] === 1) {
        [champOne, champTwo] = [champTwo, champOne];
      }

      champOne.forEach((champ) => updateChamp(champ, champTwo));
      champTwo.forEach((champ) => updateChamp(champ, champOne, false));
    }

    return this.statsObj;
  }

  // Runtime O(3n)
  runChampStats() {
    this.genStats.meanSum = 0;
    this.genStats.meanP = 0;
    this.genStats.variance = 0;
    this.genStats.stdDev = 0;
    this.genStats.champCount = 0;
    // champStats.deviants = {};

    for (const champ of Object.values(this.statsObj)) {
      this.genStats.meanSum += champ.winP;
      this.genStats.champCount++;
    }

    this.genStats.meanP = this.genStats.meanSum / this.genStats.champCount;

    for (const champ of Object.values(this.statsObj)) {
      this.genStats.variance +=
        (champ.winP - this.genStats.meanP) * (champ.winP - this.genStats.meanP);
    }

    this.genStats.variance = this.genStats.variance / this.genStats.champCount;

    this.genStats.stdDev = Math.sqrt(this.genStats.variance);

    for (const champ of Object.values(this.statsObj)) {
      champ.deviations =
        (champ.winP - this.genStats.meanP) / this.genStats.stdDev;
      champ.deviant =
        champ.deviations > 1 ? true : champ.deviations < -1 ? true : false;
      if (champ.deviant === true) {
        console.log(
          "LolProbability -> runChampStats -> champ.deviations - outliers: ",
          champ.deviations
        );
      }
    }

    return this.statsObj;
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
  computePVals(statsObj, champion, oppArr) {
    // console.log("LolProbability -> computePVals -> statsObj", statsObj);
    const champProbObj = {
      pVal: statsObj[champion].winP,
      cProb: {},
      teamProb: 0,
    };

    let champProbs = [];
    let oppProbs = [];
    oppArr.forEach((opp, i) => {
      // WPA    // win% vs particular opponent
      champProbs[i] = statsObj[champion][opp].winP;
      // WP(B)  // opp win% vs vs particular champion
      oppProbs[i] = statsObj[opp][champion].winP;
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
module.exports = {
  LolProbability,
};