# text-graph.js

<p align="center">
<img alt="animation" src="https://github.com/DrA1ex/text-graph.js/assets/1194059/d6b28cfe-0892-496a-8489-603c210d4a5e">
</p>

`text-graph.js` is a JavaScript/TypeScript library that allows you to create charts in the terminal and browser console.
It provides functionality to generate line charts and create a dashboard with multiple charts.

## Features

- Create line charts
- Drawing multiple series on one plot
- Creating dashboards with multiple charts
- Colors for chart elements
- Built-in axis scale functions (i.e. log)
- Built-in different data overflow handling functions (i.e. linear scale, clapm, etc)
- Built-in different data compression functions (i.e. mean, max, etc)

## Installation

```shell
npm install text-graph.js
```

### Run from source

```shell
# clone repo
git clone https://github.com/DrA1ex/text-graph.js.git
cd ./text-graph.js

# install dependencies
npm install

# Run example
npx tsx ./examples/dashboard.ts
```

## Get Started

```javascript
// Importing the Plot class
import {Plot} from 'text-graph.js';

// Creating a new instance of the Plot class with a width of 80 characters and height of 20 characters
const plot = new Plot(80, 20);

// Adding a new series to the plot and storing its ID
const id = plot.addSeries();

// Defining a function that takes a number "x" as input and calculates a mathematical expression
const fn = (x) => Math.pow(Math.sin(x), 3) + Math.pow(Math.cos(x), 3) - 1.5 * Math.sin(x) * Math.cos(x);

// Iterating over a range of values from -2 to just below 2, incrementing by 0.05 at each step
for (let x = -2; x < 2; x += 0.05) {
    // Adding an entry to the series with the given ID, calculated using the function "fn"
    plot.addSeriesEntry(id, fn(x));
}

// Printing the chart output to the console
console.log(plot.paint());
```

Source code: [link](/examples/get-started.ts)

## Usage

To use `text-graph.js`, follow these steps:

1. Import the necessary classes and enums:

```javascript
import {
    Plot, PlotTilePositionFlags, PlotAxisScale, PlotSeriesAggregationFn, PlotSeriesOverflow, Color
} from 'text-graph.js';
```

2. Define the plot options:

```javascript
const plotOptions = {
    showAxis: true,
    title: 'Chart Title',
    horizontalBoundary: 1,
    verticalBoundary: 2,
    titlePosition: PlotTilePositionFlags.top,
    axisScale: PlotAxisScale.linear,
    aggregation: PlotSeriesAggregationFn.mean,
}
```

3. Create a plot instance:

```javascript
const width = 60;
const height = 20;
const plot = new Plot(width, height, plotOptions);
```

4. Define the series configurations:

```javascript
const plotSeriesConfig1 = {
    color: Color.cyan,
    overflow: PlotSeriesOverflow.logScale,
};

const plotSeriesConfig2 = {
    color: Color.magenta,
    overflow: PlotSeriesOverflow.clamp,
};
```

5. Add plot series to the plot:

```javascript
const seriesId1 = plot.addSeries(plotSeriesConfig1);
const seriesId2 = plot.addSeries(plotSeriesConfig2);
```

6. Iterate over your data and update the plot:

```javascript
const data1 = [1, 2, 3];
for (const value of data1) {
    plot.addSeriesEntry(seriesId1, value);
}

const data2 = [0, -1, -2];
for (const value of data2) {
    plot.addSeriesEntry(seriesId2, value);
}

const chartData = plot.paint();
console.clear()
console.log(chartData);
```

## Examples

### Single Series Chart

<img width="800" src="https://github.com/DrA1ex/text-graph.js/assets/1194059/a68f5175-34db-4462-8de2-649b60dd375b">

Source code: [link](/examples/single.ts)

### Multi-line Series Chart 

<img width="800" src="https://github.com/DrA1ex/text-graph.js/assets/1194059/725b01bb-2bdb-47b8-b8e2-2728059000b1">

Source code: [link](/examples/multi-series.ts)

### Dashboard

<img width="800" src="https://github.com/DrA1ex/text-graph.js/assets/1194059/483a9035-9ab2-4439-88eb-0a44171b0ebe">

Source code: [link](/examples/dashboard.ts)
## License

`text-graph.js` is released under the [BSD-3-Clause License](/LICENSE).
