import { TEXTURE } from "../constants";

export class Cell extends Phaser.GameObjects.Container {
  constructor(scene, row, col) {
    super(scene);

    this._col = col;
    this._row = row;
    this._isEmpty = true;

    this._buildBg();
  }

  get row() {
    return this._row;
  }

  get col() {
    return this._col;
  }

  get isEmpty() {
    return this._isEmpty;
  }

  _buildBg() {
    const bg = this.scene.add.image(0, 0, TEXTURE, "box_bg.png");
    this.add(bg);
    const { displayWidth, displayHeight } = bg;
    this.width = displayWidth;
    this.height = displayHeight;
  }
}
