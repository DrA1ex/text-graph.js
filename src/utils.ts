export type DistributionFn = (min: number, max: number, count: number) => Iterable<number>

export type AggregationFn = (data: number[], from: number, to: number) => number;

export function toFixed(value: number, maxFraction = 2) {
    let label = value.toFixed(maxFraction)
    const pointIndex = label.indexOf(".")
    let trimIndex = label.length;
    for (; trimIndex > pointIndex; trimIndex--) {
        if (label[trimIndex - 1] !== '0') break;
    }

    if (trimIndex > 0 && label[trimIndex - 1] === ".") {
        trimIndex--;
    }

    return label.slice(0, trimIndex);
}

export function minMax(values: number[]): [number, number] {
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;

    for (const value of values) {
        if (Number.isNaN(value)) continue;

        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    return [min, max];
}

export function minMax2d(values: number[][]): [number, number] {
    let max = Number.NEGATIVE_INFINITY;
    let min = Number.POSITIVE_INFINITY;

    for (const row of values) {
        const [localMin, localMax] = minMax(row);
        if (!Number.isFinite(localMin)) continue;

        min = Math.min(min, localMin);
        max = Math.max(max, localMax);
    }

    if (Number.isFinite(min)) {
        return [min, max];
    }

    return [0, 0];
}

export function* linearDistribution(min: number, max: number, count: number): Iterable<number> {
    if (count < 2) throw new Error("Count should be greater or equals 2");
    if (min > max) [min, max] = [max, min];

    const step = (max - min) / (count - 1);
    for (let i = 0; i < count; i++) {
        yield min + i * step;
    }
}

export function* logDistribution(min: number, max: number, count: number, ratio: number = 1): Iterable<number> {
    if (count < 2) throw new Error("Count should be greater or equals 2");
    if (min > max) [min, max] = [max, min];

    let offset = 0;
    if (min < 1) {
        offset = Math.abs(min) + 1;
        min += offset;
        max += offset;
    }

    ratio = Math.max(0, Math.min(1, ratio));
    for (let i = 0; i < count; i++) {
        // Linear distribution value between 0 and 1
        const linearValue = i / (count - 1);

        // Logarithmic distribution value between 0 and 1
        // Special case is i=0, since 10^0 = 1, and so we get 0.1 and thus skip `min` border
        const logarithmicValue = i > 0 ? Math.pow(10, linearValue) / 10 : 0;

        // Applying ratio to interpolate between linear and logarithmic distributions
        const interpolatedValue = (1 - ratio) * linearValue + ratio * logarithmicValue;

        // Scaling the interpolated value to the desired range
        const scaledValue = min + interpolatedValue * (max - min);

        yield scaledValue - offset;
    }
}

export function* invertedLogDistribution(min: number, max: number, count: number, ratio: number = 1): Iterable<number> {
    const values = Array.from(logDistribution(min, max, count, ratio)).reverse();

    let prev = values[0];
    let last = min;
    for (const value of values) {
        const delta = (prev - value);
        yield last + delta;

        prev = value;
        last += delta;
    }
}

export function aggregateAverage(data: number[], from: number, to: number): number {
    if (from >= to) return data[to];

    const length = to - from + 1;
    let value = 0;
    for (let i = from; i <= to; i++) {
        value += data[i] / length;
    }

    return value;
}

export function aggregateMax(data: number[], from: number, to: number): number {
    if (from >= to) return data[to];

    let value = data[from];
    for (let i = from; i <= to; i++) {
        value = Math.max(value, data[i]);
    }

    return value;
}

export function aggregateMin(data: number[], from: number, to: number): number {
    if (from >= to) return data[to];

    let value = data[from];
    for (let i = from; i <= to; i++) {
        value = Math.min(value, data[i]);
    }

    return value;
}

export function aggregateSkip(data: number[], from: number, to: number) {
    return data[to];
}

export function shrinkData(data: number[], maxLength: number, distributionFn: DistributionFn, aggregationFn: AggregationFn) {
    if (data.length <= maxLength) return data;
    const shrunk = new Array(maxLength);

    let i = 0;
    let prevIndex;
    for (let index of distributionFn(0, data.length - 1, maxLength)) {
        index = Math.round(index);
        if (prevIndex === undefined) prevIndex = index;

        shrunk[i++] = aggregationFn(data, prevIndex, index);
        prevIndex = index + 1;
    }

    return shrunk;
}

export function findClosestIndexSorted(data: number[], value: number): number {
    let index = 0;
    let left = 0;
    let right = data.length - 1;

    while (left <= right) {
        index = left + Math.floor((right - left) / 2);
        const current = data[index];

        if (value < current) {
            right = index - 1;
        } else if (value > current) {
            left = index + 1;
        } else {
            return index;
        }
    }

    //value is outside [min; max] range
    if (left === 0 || left >= data.length) {
        return index;
    }

    const lowerDiff = Math.abs(data[left - 1] - value);
    const upperDiff = Math.abs(data[left] - value);
    return lowerDiff < upperDiff ? left - 1 : left;
}