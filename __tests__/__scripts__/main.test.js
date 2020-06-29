const {
  LolProbability,
} = require("../../src/lib/LeagueOfLegendsMatchProbability.js");
const { loadData } = require("../../__mocks__/load-data.js");

describe("Processed incoming data: ", () => {
  test("Returned data is instance of LoLProbability Class", () => {
    const lolBattleTest = new LolProbability();
    return loadData(lolBattleTest, "Gangplank", [
      "Evelynn",
      "Fiddlesticks",
      "Rakan",
      "Warwick",
      "Sett",
    ]).then((classObj) => {
      expect(classObj.constructor.name).toBe("LolProbability");
    });
  });
  test("Returned general statistics equal expected result", () => {
    const lolStatTest = new LolProbability();
    return loadData(lolStatTest, "Gangplank", [
      "Evelynn",
      "Fiddlesticks",
      "Rakan",
      "Warwick",
      "Sett",
    ]).then((classObj) => {
      expect(classObj.genStats).toEqual({
        meanSum: 5,
        meanP: 0.5,
        variance: 0,
        stdDev: 0,
        champCount: 10,
        deviants: [],
      });
    });
  });
});

// compute p values for a given Mined Battle Stats: object, Champion: string, Opposing Team [string:5]
// additional test
//  "Leblanc", [
//     "Braum",
//     "Kayle",
//     "Anivia",
//     "Quinn",
//     "Mordekaiser",
//   ])
