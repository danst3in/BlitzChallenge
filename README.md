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

### Make the chance of draws a non-factor...

PA = WPA*(1 - WPB) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PA = winning%AvsB \*(loss%BvsA) / PNoDraw

PB = WPB*(1 - WPA) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PB = winning%BvsA \*(loss%AvsB) / PNoDraw

### Final Conditional Probability of A winning given opponent B

P(WPA|WPB) = WPA*(1 - WPB) / WPA*(1 - WPB) + WPB\*(1 - WPA)

PA = winning%AvsB \*(loss%BvsA) / PNoDraw

# Additional Comments

I chose to feed the json dataset as a node stream that was pumped to the main functions on a per match basis. In the end this seems to have slowed the program run time by ~15%-25%.
This was added after the program was mostly completed as an experiment so I chose to leave it in there.
With further tweaking of the size of each data chunk (ie. increase from 1 to 100 matches) perhaps this could be improved?

For the given use case of testing a single Champion's probabilities I opted to use dictionary-like objects offering direct lookup.
Each Champion is represented by an object containing their overall win, loss, and win%. Within this object is also an object for each of the opponents they have ever competed with and all of their individual matchup data. The individual matchup data is later used for calculating the conditional probabilities.

```js
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
```

As the program continues to run the Champion object is updated to include individual stats of standard deviation and if they are more than 1 std dev from the mean it is marked true to be search later (if this was going to happen frequently it might save time to sort champions by std dev and perform a binary search).

After all general stats for the entire data set are completed the probabilities will be computed for the chosen Champion and the chosen opposing team.
