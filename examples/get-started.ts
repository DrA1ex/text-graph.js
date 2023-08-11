// Importing the Plot class
import {Plot} from "../src";

// Creating a new instance of the Plot class with a width of 80 characters and height of 20 characters
const plot = new Plot(80, 20);

// Adding a new series to the plot and storing its ID
const id = plot.addSeries();

// Defining a function that takes a number "x" as input and calculates a mathematical expression
const fn = (x: number) => Math.pow(Math.sin(x), 3) + Math.pow(Math.cos(x), 3) - 1.5 * Math.sin(x) * Math.cos(x);

// Iterating over a range of values from -2 to just below 2, incrementing by 0.05 at each step
for (let x = -2; x < 2; x += 0.05) {
    // Adding an entry to the series with the given ID, calculated using the function "fn"
    plot.addSeriesEntry(id, fn(x));
}

// Printing the chart output to the console
console.log(plot.paint());