class StatsTracker {
  constructor() {
    this._statsObj = {};
  }

  getAccumulatedStats() {
    return this._statsObj;
  }

  updateOpponentStats(champion, oppChamp, win = true) {
    if (this.getMatchStats(champion, oppChamp)) {
      this.initializeMatchStats(champion, oppChamp);
    }
    if (win) {
      this.updateOpponentWinCount(champion, oppChamp);
      this.updateOpponentWinPercentage(champion, oppChamp);
    } else {
      this.updateOpponentLossCount(champion, oppChamp);
      this.updateOpponentWinPercentage(champion, oppChamp);
    }
  }

  updateChampionStatistics(champion, oppTeam, win = true) {
    if (this.getChampionStats(champion)) {
      this.initializeChampionStats(champion);
    }

    if (win) {
      this.updateChampionWinCount(champion);
      this.updateChampionWinPercentage(champion);
      oppTeam.forEach((opponent) =>
        this.updateOpponentStats(champion, opponent)
      );
    } else {
      this.updateChampionLossCount(champion);
      this.updateChampionWinPercentage(champion);
      oppTeam.forEach((opponent) =>
        this.updateOpponentStats(champion, opponent, false)
      );
    }
  }

  // Champion overall functions
  getChampionStats(champion) {
    return this._statsObj[champion] === undefined;
  }

  initializeChampionStats(champion) {
    this._statsObj[champion] = { win: 0, loss: 0, winP: 0 };
  }
  updateChampionLossCount(champion) {
    this._statsObj[champion].loss++;
  }

  updateChampionWinPercentage(champion) {
    this._statsObj[champion].winP =
      this._statsObj[champion].win /
      (this._statsObj[champion].win + this._statsObj[champion].loss);
  }

  updateChampionWinCount(champion) {
    this._statsObj[champion].win++;
  }

  // Matchup vs opponent functions

  getMatchStats(champion, oppChamp) {
    return this._statsObj[champion][oppChamp] === undefined;
  }

  initializeMatchStats(champion, oppChamp) {
    this._statsObj[champion][oppChamp] = { win: 0, loss: 0, winP: 0 };
  }

  updateOpponentLossCount(champion, oppChamp) {
    this._statsObj[champion][oppChamp].loss++;
  }

  updateOpponentWinPercentage(champion, oppChamp) {
    this._statsObj[champion][oppChamp].winP =
      this._statsObj[champion][oppChamp].win /
      (this._statsObj[champion][oppChamp].win +
        this._statsObj[champion][oppChamp].loss);
  }
  updateOpponentWinCount(champion, oppChamp) {
    this._statsObj[champion][oppChamp].win++;
  }
}

class LolProbability {
  constructor() {
    this._statsObj = new StatsTracker();
    this._genStats = {};
    this._champProb = {};
    this._results = "";
  }

  get statsObj() {
    return this._statsObj.getAccumulatedStats();
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

  /**
   * Runtime ~O(n*2m^2) ~~ O(n*k)
   *
   * @param {*} matchArray array of Opponent Strings
   *
   * @returns {object} updated match history Stats Object
   */
  mineData(matchArray) {
    if (!matchArray) {
      throw new Error("Dataset contains undefined matches");
    }

    if (matchArray.length < 3) {
      console.error(`Match ${matchArray} - is corrupted, skipping...`);
    } else {
      const teamOne = matchArray[0];
      const teamTwo = matchArray[1];
      const winningTeam = matchArray[2];
      const isTeamOneWinner = winningTeam === 0;

      if (isTeamOneWinner) {
        teamOne.forEach((teamMember) =>
          this._statsObj.updateChampionStatistics(teamMember, teamTwo)
        );
        teamTwo.forEach((teamMember) =>
          this._statsObj.updateChampionStatistics(teamMember, teamOne, false)
        );
      } else {
        teamOne.forEach((teamMember) =>
          this._statsObj.updateChampionStatistics(teamMember, teamTwo, false)
        );
        teamTwo.forEach((teamMember) =>
          this._statsObj.updateChampionStatistics(teamMember, teamOne)
        );
      }
    }

    return this._statsObj.getAccumulatedStats();
  }

  /**
   * Runtime O(3n)
   *
   * Compute General Statistics for Data Set
   *
   * Update this._genStats object
   *
   * @returns {object} this._statsObj
   */
  runChampStats() {
    if (this.getGeneralStats()) {
      this.initializeGeneralStats();
    }

    for (const champ of Object.values(this.statsObj)) {
      this._genStats.meanSum += champ.winP;
      this._genStats.champCount++;
    }

    this._genStats.meanP = this._genStats.meanSum / this._genStats.champCount;

    for (const champ of Object.values(this.statsObj)) {
      this._genStats.variance +=
        (champ.winP - this._genStats.meanP) *
        (champ.winP - this._genStats.meanP);
    }

    this._genStats.variance =
      this._genStats.variance / this._genStats.champCount;

    this._genStats.stdDev = Math.sqrt(this._genStats.variance);

    for (const champ of Object.values(this.statsObj)) {
      champ.deviations =
        (champ.winP - this._genStats.meanP) / this._genStats.stdDev;
      champ.deviant =
        champ.deviations > 1 ? true : champ.deviations < -1 ? true : false;
      if (champ.deviant === true) {
        this._genStats.deviants.push([champ.deviations]);
      }
    }

    return this._genStats;
  }

  getGeneralStats() {
    return this._genStats.meanSum === undefined;
  }

  initializeGeneralStats() {
    this._genStats.meanSum = 0;
    this._genStats.meanP = 0;
    this._genStats.variance = 0;
    this._genStats.stdDev = 0;
    this._genStats.champCount = 0;
    this._genStats.deviants = [];
  }

  // Prob Formula Source - https://sabr.org/journal/article/probabilities-of-victory-in-head-to-head-team-matchups/
  // Probabilities of Victory in Head-to-Head Team Matchups by John A. Richards
  // PA = WPA*(1 - WPB)   // PA = winning%AvsB *(loss%BvsA)
  // PB = WPB*(1 - WPA)   // PB = winning%BvsA *(loss%AvsB)

  // PDraw = 1 - WPA*(1 - WPB)  + WPB*(1 - WPA)

  // PA = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw
  // PB = WPB*(1 - WPA) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PB = winning%BvsA *(loss%AvsB) / PNoDraw

  // P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB)  + WPB*(1 - WPA) // PA = winning%AvsB *(loss%BvsA) / PNoDraw

  /**
   * Runtime ~O(2m) ~~ O(k)
   * @param {string} champion
   * @param {[string]} oppArr
   */
  computePVals(champion, oppArr) {
    if (this.getChampionProbability(champion)) {
      this.initializeChampionProbability(champion);
    }

    /**
     * @param champProbs Array of WPA - win% vs particular opponent
     */

    let champProbs = [];

    /**
     * @param oppProbs Array of WPB - opp win% vs vs particular champion
     */

    let oppProbs = [];

    oppArr.forEach((opp, i) => {
      champProbs[i] = this.statsObj[champion][opp].winP;
      oppProbs[i] = this.statsObj[opp][champion].winP;
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
        this.statsObj[champion].deviations
      }
Champion is an outlier based on std dev: ${
        this.statsObj[champion].deviant === true
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

  getChampionProbability(champion) {
    return this._champProb[champion] === undefined;
  }

  initializeChampionProbability(champion) {
    this._champProb[champion] = {
      pVal: this.statsObj[champion].winP,
      cProb: {},
      teamProb: 0,
    };
  }
}
module.exports = {
  LolProbability,
};
