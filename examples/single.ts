import {Plot} from "../src/plot";
import {Color, PlotAxisScale, PlotSeriesAggregationFn, PlotSeriesOverflow, PlotTilePositionFlags} from "../src/enum";

// Define the plot options
const plotOptions = {
    showAxis: true,
    horizontalBoundary: 0,
    verticalBoundary: 1,
    title: 'Sample Line Chart',
    titlePosition: PlotTilePositionFlags.top,
    axisScale: PlotAxisScale.linear,
    aggregation: PlotSeriesAggregationFn.skip,
};

// Add a plot to the chart
const plot = new Plot(80, 20, plotOptions);

// Define the series configuration
const seriesConfig = {
    color: Color.yellow,
    overflow: PlotSeriesOverflow.linearScale,
};

// Add new plot series
const seriesId = plot.addSeries(seriesConfig);

// Define function
const fn = (x: number) => -Math.pow(x, 2) + plot.width * x;

// Add data entries to the series
for (let i = 0; i <= plot.width; i++) {
    plot.addSeriesEntry(seriesId, fn(i));
}

// Generate and print the chart data
const chartData = plot.paint();
console.log(chartData);