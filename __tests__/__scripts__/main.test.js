const {
  LolProbability,
} = require("../../src/lib/LeagueOfLegendsMatchProbability.js");
const { loadData } = require("../../__mocks__/load-data.js");

describe("Processed incoming data: ", () => {
  test("Returned data is instance of LoLProbability Class", () => {
    const lolBattleTest = new LolProbability();
    return loadData(lolBattleTest).then((classObj) => {
      // console.log("test1!");
      expect(classObj.constructor.name).toBe("LolProbability");
    });
  });
  test("Returned general statistics equal expected result", () => {
    const lolStatTest = new LolProbability();
    return loadData(lolStatTest).then((classObj) => {
      // console.log("test2!");
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
