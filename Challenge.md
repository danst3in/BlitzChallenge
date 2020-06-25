# LoL matchups

I have ~~attached `matches.json`~~ included [a link to `matches.json`](http://dzheng.freeshell.org/matches.json.gz) (the first try didn't work because GitHub Gist doesn't support large files) which is a weighted dataset that I randomly generated with specific weight values.

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
