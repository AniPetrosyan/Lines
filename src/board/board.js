import PF from "pathfinding";
import { BOARD_DIMENSIONS } from "../constants";
import { EVENTS } from "../events";
import { Ball } from "./ball";
import { Cell } from "./cell";

export class Board extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);

    this._cells = [];
    this._combinations = [];
    this._selectedBall = null;
    this.LOOP_DIAGONAL_DIR = [-1, 1, 1, -1];
    this.MAIN_DIAGONAL_DIR = [1, 1, -1, -1];

    this._buildBoard();
    this._makeBalls();
    this.scene.events.on(EVENTS.BALLS_READY, this._onBallsReady, this);
  }

  getRandomEmptyCell() {
    const rndI = Math.floor(Math.random() * BOARD_DIMENSIONS.width);
    const rndJ = Math.floor(Math.random() * BOARD_DIMENSIONS.height);
    const rndCell = this._cells[rndI][rndJ];

    if (!rndCell.isEmpty) {
      return this.getRandomEmptyCell();
    }

    return rndCell;
  }

  getCellByBall(ball) {
    for (let i = 0; i < this._cells.length; i++) {
      const columns = this._cells[i];
      for (let j = 0; j < columns.length; j++) {
        const cell = columns[j];
        if (cell.ball === ball) {
          return cell;
        }
      }
    }
  }

  _onBallsReady(ballsType) {
    //
  }

  _buildBoard() {
    for (let col = 0; col < BOARD_DIMENSIONS.width; col++) {
      const column = [];

      for (let row = 0; row < BOARD_DIMENSIONS.height; row++) {
        const cell = new Cell(this.scene, row, col);
        this.add(cell);
        column.push(cell);
        const { width, height } = cell;
        cell.setPosition(col * width + width / 2, row * height + height / 2);
        cell.on("onCellClick", this._onCellClicked, this);
      }

      this._cells.push(column);
    }
  }

  _makeBalls() {
    const emptyCells = this._getEmptyCells();

    for (let i = 0; i < Math.min(3, emptyCells.length); i++) {
      const ball = this._generateRandomBall();
      const cell = this.getRandomEmptyCell();
      cell.addBall(ball);
    }
  }

  _generateRandomBall() {
    const type = Math.floor(Math.random() * 4 + 1);
    const ball = new Ball(this.scene, type);

    return ball;
  }

  _onCellClicked(col, row) {
    const cell = this._cells[col][row];
    const { isEmpty } = cell;

    if (isEmpty) {
      if (this._selectedBall) {
        this._moveBall(cell);
      }
    } else {
      if (this._selectedBall) {
        this._selectedBall.deselectBall();
      }
      this._selectedBall = cell.ball;
      this._selectedBall.selectBall();
    }
  }

  _moveBall(newCell) {
    const prevCell = this.getCellByBall(this._selectedBall);
    const { col: x1, row: y1 } = prevCell;
    const { col: x2, row: y2 } = newCell;

    const path = this._getPath(x1, y1, x2, y2);

    if (path.length !== 0) {
      prevCell.removeBall();
      newCell.addBall(this._selectedBall);
      this._selectedBall.deselectBall();
      this._selectedBall = null;
      this._checkForCombination();

      if (this._combinations.length === 0) {
        this._makeBalls();
        this._checkForCombination();
      }
      this._checkForLose();
    }
  }

  _getEmptyCells() {
    const emptyCells = [];
    this._cells.forEach(col => {
      emptyCells.push(...col.filter(cell => cell.isEmpty));
    });
    return emptyCells;
  }

  _checkForLose() {
    const emptyCells = this._getEmptyCells();
    if (emptyCells.length === 0) {
      console.log("Game Over");
    }
  }

  _getPath(x1, y1, x2, y2) {
    const matrix = this._getObstacleMatrix();

    const finder = new PF.AStarFinder();
    const board = new PF.Grid(matrix);

    const path = finder.findPath(x1, y1, x2, y2, board);

    return path;
  }

  _getObstacleMatrix() {
    const matrix = [];

    for (let y = 0; y < this._cells[0].length; y++) {
      const row = [];
      for (let x = 0; x < this._cells.length; x++) {
        const { isEmpty } = this._cells[x][y];
        row.push(+!isEmpty);
      }
      matrix.push(row);
    }

    return matrix;
  }

  _checkForCombination() {
    this._combinations.length = 0;

    for (let i = 0; i < this._cells.length; i++) {
      const column = this._cells[i];
      for (let j = 0; j < column.length; j++) {
        const cell = column[j];
        if (!cell.isEmpty) {
          const hComb = this._getHorizontalCombination(cell.ball, i, j, [
            cell.ball
          ]);
          const vComb = this._getVerticalCombination(cell.ball, i, j, [
            cell.ball
          ]);

          // const sComb = this._getDiagonalCombination(cell.ball);
          const sComb = this.findLoopDiagonalLine(cell.ball);
          const dComb = this.findMainDiagonalLine(cell.ball);
          //  const sComb = this._getDiagonalCombination(cell.ball, i, j, [
          //  cell.ball
          //]);

          //  var horizontal, vertical, fwdDiagonal, bckDiagonal, res;
          // horizontal = this._getHorizontalCombination(target);
          //  vertical = this._getVerticalCombination(target);
          // fwdDiagonal = this._getLineSlash(target);
          //	bckDiagonal = this.getLineBackslash(target);
          // res = this.mergeLines(horizontal, vertical);
          //  res = this.mergeLines(res, fwdDiagonal);
          // res = this.mergeLines(res, bckDiagonal);

          if (hComb.length >= 5) this._combinations.push(hComb);
          if (vComb.length >= 5) this._combinations.push(vComb);
          if (sComb.length >= 5) this._combinations.push(sComb);
          if (dComb.length >= 5) this._combinations.push(dComb);
        }
      }
    }

    this._collectCombinations();
  }

  check(i, j, dir) {
    let result = true;
    let checkNeighbor =
      (this._cells.length[i + dir[0]] &&
        this._cells.length[i][j] ===
          this._cells.length[i + dir[0]][j + dir[1]]) ||
      (this._cells.length[i + dir[2]] &&
        this._cells.length[i][j] ===
          this._cells.length[i + dir[2]][j + dir[3]]);

    result &= Boolean(this._cells.length[i][j]);
    result &= checkNeighbor;

    return result;
  }

  _getHorizontalCombination(ball, col, row, combination) {
    if (col + 1 >= this._cells.length) {
      return combination;
    }

    const cell = this._cells[col + 1][row];

    if (
      !cell.ball ||
      cell.ball.type !== ball.type ||
      this._alreadyConsistInCombination(ball)
    ) {
      return combination;
    }

    combination.push(cell.ball);

    return this._getHorizontalCombination(cell.ball, col + 1, row, combination);
  }

  _getVerticalCombination(ball, col, row, combination) {
    if (row + 1 >= this._cells[col].length) {
      return combination;
    }

    const cell = this._cells[col][row + 1];

    if (
      !cell.ball ||
      cell.ball.type !== ball.type ||
      this._alreadyConsistInCombination(ball)
    ) {
      return combination;
    }

    combination.push(cell.ball);

    return this._getVerticalCombination(cell.ball, col, row + 1, combination);
  }

  /*  _getDiagonalCombination(ball, col, row, combination) {
    if (row >= 0) {
      const cell = this._cells[col - 1][row - 1];

      return combination;
    }
    if (row >= this._cells[col].length) {
      return combination;
    }

    console.log(row, col);

    const cell = this._cells[col + 1][row - 1];

    combination.push(cell.ball);

    return this._getDiagonalCombination(
      cell.ball,
      col + 1,
      row - 1,
      combination
    );
  }
*/
  /* _getDiagonalCombination(ball, col, row, combination) {
    if (col + 1 >= this._cells.length || row - 1 < 0) {
      return combination;
    }

    const cell = this._cells[col + 1][row - 1];

    if (
      !cell.ball ||
      cell.ball.type !== ball.type ||
      this._alreadyConsistInCombination(ball)
    ) {
      return combination;
    }

    combination.push(cell.ball);

    return this._getDiagonalCombination(
      cell.ball,
      col + 1,
      row - 1,
      combination
    );
  }
*/
  findLoopDiagonalLine() {
    let i = 0;
    for (let k = 0; k < this._cells.length; k++) {
      this.tmpLine = [];
      this.tmpColor = "";
      for (let j = 0; j <= k; j++) {
        i = k - j;

        if (this.check(i, j, this.LOOP_DIAGONAL_DIR)) {
          if (this.tmpColor !== "" && this.tmpColor !== this._cells[i][j]) {
            cell.removeBall();
          }
          this.tmpLine.push({ i: i, j: j });
          this.tmpColor = this._cells[i][j];
        } else {
          cell.removeBall();
        }

        cell.removeBall();
      }

      for (let k = this._cells.length - 2; k >= 0; k--) {
        this.tmpLine = [];
        this.tmpColor = "";
        for (let j = 0; j <= k; j++) {
          i = k - j;

          if (
            this.check(
              this._cells.length - j - 1,
              this._cells.length - i - 1,
              this.LOOP_DIAGONAL_DIR
            )
          ) {
            if (
              this.tmpColor !== "" &&
              this.tmpColor !==
                this._cells[this.ballArray.length - j - 1][
                  this._cells.length - i - 1
                ]
            ) {
              cell.removeBall();
            }
            this.tmpLine.push({
              i: this._cells.length - j - 1,
              j: this._cells.length - i - 1
            });
            this.tmpColor = this._cells[this._cells.length - j - 1][
              this._cells.length - i - 1
            ];
          } else {
            cell.removeBall();
          }
        }

        cell.removeBall();
      }
    }
  }
  findMainDiagonalLine() {
    let i = 0;
    for (let k = this._cells.length - 1; k >= 0; k--) {
      this.tmpLine = [];
      this.tmpColor = "";
      for (let j = k; j <= this._cells.length - 1; j++) {
        i = j - k;

        if (this.check(i, j, this.MAIN_DIAGONAL_DIR)) {
          if (this.tmpColor !== "" && this.tmpColor !== this._cells[i][j]) {
            cell.removeBall();
          }
          this.tmpLine.push({ i: i, j: j });
          this.tmpColor = this._cells[i][j];
        } else {
          cell.removeBall();
        }
      }

      cell.removeBall();
    }

    for (let k = 1; k < this._cells.length; k++) {
      this.tmpLine = [];
      this.tmpColor = "";
      for (let j = 0; j <= this._cells.length - 1 - k; j++) {
        i = k + j;

        if (this.check(i, j, this.MAIN_DIAGONAL_DIR)) {
          if (this.tmpColor !== "" && this.tmpColor !== this._cells[i][j]) {
            this.removeBall();
          }
          this.tmpLine.push({ i: i, j: j });
          this.tmpColor = this._cells[i][j];
        } else {
          cell.removeBall();
        }
      }

      cell.removeBall();
    }
  }
  /* _getLineSlash(ball) {
    var i,
      j,
      first,
      testBall,
      res = this.getBall(ball);
    i = ball.x;
    j = ball.y;
    while (i < BOARD_DIMENSIONS.w - 1 && j > 0) {
      testBall = this.getBall({ x: i + 1, y: j - 1 });
      if (testBall && testBall.color === first.color) {
        first = testBall;
      } else {
        break;
      }
      i += 1;
      j -= 1;
    }
    res = { cnt: 1, fields: [first] };
    i = first.x - 1;
    j = first.y + 1;
    while (
      this.getBall({ x: i, y: j }) &&
      this.getBall({ x: i, y: j }).color === first.color
    ) {
      res.cnt += 1;
      res.fields[res.fields.length] = this.getBall({ x: i, y: j });
      i -= 1;
      j += 1;
    }
    if (res.cnt < this.minLineLength) {
      res = null;
    }
    return res;
  } */

  _alreadyConsistInCombination(ball) {
    for (let i = 0; i < this._combinations.length; i++) {
      const combination = this._combinations[i];
      for (let j = 0; j < combination.length; j++) {
        if (combination[j].uuid === ball.uuid) {
          return true;
        }
      }
    }
    return false;
  }

  _collectCombinations() {
    this._combinations.forEach(combination => {
      const score = combination.length * 10;
      this.scene.events.emit(EVENTS.COMBINATION_COLLECTED, score);
      combination.forEach(ball => {
        const cell = this.getCellByBall(ball);
        setTimeout(() => {
          cell.removeBall();
          this.add.sprite(ball.x, ball.y, "explosion").play("explosion");
          console.log("here");
        }, 1000);
      });
    });
  }
}
