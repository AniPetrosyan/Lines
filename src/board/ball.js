import { TEXTURE } from "../constants";

export class Ball extends Phaser.GameObjects.Image {
  constructor(scene, type) {
    super(scene, 0, 0, TEXTURE, `${type}.png`);
    this._type = type;
  }

  get type() {
    return this._type;
  }

  selectBall() {
    this.scale = 1.2;
  }
  deselectBall() {
    this.scale = 1;
  }
}
