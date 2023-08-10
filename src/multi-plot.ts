import {Color} from "./enum";
import {Plot, PlotOptions, PlotSeriesConfig} from "./plot";

type ChartPlotConfig = {
    xOffset: number,
    yOffset: number,
    width: number,
    height: number,
};

export class MultiPlotChart {
    public width: number = 0;
    public height: number = 0;

    public readonly plots: Plot[] = [];
    private readonly configs = new Map<Plot, ChartPlotConfig>();

    public screen!: string[][];

    public addPlot(config: ChartPlotConfig, options?: Partial<PlotOptions>): number {
        const plot = new Plot(config.width, config.height, options);
        this.plots.push(plot);
        this.configs.set(plot, config);

        let width = 0, height = 0;
        for (const conf of this.configs.values()) {
            width = Math.max(width, conf.xOffset + conf.width);
            height = Math.max(height, conf.yOffset + conf.height);
        }

        this.width = width;
        this.height = height;
        this.screen = new Array(height);
        for (let i = 0; i < height; i++) {
            this.screen[i] = new Array(width).fill(Plot.SpaceSymbol);
        }

        return this.plots.length - 1;
    }

    public addPlotSeries(plotId: number, config: Partial<PlotSeriesConfig>): number {
        this._assertChartId(plotId);

        return this.plots[plotId].addSeries(config);
    }

    public addSeriesEntry(plotId: number, seriesId: number, entry: number) {
        this._assertChartId(plotId);

        this.plots[plotId].addSeriesEntry(seriesId, entry);
    }

    public redraw() {
        for (const plot of this.plots) {
            this._drawPlot(plot);
        }
    }

    public paint(): string {
        this.redraw();

        return this.screen.map(row => row.join("")).join("\n") + Color.reset;
    }

    private _assertChartId(id: number) {
        if (id >= this.plots.length) {
            throw new Error("Wrong chart id");
        }
    }

    private _drawPlot(plot: Plot) {
        const config = this.configs.get(plot)!;
        const {xOffset, yOffset} = config;

        plot.redraw();
        for (let y = 0; y < plot.screen.length; y++) {
            const row = plot.screen[y];
            for (let x = 0; x < row.length; x++) {
                this.screen[y + yOffset][x + xOffset] = row[x];
            }
        }
    }
}