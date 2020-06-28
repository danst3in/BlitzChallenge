# Getting Started

Please see below the challenge instructions for my overall solution strategy.

The program can be run via the following command

```js
 npm start
```

To test additional combinations please edit line 8 in _main.js_
The second argument is the name of the Champion to be analyzed.
The third argument is an array of strings representing the opposing team.

```js
loadData(lolBattleTest, "Gangplank", [
  "Evelynn",
  "Fiddlesticks",
  "Rakan",
  "Warwick",
  "Sett",
]);
```

A few simple tests are available via the following command

```js
 npm test
```

# BlitzChallenge

Coding Challenge for Blitz.gg

The format of each match is like so:

```js
[
  // Team 1
  [...], // Champion IDs

  // Team 2
  [...], // Champion IDs

  // 0 means team 1 won, 1 means team 2 won
  0 || 1
]
```

## Main challenge

Find the p-value (calculated probability) for each champion winning a match.

### Secondary challenge

Find the p-value of a champion winning a match, given the enemy team's composition (conditional probability).

## Evaluation

The challenge will be graded on how closely the results reflect the weighted probabilities. There are some clear statistical anomalies in the data set. Identify which champions fall outside of a standard deviation.

# Overall strategy based on the following mathematical model:

Prob Formula Source - https://sabr.org/journal/article/probabilities-of-victory-in-head-to-head-team-matchups/
Probabilities of Victory in Head-to-Head Team Matchups by John A. Richards

PA = WPA*(1 - WPB), PA = winning%AvsB *(loss%BvsA)

PB = WPB*(1 - WPA), PB = winning%BvsA *(loss%AvsB)

PDraw = 1 - WPA*(1 - WPB) + WPB*(1 - WPA)

#### Make the chance of draws a non-factor...

PA = WPA*(1 - WPB) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PA = winning%AvsB \*(loss%BvsA) / PNoDraw

PB = WPB*(1 - WPA) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PB = winning%BvsA \*(loss%AvsB) / PNoDraw

#### Final Conditional Probability of A winning given opponent B

P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PA = winning%AvsB \*(loss%BvsA) / PNoDraw
