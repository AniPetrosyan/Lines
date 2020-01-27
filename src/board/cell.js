import { TEXTURE } from "../constants";

export class Cell extends Phaser.GameObjects.Container {
  constructor(scene, row, col) {
    super(scene);

    this._row = row;
    this._col = col;
    this._ball = null;

    this._buildBg();
    this._addListeners();
  }

  preload() {
    console.log(123);
    this.load.atlas(
      "explosion",
      "/assets/atlases/fx_cube.png",
      "/assets/atlases/fx_cube.json"
    );
  }

  create() {
    this.anims.create({
      key: "explosion",
      frames: this.anims.generateFrameNames("explosion", {
        prefix: "cube_parts_white_",
        suffix: ".png",
        end: 13,
        zeroPad: 2
      }),
      repeat: -1
    });
    /* this.add.sprite(0, 0, "explosion").play("explosion");
    console.log("here");*/
    /* console.log("here");
    this.load.path = "./src/assets/";
    this.load.spritesheet("explosion", "fx_cube.png", {
      frameWidth: 37,
      frameHeight: 45
    });
    this.load.start();

    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 16,
      repeat: 0
    });
*/
    /*   this.mummySprite = this.add
      .sprite(50, 300, "explosion")
      .setScale(4)
      .play("walk");
    this.mummySprite.anims.setRepeat(-1);*/
  }

  /* update() {
    this.mummySprite.x += 1.5;
  }*/

  get row() {
    return this._row;
  }

  get col() {
    return this._col;
  }

  get ball() {
    return this._ball;
  }

  get isEmpty() {
    return !this._ball;
  }

  addBall(ball) {
    this.add(ball);
    this._ball = ball;
  }

  removeBall() {
    this.remove(this._ball);
    this._ball = null;
    //this.add.spriteSheet(100, 100, "ballExplosion", "fx_cube.png");
    //this.daddy = this.add.sprite(400, 200, "explosion").play("jump");

    return this._ball;
  }

  _buildBg() {
    const bg = this.scene.add.image(0, 0, TEXTURE, "box_bg.png");
    this.add((this._bg = bg));

    const { displayWidth, displayHeight } = bg;

    this.width = displayWidth;
    this.height = displayHeight;
  }

  /* _makeAnims() {
    const anims = this.load.spriteSheet(
      "ballExplosion",
      "/assets/atlases/fx_cube.png"
    );
  }*/

  _addListeners() {
    this._bg.setInteractive();
    this._bg.on(Phaser.Input.Events.POINTER_UP, this._onPointerUp, this);
  }

  _onPointerUp() {
    //console.warn("click");
    this.emit("onCellClick", this._col, this._row);
  }
}
