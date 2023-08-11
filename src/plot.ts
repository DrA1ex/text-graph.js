import {BackgroundColor, Color, PlotAxisScale, PlotSeriesOverflow, PlotTilePositionFlags} from "./enum";
import {Axis} from "./axis";
import * as Utils from "./utils"

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
    titlePosition: PlotTilePositionFlags,
    axisScale: PlotAxisScale,
    aggregation: Utils.AggregationFn,
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
    [PlotAxisScale.linear]: Utils.aggregateAverage,
    [PlotAxisScale.log]: Utils.aggregateMax,
    [PlotAxisScale.logInverted]: Utils.aggregateMin,
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
    public title: string;
    public titlePosition: PlotTilePositionFlags;

    public readonly width;
    public readonly height;

    public readonly screen!: string[][];

    private readonly series: number[][] = [];
    readonly seriesConfigs: PlotSeriesConfig[] = [];

    constructor(
        width = 80,
        height = 10, {
            showAxis = true, axisScale = PlotAxisScale.linear,
            aggregation = PlotDefaultAggregation[axisScale] ?? Utils.aggregateSkip,
            title = "", titlePosition = PlotTilePositionFlags.top,
            horizontalBoundary = 0, verticalBoundary = title ? 1 : 0,
        }: Partial<PlotOptions> = {}
    ) {
        this.width = width;
        this.height = height;

        this.showAxis = showAxis;
        this.axisScale = axisScale;
        this.aggregationFn = aggregation;
        this.title = title;
        this.titlePosition = titlePosition;
        this.horizontalBoundary = horizontalBoundary;
        this.verticalBoundary = verticalBoundary;

        this.screen = new Array(this.height);
        for (let i = 0; i < this.height; i++) {
            this.screen[i] = new Array(this.width).fill(Plot.SpaceSymbol);
        }
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
            const data = this._handleOverflow(this.series[i], overflow, maxSeriesLength);

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

        this._drawTitle(xOffset);
    }

    public paint(): string {
        this.redraw();

        return this.screen.map(row => row.join("")).join("\n") + Color.reset;
    }

    private _drawAxis(yOffset: number, axisValues: number[]) {
        const size = axisValues.length;
        const labelPadding = Math.max(
            Math.abs(axisValues[0]).toFixed(2).length,
            Math.abs(axisValues[size - 1]).toFixed(2).length) + 1;

        for (let i = 0; i < this.height; i++) {
            const index = this.height - 1 - i;
            this.screen[index][labelPadding + 1] = Color.default + Plot.AxisSymbol;

            const labelIndex = i - yOffset;
            if (labelIndex >= 0 && labelIndex < size) {
                const axisValue = axisValues[labelIndex];
                const label = Utils.toFixed(axisValue, 2).padStart(labelPadding, " ");

                for (let j = 0; j < label.length; j++) {
                    this.screen[index][j] = Color.default + label[j];
                }
            }
        }

        return labelPadding;
    }

    private _drawTitle(plotOffset: number) {
        const maxWidth = this.width - plotOffset;
        if (!this.title || maxWidth <= 4) return;

        let label = this._clipLabel(this.title, maxWidth, this.horizontalBoundary);

        let x;
        if (this.titlePosition & PlotTilePositionFlags.left) {
            x = 0
        } else if (this.titlePosition & PlotTilePositionFlags.right) {
            x = this.width - label.length - 1;
        } else {
            x = plotOffset + Math.round(maxWidth / 2 - label.length / 2)
        }

        if (label.length < maxWidth - 2) {
            label = ` ${label} `;
        }

        let y = 0;
        if (this.titlePosition & PlotTilePositionFlags.bottom) {
            y = this.height - 1;
        }

        for (let i = 0; i < label.length; i++) {
            this.screen[y][x + i] = BackgroundColor.lightgray + Color.black + label[i] + Color.reset;
        }
    }

    private _clipLabel(label: string, maxLength: number, boundary: number): string {
        if (label.length > maxLength) {
            return label.slice(0, maxLength - boundary - 1) + "…";
        }

        return label
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

            case PlotSeriesOverflow.skip:
                return Utils.shrinkData(data, maxLength, this._skipDistribution.bind(this), this.aggregationFn);

            default:
                throw new Error(`Unsupported overflow function: ${overflow}`);
        }
    }

    private _skipDistribution(_: number, max: number, count: number): Iterable<number> {
        return Utils.linearDistribution(max - count, max, count);
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