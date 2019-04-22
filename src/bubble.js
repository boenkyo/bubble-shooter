import cfg from './config';

export class Bubble {

  constructor(bubbleType, radius) {
    this.type = bubbleType;
    this.radius = radius;
    this.color = this.getColor(); // TODO: replace with sprite
    this.isMoving = false;
  }

  getColor() {
    switch (this.type) {
      case BubbleType.Red:
        return '#c22';
      case BubbleType.Green:
        return '#2c2';
      case BubbleType.Blue:
        return '#22c';
      case BubbleType.Purple:
        return '#c2c';
      case BubbleType.Yellow:
        return '#cc2';
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.getScreenPos().x, this.getScreenPos().y,
            this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Debugging
    if (this.gridPos && this.grid.debug) {
      ctx.font = '8px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`(${this.gridPos.q}, ${this.gridPos.r})`,
                   this.getScreenPos().x, this.getScreenPos().y);
    }
  }

  addGridPosition(grid, q, r) {
    this.grid = grid;
    this.gridPos = { q, r, s: -q - r };
    this.getScreenPos = () => this.grid.gridPosToScreenPos(this.gridPos);
  }

  updateGridPosition(newQ, newR) {
    if (this.gridPos) {
      this.gridPos.q = newQ;
      this.gridPos.r = newR;
    } else {
      console.error('The bubble doesn\'t have a grid position and it can\'t be updated.');
    }
  }

  addScreenPos(screenPos) {
    this.getScreenPos = () => screenPos;
  }

  shoot(targetScreenPos, targetGridPos, bounceScreenPos) {
    if (this.isMoving) return;

    this.targetScreenPos = targetScreenPos;
    this.targetGridPos   = targetGridPos;
    this.bounceScreenPos = bounceScreenPos;
    this.isMoving = true;
    this.vel = { x: 0, y: 0 };
  }

  animateMove() {}

  update(dt) {
    if (this.isMoving) this.animateMove();
  }

}

const BubbleType = {
  Red:    1,
  Green:  2,
  Blue:   3,
  Purple: 4,
  Yellow: 5,
};

export function getRandomBubbleType() {
  const values = Object.values(BubbleType);
  return values[Math.floor(Math.random() * values.length)];
}
