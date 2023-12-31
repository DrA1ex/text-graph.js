import {PlotAxisScale} from "./enum";
import * as Utils from "./utils";

export class Axis {
    readonly labels: number[];

    constructor(public min: number,
                public max: number,
                public readonly size: number,
                public readonly scale: PlotAxisScale,
    ) {
        if (min > max) throw new Error("Incorrect range: min should be less or equals to max")
        if (this.size <= 1) throw new Error("Size should be >= 2");

        switch (this.scale) {
            case PlotAxisScale.log:
                this.labels = Array.from(Utils.logDistribution(this.min, this.max, this.size));
                break;

            case PlotAxisScale.logInverted:
                this.labels = Array.from(Utils.invertedLogDistribution(this.min, this.max, this.size));
                break;

            default:
                this.labels = Array.from(Utils.linearDistribution(this.min, this.max, this.size));
        }
    }

    getPosition(value: number) {
        const index = Utils.findClosestIndexSorted(this.labels, value);
        return this.size - 1 - index;
    }
}