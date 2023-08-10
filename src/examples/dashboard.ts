import {Color, PlotAxisScale, PlotSeriesOverflow} from "../enum";
import {MultiPlotChart} from "../multi-plot";

const chart = new MultiPlotChart();

chart.addPlot({xOffset: 0, yOffset: 0, width: 40, height: 31}, {
    title: "overflow: skip"
});

chart.addPlot({xOffset: 42, yOffset: 0, width: 60, height: 15}, {
    title: "overflow: logScale",
    axisScale: PlotAxisScale.log,
});

chart.addPlot({xOffset: 42, yOffset: 16, width: 60, height: 15}, {
    title: "overflow: linearScale",
    axisScale: PlotAxisScale.logInverted
});

chart.addPlotSeries(0, {color: Color.red, overflow: PlotSeriesOverflow.skip});
chart.addPlotSeries(1, {color: Color.blue, overflow: PlotSeriesOverflow.logScale});
chart.addPlotSeries(2, {color: Color.yellow});

let delay = 66; // Delay in milliseconds

for (let i = 0; i < 2000; i++) {
    setTimeout(() => {
        chart.addSeriesEntry(0, 0, Math.cos(i * Math.PI / 15) - 2);
        chart.addSeriesEntry(1, 0, Math.sin(i * Math.PI / 30) * 100 + 2);
        chart.addSeriesEntry(2, 0, Math.sin(i * Math.PI / 30) * 100 + 2);

        const chartData = chart.paint();
        console.clear();
        console.log(chartData);
    }, delay * i);
}