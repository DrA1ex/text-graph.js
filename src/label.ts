import {BackgroundColor, Color, LabelPositionFlags} from "./enum";

export const LabelDefaults = {
    align: LabelPositionFlags.top,
    foregroundColor: Color.black,
    backgroundColor: BackgroundColor.lightgray,
    spacing: 1,
    minWidth: 4
}

export class Label {
    public foregroundColor = LabelDefaults.foregroundColor;
    public backgroundColor = LabelDefaults.backgroundColor;

    constructor(
        public readonly label: string,
        public readonly width: number,
        public readonly height: number,
        public readonly boundary: number = 0,
        public readonly align: LabelPositionFlags = LabelDefaults.align,
        public readonly spacing = LabelDefaults.spacing,
    ) {
    }

    public draw(screen: string[][], xOffset: number, yOffset: number) {
        const maxWidth = this.width - xOffset;
        if (!this.label || maxWidth <= LabelDefaults.minWidth) return;

        let label = this._clipLabel(this.label, maxWidth, this.boundary);
        if (label.length < maxWidth) {
            const spacing = Math.min(this.spacing, Math.floor(maxWidth - label.length) / 2);

            if (spacing) {
                label = " ".repeat(spacing) + label + " ".repeat(spacing);
            }
        }

        let x;
        if (this.align & LabelPositionFlags.left) {
            x = 0
        } else if (this.align & LabelPositionFlags.right) {
            x = this.width - label.length - 1;
        } else {
            x = xOffset + Math.round(maxWidth / 2 - label.length / 2)
        }

        let y = yOffset;
        if (this.align & LabelPositionFlags.bottom) {
            y = this.height - 1 - yOffset;
        }

        for (let i = 0; i < label.length; i++) {
            screen[y][x + i] = this.backgroundColor + this.foregroundColor + label[i] + Color.reset;
        }
    }

    private _clipLabel(label: string, maxLength: number, boundary: number): string {
        if (label.length > maxLength) {
            return label.slice(0, maxLength - boundary - 1) + "…";
        }

        return label
    }
}