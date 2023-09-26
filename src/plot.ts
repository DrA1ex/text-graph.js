import {
    Color,
    PlotAxisScale,
    PlotSeriesAggregationFn,
    PlotSeriesOverflow,
    LabelPositionFlags, BackgroundColor
} from "./enum";
import {Axis} from "./axis";
import * as Utils from "./utils"
import {Label, LabelDefaults} from "./label";

enum States {
    straight = 0,
    up = 1,
    down = 2
}


export type PlotOptions = {
    showAxis: boolean,
    horizontalBoundary: number
    verticalBoundary: number
    title: string,
    titlePosition: LabelPositionFlags,
    titleForeground: Color,
    titleBackground: BackgroundColor,
    titleSpacing: number,
    axisScale: PlotAxisScale,
    aggregation: Utils.AggregationFn,
    axisLabelsFraction: number,
    zoom: boolean,
}

export type PlotStaticOptions = {
    width: number,
    height: number
} & PlotOptions;

export const PlotCtorDefaultOptions = {
    width: 80,
    height: 10,
    showAxis: true,
    axisScale: PlotAxisScale.linear,
    title: "",
    titlePosition: LabelDefaults.align,
    titleForeground: LabelDefaults.foregroundColor,
    titleBackground: LabelDefaults.backgroundColor,
    titleSpacing: LabelDefaults.spacing,
    horizontalBoundary: 0,
    axisLabelsFraction: 2,
    zoom: false
}


export type PlotSeriesConfig = {
    color: Color,
    overflow: PlotSeriesOverflow
}

const PlotSeriesDefaults: PlotSeriesConfig = {
    color: Color.default,
    overflow: PlotSeriesOverflow.linearScale
}

const PlotDefaultAggregation = {
    [PlotAxisScale.linear]: PlotSeriesAggregationFn.mean,
    [PlotAxisScale.log]: PlotSeriesAggregationFn.max,
    [PlotAxisScale.logInverted]: PlotSeriesAggregationFn.min,
} as { [key in PlotAxisScale]: Utils.AggregationFn }

export class Plot {
    static readonly AxisSymbol = "┼"
    static readonly SpaceSymbol = " ";

    static readonly ChartHorizontal = ["─", "╯", "╮",];
    static readonly ChartVertical = ["│", "╭", "╰",];

    public showAxis: boolean;
    public aggregationFn: Utils.AggregationFn;
    public axisScale: PlotAxisScale;
    public horizontalBoundary: number;
    public verticalBoundary: number;
    public axisLabelsFraction: number;
    public title: string;
    public titlePosition: LabelPositionFlags;
    public titleForeground: Color;
    public titleBackground: BackgroundColor;
    public titleSpacing: number;
    public zoom: boolean;

    public readonly width;
    public readonly height;

    public readonly screen!: string[][];

    private readonly series: number[][] = [];
    readonly seriesConfigs: PlotSeriesConfig[] = [];

    constructor(
        width = PlotCtorDefaultOptions.width, height = PlotCtorDefaultOptions.height, {
            showAxis = PlotCtorDefaultOptions.showAxis,
            axisScale = PlotCtorDefaultOptions.axisScale,
            aggregation = PlotDefaultAggregation[axisScale] ?? PlotSeriesAggregationFn.skip,
            title = PlotCtorDefaultOptions.title,
            titlePosition = PlotCtorDefaultOptions.titlePosition,
            titleForeground = PlotCtorDefaultOptions.titleForeground,
            titleBackground = PlotCtorDefaultOptions.titleBackground,
            titleSpacing = PlotCtorDefaultOptions.titleSpacing,
            horizontalBoundary = PlotCtorDefaultOptions.horizontalBoundary,
            verticalBoundary = title ? 1 : 0,
            axisLabelsFraction = PlotCtorDefaultOptions.axisLabelsFraction,
            zoom = PlotCtorDefaultOptions.zoom,
        }: Partial<PlotOptions> = {}
    ) {
        this.width = width;
        this.height = height;

        this.showAxis = showAxis;
        this.axisScale = axisScale;
        this.aggregationFn = aggregation;
        this.zoom = zoom;

        this.title = title;
        this.titlePosition = titlePosition;
        this.titleForeground = titleForeground;
        this.titleBackground = titleBackground;
        this.titleSpacing = titleSpacing;

        this.horizontalBoundary = horizontalBoundary;
        this.verticalBoundary = verticalBoundary;
        this.axisLabelsFraction = axisLabelsFraction;

        this.screen = new Array(this.height);
        for (let i = 0; i < this.height; i++) {
            this.screen[i] = new Array(this.width).fill(Plot.SpaceSymbol);
        }
    }

    static plot(
        data: number[], plotOptions?: Partial<PlotStaticOptions>,
        seriesOptions: Partial<PlotSeriesConfig> = {}
    ): string {
        const opts = {...PlotCtorDefaultOptions, ...plotOptions}
        const p = new Plot(opts.width, opts.height, opts);

        p.addSeries(seriesOptions);
        p.addSeriesRange(0, data);

        return p.paint();
    }

    public addSeries(options: Partial<PlotSeriesConfig> = {}) {
        this.series.push([])
        this.seriesConfigs.push({...PlotSeriesDefaults, ...options});

        return this.series.length - 1;
    }

    public addSeriesEntry(seriesIndex: number, value: number) {
        if (seriesIndex >= this.series.length) throw new Error("Wrong series index");
        this.series[seriesIndex].push(value);
    }

    public addSeriesRange(seriesIndex: number, data: number[]) {
        if (seriesIndex >= this.series.length) throw new Error("Wrong series index");
        this.series[seriesIndex].push(...data);
    }

    public redraw() {
        this._clear();

        const size = Math.max(2, this.height - this.verticalBoundary * 2);
        let [min, max] = Utils.minMax2d(this.series);
        const axis = new Axis(min, max, size, this.axisScale);

        const yOffset = (this.height - size) / 2;
        let xOffset = 0;
        if (this.showAxis) {
            const labelPadding = this._drawAxis(yOffset, axis.labels);
            xOffset = labelPadding + 2;
        }

        const maxSeriesLength = this.width - xOffset - this.horizontalBoundary * 2 + 1;
        for (let i = 0; i < this.series.length; i++) {
            if (this.series[i].length <= 1) continue;

            const {color, overflow} = this.seriesConfigs[i];
            const seriesData = this.zoom ? Utils.zoomData(this.series[i], maxSeriesLength) : this.series[i];
            const data = this._handleOverflow(seriesData, overflow, maxSeriesLength);

            let lastState = States.straight;
            let lastY = yOffset + axis.getPosition(data[0]);
            let x = xOffset + this.horizontalBoundary;

            for (let j = 1; j < data.length; j++) {
                if (!Number.isFinite(data[j])) break;

                const y = yOffset + axis.getPosition(data[j]);
                const state = y === lastY ? States.straight
                    : y < lastY ? States.up : States.down;

                if (lastState === States.straight) {
                    this.screen[lastY][x++] = color + Plot.ChartHorizontal[lastState];
                    this.screen[lastY][x] = color + Plot.ChartHorizontal[state];
                } else {
                    this.screen[lastY][x++] = color + Plot.ChartVertical[lastState];

                    if (state === States.straight) {
                        this.screen[y][x] = color + Plot.ChartHorizontal[state];
                    } else {
                        this.screen[lastY][x] = color + Plot.ChartHorizontal[state];
                        this.screen[y][x] = color + Plot.ChartVertical[state];
                    }
                }

                if (y !== lastY) {
                    this._fillVertical(color, x, Math.min(y, lastY) + 1, Math.max(y, lastY) - 1);
                }

                lastY = y;
                lastState = state;
            }
        }

        const titleLabel = new Label(
            this.title, this.width, this.height, this.horizontalBoundary, this.titlePosition, this.titleSpacing
        );
        titleLabel.foregroundColor = this.titleForeground;
        titleLabel.backgroundColor = this.titleBackground;
        titleLabel.draw(this.screen, xOffset, 0);
    }

    public paint(): string {
        this.redraw();

        return this.screen.map(row => row.join("")).join("\n") + Color.reset;
    }

    private _drawAxis(yOffset: number, axisValues: number[]) {
        const size = axisValues.length;
        const labelPadding = Math.max(
            Math.abs(axisValues[0]).toFixed(this.axisLabelsFraction).length,
            Math.abs(axisValues[size - 1]).toFixed(this.axisLabelsFraction).length) + 1;

        for (let i = 0; i < this.height; i++) {
            const index = this.height - 1 - i;
            this.screen[index][labelPadding + 1] = Color.default + Plot.AxisSymbol;

            const labelIndex = i - yOffset;
            if (labelIndex >= 0 && labelIndex < size) {
                const axisValue = axisValues[labelIndex];
                const label = Utils.toFixed(axisValue, this.axisLabelsFraction).padStart(labelPadding, " ");

                for (let j = 0; j < label.length; j++) {
                    this.screen[index][j] = Color.default + label[j];
                }
            }
        }

        return labelPadding;
    }

    private _clear() {
        for (let i = 0; i < this.height; i++) {
            this.screen[i].fill(Plot.SpaceSymbol);
        }
    }

    private _handleOverflow(data: number[], overflow: PlotSeriesOverflow, maxLength: number) {
        if (data.length <= maxLength) return data;

        switch (overflow) {
            case PlotSeriesOverflow.linearScale:
                return Utils.shrinkData(data, maxLength, Utils.linearDistribution, this.aggregationFn);

            case PlotSeriesOverflow.logScale:
                return Utils.shrinkData(data, maxLength, this._invertedLogDistribution.bind(this, data), this.aggregationFn);

            case PlotSeriesOverflow.clamp:
                return Utils.shrinkData(data, maxLength, this._skipDistribution.bind(this), this.aggregationFn);

            default:
                throw new Error(`Unsupported overflow function: ${overflow}`);
        }
    }

    private _skipDistribution(_: number, max: number, count: number): Iterable<number> {
        return Utils.linearDistribution(max - count + 1, max, count);
    }

    private* _invertedLogDistribution(data: number[], min: number, max: number, count: number): Iterable<number> {
        const overflowCount = data.length - count;
        const ratio = Math.min(1, overflowCount / 50);
        yield* Utils.invertedLogDistribution(min, max, count, ratio);
    }

    private _fillVertical(color: Color, x: number, fromY: number, toY: number) {
        for (let i = fromY; i <= toY; i++) {
            this.screen[i][x] = color + Plot.ChartVertical[0];
        }
    }
}