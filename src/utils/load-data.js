const fs = require("fs");
const path = require("path");

function loadData(testSuiteObj, challenger, opponents) {
  return new Promise((resolve, reject) => {
    // //  mine json data file
    let lolData = fs.createReadStream(
      path.join(__dirname, "../../matches.json"),
      {
        flags: "r",
        encoding: "utf-8",
      }
    );
    let buff = "";

    function pump() {
      let pointer =
        Math.min(buff.indexOf(",0]"), buff.indexOf(",1]")) !== -1
          ? Math.min(buff.indexOf(",0]"), buff.indexOf(",1]"))
          : Math.max(buff.indexOf(",0]"), buff.indexOf(",1]"));

      while (pointer >= 0) {
        pointer += 3;
        processLine(buff.slice(0, pointer));
        buff = buff.slice(pointer + 1);
        if (buff[0] === ",") {
          buff = buff.slice(1);
        }
        pointer =
          Math.min(buff.indexOf(",0]"), buff.indexOf(",1]")) !== -1
            ? Math.min(buff.indexOf(",0]"), buff.indexOf(",1]"))
            : Math.max(buff.indexOf(",0]"), buff.indexOf(",1]"));
      }
    }

    function processLine(line) {
      // make the JSON input bulletproof
      if (line.indexOf("[[[") === 0) {
        line = line.slice(1);
      }
      if (line.indexOf("]]") === [line.length - 2]) {
        line = line.slice(0, -1);
      }
      if (line[line.length - 1] === ",") {
        line = line.slice(0, line.length - 1);
      }
      if (line[0] === ",") {
        line = line.slice(1);
      }
      if (line.length > 0) {
        let battleArr = JSON.parse(line);
        testSuiteObj.mineData(battleArr);
      }
    }

    lolData.on("data", (d) => {
      buff += d.toString();
      pump();
    });
    lolData.on("error", (err) => {
      console.error(err);
    });

    lolData.on("end", () => {
      // compute general statistics for a given mined battle data object
      testSuiteObj.runChampStats();

      // execute probability test
      // compute p values for a given Mined Battle Stats: object, Champion: string, Opposing Team [string:5]
      testSuiteObj.computePVals(challenger, opponents);
      resolve(testSuiteObj);
    });

    lolData.on("error", reject);
  });
}

module.exports = { loadData };
