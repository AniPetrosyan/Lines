import { EVENTS } from "../events";
import { ScoresComponent } from "./scores-component";

export class UI extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);
    this._build();
    this.scene.events.on(
      EVENTS.COMBINATIONCOLLECTED,
      this._onCombinationCollected,
      this
    );
  }

  _onCombinationCollected(score) {
    this._scores.updateScore(this._scores.score + score);
  }

  _build() {
    this._buildNextBallsComponent();
    this._buildScoresComponent();
    this._buildHighScoresComponent();
  }

  _buildNextBallsComponent() {
    //
  }

  _buildScoresComponent() {
    this._scores = new ScoresComponent(this.scene);
    this.add(this._scores);
  }

  _buildHighScoresComponent() {
    //
  }
}
