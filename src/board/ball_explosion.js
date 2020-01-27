export class Ball_Explosion extends Phaser.GameObjects.Image {
  constructor() {
    super();
  }

  /* preload() {
    this.SVGAnimatedString.create({
 S     key: "ballExplosion",, "fx_cube.png"
      frameRate: 10,
      frames: this.SVGAnimatedString.generateFrameNames("ballExplosion", {
        prefix: "cube_parts_white_00",
        suffix: ".png",
        start: 0,
        end: 13
      })
    });
  }
  create() {
    let animation: Phaser.GameObjects.Sprite = this.add.sprite(100);
  }
}*/

  create() {
    this.load.atlas(
      "explosion",
      "/assets/atlases/fx_cube.png",
      "/assets/atlases/fx_cube.json"
    );

    this.anims.create({
      key: "jump",
      frames: this.anims.generateFrameNames("explosion", {
        prefix: "cube_parts_white_",
        suffix: ".png",
        end: 13,
        zeroPad: 2
      }),
      repeat: -1
    });
  }
}
