import * as Utils from "./utils"

export enum LabelPositionFlags {
    top = 1 << 1,
    bottom = 1 << 2,
    left = 1 << 5,
    right = 1 << 6,

    top_left = top | left,
    top_right = top | right,
    bottom_left = bottom | left,
    bottom_right = bottom | right,
}

export enum Color {
    red = "\x1b[31m",
    green = "\x1b[32m",
    yellow = "\x1b[33m",
    blue = "\x1b[34m",
    magenta = "\x1b[35m",
    cyan = "\x1b[36m",
    lightgray = "\x1b[37m",
    default = "\x1b[39m",

    white = "\x1b[97m",
    black = "\x1b[30m",
    reset = "\x1b[0m",
}

export enum BackgroundColor {
    black = "\x1b[40m",
    red = "\x1b[41m",
    green = "\x1b[42m",
    yellow = "\x1b[43m",
    blue = "\x1b[44m",
    magenta = "\x1b[45m",
    cyan = "\x1b[46m",
    lightgray = "\x1b[47m",
    default = "\x1b[49m",
}

export enum PlotSeriesOverflow {
    linearScale,
    logScale,
    clamp,
}

export enum PlotAxisScale {
    linear,
    log,
    logInverted
}

export const PlotSeriesAggregationFn = {
    mean: Utils.aggregateAverage,
    min: Utils.aggregateMin,
    max: Utils.aggregateMax,
    skip: Utils.aggregateSkip,
} as const;