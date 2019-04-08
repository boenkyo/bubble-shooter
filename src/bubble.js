export class Bubble {

  constructor(bubbleType, radius) {
    this.type = bubbleType;
    this.radius = radius;
    this.color = this.getColor(); // TODO: replace with sprite
    this.screenPos = { x: 0, y: 0 };
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
    this.gridPos = new GridPosition(grid, q, r);
    this.getScreenPos = () => this.gridPos.screenPos;
    this.grid = grid;
  }

  addShotHandler(startPos, game) {
    this.shotHandler = new ShotHandler(startPos, this, game);
    this.getScreenPos = () => this.shotHandler.screenPos;
    this.getVel       = () => this.shotHandler.vel;
    this.update       = dt => this.shotHandler.update(dt);
  }

}

class GridPosition {

  constructor(grid, q, r) {
    this.grid = grid;
    this.radius = grid.cfg.TILE_RADIUS;

    this.q = q;
    this.r = r;
    this.s = -q - r;

    this.screenPos = this.getScreenPos();
  }

  getScreenPos() {
    const x = this.radius *
              (Math.sqrt(3) * this.q + Math.sqrt(3)/2 * this.r)
              + this.grid.xOffset;
    const y = this.radius * (3/2 * this.r)
              + this.grid.yOffset;

    return { x, y };
  }

  update(q, r) {
    this.q = q;
    this.r = r;
    this.screenPos = this.getScreenPos();
  }

}

class ShotHandler {

  constructor(startPos, bubble, game) {
    this.game = game;
    this.screenPos = startPos;
    this.bubble = bubble;
    this.vel = { x: 0, y: 0 };
    this.maxVel = 0.6;

    this.isShot = false;
    bubble.isCollided = false;
  }

  update(dt) {
    this.screenPos.x += this.vel.x * dt;
    this.screenPos.y += this.vel.y * dt;

    if ((this.vel.x < 0 && this.screenPos.x - this.bubble.radius <= 0) ||
        (this.vel.x > 0 && this.screenPos.x + this.bubble.radius >= this.game.width)) {
      this.vel.x = -this.vel.x;
    }
  }

  shoot(angle) {
    if (this.isShot) return;

    this.vel.x = this.maxVel * Math.cos(angle);
    this.vel.y = -this.maxVel * Math.sin(angle);

    this.isShot = true;
  }

  checkCollision(bubble) {
    const xDistance = this.screenPos.x - bubble.getScreenPos().x;
    const yDistance = this.screenPos.y - bubble.getScreenPos().y;

    const distance = Math.hypot(xDistance, yDistance);

    if (distance <= this.bubble.radius * 2) {
      let verticalPos;
      let horizontalPos;

      if (xDistance <= 0) {
        horizontalPos = 'left';
      } else {
        horizontalPos = 'right';
      }

      if (yDistance > bubble.radius / 3) {
        verticalPos = 'bottom';
      } else if (yDistance > -bubble.radius / 3) {
        verticalPos = 'middle';
      } else {
        verticalPos = 'top';
      }

      return {
        colliding: true,
        horizontalPos,
        verticalPos,
      };
    } else {
      return { colliding: false };
    }
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
