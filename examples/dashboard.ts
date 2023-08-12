import {Color, BackgroundColor, MultiPlotChart, PlotAxisScale, PlotSeriesAggregationFn, PlotSeriesOverflow} from "../src";

const chart = new MultiPlotChart({
    title: "Dashboard chart",
    titleBoundary: 2,
    titleSpacing: 8,
    titleForeground: Color.blue,
    titleBackground: BackgroundColor.black,
});

chart.addPlot({xOffset: 0, yOffset: 0, width: 40, height: 31}, {
    title: "overflow: skip",
});

chart.addPlot({xOffset: 42, yOffset: 0, width: 60, height: 15}, {
    title: "overflow: logScale (agg: max)",
    axisScale: PlotAxisScale.log,
});

chart.addPlot({xOffset: 42, yOffset: 16, width: 60, height: 15}, {
    title: "overflow: linearScale (agg: mean)",
    axisScale: PlotAxisScale.logInverted,
    aggregation: PlotSeriesAggregationFn.mean
});

chart.addPlotSeries(0, {color: Color.red, overflow: PlotSeriesOverflow.clamp});
chart.addPlotSeries(1, {color: Color.blue, overflow: PlotSeriesOverflow.linearScale});
chart.addPlotSeries(2, {color: Color.yellow});

let delay = 66; // Delay in milliseconds

for (let i = 0; i < 2000; i++) {
    setTimeout(() => {
        chart.addSeriesEntry(0, 0, Math.cos(i * Math.PI / 15));
        chart.addSeriesEntry(1, 0, Math.sin(i * Math.PI / 30) * 100 + 2);
        chart.addSeriesEntry(2, 0, Math.cos(i * Math.PI / 30) * 100 + 2);

        const chartData = chart.paint();
        console.clear();
        console.log(chartData);
    }, delay * i);
}