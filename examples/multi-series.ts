import {Plot, Color, PlotAxisScale, PlotSeriesAggregationFn, PlotSeriesOverflow, LabelPositionFlags} from "../src";

const plotOptions = {
    showAxis: true, // Show vertical axis
    title: "Multi-Series Demo", // Title of the chart
    titlePosition: LabelPositionFlags.top, // Position of the title
    axisScale: PlotAxisScale.linear, // Scale of the axis
    aggregation: PlotSeriesAggregationFn.mean, // Aggregation type for data points
};

const plot = new Plot(80, 20, plotOptions);

const scale = PlotSeriesOverflow.linearScale // Overflow behavior of the series
const seriesConfig1 = {
    color: Color.red, // Color of the first series
    overflow: scale
};

const seriesConfig2 = {
    color: Color.green, // Color of the second series
    overflow: scale
};

const seriesConfig3 = {
    color: Color.cyan, // Color of the third series
    overflow: scale
};

const seriesId1 = plot.addSeries(seriesConfig1);
const seriesId2 = plot.addSeries(seriesConfig2);
const seriesId3 = plot.addSeries(seriesConfig3);

const fn1 = (x: number) => Math.sin(x) * Math.exp(-0.1 * x);
const fn2 = (x: number) => 0.8 * Math.sin(x) + 0.6 * Math.sin(2 * x) + 0.4 * Math.sin(3 * x);
const fn3 = (x: number) => Math.sin(x) * Math.cos(2 * x) + Math.cos(x) * Math.sin(2 * x);

const delay = 66;

async function draw() {
    for (let x = -2; x <= 2; x += 0.03) {
        plot.addSeriesEntry(seriesId1, fn1(x));
        plot.addSeriesEntry(seriesId2, fn2(x));
        plot.addSeriesEntry(seriesId3, fn3(x));

        const chartData = plot.paint();
        console.clear();
        console.log(chartData);

        await _delay(delay);
    }
}

// Start animated drawing
draw();

// Auxiliary function to avoid setTimeout in loop
function _delay(d: number) { return new Promise(resolve => setTimeout(resolve, d))}