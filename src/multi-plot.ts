import {BackgroundColor, Color, LabelPositionFlags} from "./enum";
import {Plot, PlotOptions, PlotSeriesConfig} from "./plot";
import {Label, LabelDefaults} from "./label";

type ChartPlotConfig = {
    xOffset: number,
    yOffset: number,
    width: number,
    height: number,
};

type MultiPlotOptionsT = {
    title: string,
    titlePosition: LabelPositionFlags,
    titleForeground: Color,
    titleBackground: BackgroundColor,
    titleBoundary: number,
    titleSpacing: number,
}

const MultiPlotOptionsDefaults = {
    title: "",
    titlePosition: LabelDefaults.align,
    titleForeground: LabelDefaults.foregroundColor,
    titleBackground: LabelDefaults.backgroundColor,
    titleBoundary: 1,
    titleSpacing: LabelDefaults.spacing,
}

export class MultiPlotChart {
    public width: number = 0;
    public height: number = 0;

    public title: string;
    public titlePosition: LabelPositionFlags;
    public titleForeground: Color;
    public titleBackground: BackgroundColor;
    public titleBoundary: number;
    public titleSpacing: number;

    public readonly plots: Plot[] = [];
    private readonly configs = new Map<Plot, ChartPlotConfig>();

    public screen!: string[][];

    constructor(options: Partial<MultiPlotOptionsT> = {}) {
        const opts = {...MultiPlotOptionsDefaults, ...options};

        this.title = opts.title;
        this.titlePosition = opts.titlePosition;
        this.titleForeground = opts.titleForeground;
        this.titleBackground = opts.titleBackground;
        this.titleBoundary = opts.titleBoundary;
        this.titleSpacing = opts.titleSpacing;
    }

    public addPlot(config: ChartPlotConfig, options?: Partial<PlotOptions>): number {
        const plot = new Plot(config.width, config.height, options);
        this.plots.push(plot);
        this.configs.set(plot, config);

        let width = 0, height = 0;
        for (const conf of this.configs.values()) {
            width = Math.max(width, conf.xOffset + conf.width);
            height = Math.max(height, conf.yOffset + conf.height);
        }

        if (this.title) {
            height += this.titleBoundary;
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
        if (this.title) {
            const titleLabel = new Label(
                this.title, this.width, this.height, 0, LabelPositionFlags.top, this.titleSpacing
            );

            titleLabel.foregroundColor = this.titleForeground;
            titleLabel.backgroundColor = this.titleBackground;
            titleLabel.draw(this.screen, 0, 0);
        }

        const xGlobalOffset = 0;
        const yGlobalOffset = this.title ? this.titleBoundary : 0;

        for (const plot of this.plots) {
            this._drawPlot(plot, xGlobalOffset, yGlobalOffset);
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

    private _drawPlot(plot: Plot, xGlobalOffset: number, yGlobalOffset: number) {
        const config = this.configs.get(plot)!;
        const {xOffset, yOffset} = config;

        plot.redraw();
        for (let y = 0; y < plot.screen.length; y++) {
            const row = plot.screen[y];
            for (let x = 0; x < row.length; x++) {
                this.screen[y + yOffset + yGlobalOffset][x + xOffset + xGlobalOffset] = row[x];
            }
        }
    }
}