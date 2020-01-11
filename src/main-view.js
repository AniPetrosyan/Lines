import { Board } from "./board/board";

export class MainView extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);
    // console.warn("MainView");
    this._build();
  }

  _build() {
    this._buildBoard();
    this._buildUI();
  }

  _buildBoard() {
    const board = new Board(this.scene);
    this.add(board);
  }
  _buildUI() {
    //...
  }
}
