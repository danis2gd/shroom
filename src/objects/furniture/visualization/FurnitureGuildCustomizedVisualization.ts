import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurniDrawPart } from "../util/DrawDefinition";
import { AnimatedFurnitureVisualization } from "./AnimatedFurnitureVisualization";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class FurnitureGuildCustomizedVisualization extends FurnitureVisualization {
  private _base: AnimatedFurnitureVisualization = new AnimatedFurnitureVisualization();
  private PRIMARY_COLOR_TAG = "COLOR1";
  private SECONDARY_COLOR_TAG = "COLOR2";

  private _primaryColor: string | undefined;
  private _secondaryColor: string | undefined;

  private _refreshModifier = false;

  constructor(
    options: { primaryColor?: string; secondaryColor?: string } = {}
  ) {
    super();

    this.primaryColor = options.primaryColor;
    this.secondaryColor = options.secondaryColor;
  }

  public get primaryColor() {
    return this._primaryColor;
  }

  public set primaryColor(value) {
    this._primaryColor = value;
    this._refreshModifier = true;
  }

  public get secondaryColor() {
    return this._secondaryColor;
  }

  public set secondaryColor(value) {
    this._secondaryColor = value;
    this._refreshModifier = true;
  }

  private _updateModifier() {
    this._base.modifier = (part) => {
      return this._modifyPart(part);
    };
  }

  private _modifyPart(part: FurniDrawPart): FurniDrawPart {
    switch (part.layer?.tag) {
      case this.PRIMARY_COLOR_TAG:
        return {
          ...part,
          tint: this._primaryColor,
        };

      case this.SECONDARY_COLOR_TAG:
        return {
          ...part,
          tint: this._secondaryColor,
        };
    }

    return part;
  }

  setView(view: IFurnitureVisualizationView) {
    super.setView(view);
    this._base.setView(view);
  }

  destroy(): void {
    this._base.destroy();
  }

  updateFrame(frame: number): void {
    if (this._refreshModifier) {
      this._refreshModifier = false;
      this._updateModifier();
    }

    this._base.updateFrame(frame);
  }

  updateDirection(direction: number): void {
    this._base.updateDirection(direction);
  }

  updateAnimation(animation: string): void {
    this._base.updateAnimation(animation);
  }
}