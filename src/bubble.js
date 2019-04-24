import cfg from './config';

export class Bubble {

  constructor(bubbleType, radius, grid) {
    this.type = bubbleType;
    this.radius = radius;
    this.grid = grid;
    this.img = this.getImg();
    this.isMoving = false;
  }

  getImg() {
    let id;
    switch (this.type) {
      case BubbleType.Red:
        id = 'red-bubble';
        break;
      case BubbleType.Green:
        id = 'green-bubble';
        break;
      case BubbleType.Blue:
        id = 'blue-bubble';
        break;
      case BubbleType.Purple:
        id = 'purple-bubble';
        break;
      case BubbleType.Yellow:
        id = 'yellow-bubble';
        break;
    }

    return document.getElementById(id);
  }

  draw(ctx) {
    ctx.drawImage(this.img, this.screenPos.x - this.radius, this.screenPos.y - this.radius,
                  this.radius*2, this.radius*2);

    // Debugging
    if (this.gridPos && this.grid.debug) {
      ctx.font = '8px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText(`(${this.gridPos.q}, ${this.gridPos.r})`,
                   this.screenPos.x, this.screenPos.y);
    }
  }

  addGridPosition(q, r) {
    this.gridPos = { q, r, s: -q - r };
    this.screenPos = this.grid.gridPosToScreenPos(this.gridPos);
  }

  updateGridPosition(newQ, newR) {
    if (this.gridPos) {
      this.gridPos.q = newQ;
      this.gridPos.r = newR;
      this.screenPos = this.grid.gridPosToScreenPos(this.gridPos);
    } else {
      console.error('The bubble doesn\'t have a grid position and it can\'t be updated.');
    }
  }

  addScreenPos(screenPos) {
    this.screenPos = screenPos;
  }

  shoot(targetScreenPos, targetGridPos, bounceScreenPos) {
    if (this.isMoving) return;

    this.targetScreenPos = targetScreenPos;
    this.targetGridPos   = targetGridPos;
    this.bounceScreenPos = bounceScreenPos;

    this.angleToBounce = bounceScreenPos ?
      this.angleBetween(this.screenPos, bounceScreenPos) :
      undefined;

    this.vel = { x: 0, y: 0 };
    this.maxVel = 0.9;

    if (bounceScreenPos) {
      this.angleToTarget = this.angleBetween(bounceScreenPos, targetScreenPos);
      this.movedToBouncePos = false;

      this.vel.x = Math.cos(this.angleToBounce) * this.maxVel;
      this.vel.y = Math.sin(this.angleToBounce) * this.maxVel;
    } else {
      this.angleToTarget = this.angleBetween(this.screenPos, targetScreenPos);

      this.vel.x = Math.cos(this.angleToTarget) * this.maxVel;
      this.vel.y = Math.sin(this.angleToTarget) * this.maxVel;
    }

    this.movedToTargetPos = false;

    this.isMoving = true;
  }

  angleBetween(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p1.y - p2.y;

    return Math.atan2(dy, dx);
  }

  animateMove(dt) {
    if (this.bounceScreenPos && !this.movedToBouncePos) {
      if ((this.angleToBounce >= Math.PI/2 && this.screenPos.x > this.bounceScreenPos.x) ||
          (this.angleToBounce < Math.PI/2  && this.screenPos.x < this.bounceScreenPos.x)) {
        this.screenPos.x += this.vel.x * dt;
        this.screenPos.y -= this.vel.y * dt;
      } else {
        this.screenPos.x = this.bounceScreenPos.x;
        this.screenPos.y = this.bounceScreenPos.y;
        this.vel.x = Math.cos(this.angleToTarget) * this.maxVel;
        this.vel.y = Math.sin(this.angleToTarget) * this.maxVel;
        this.movedToBouncePos = true;
      }
    } else {
      if ((this.angleToTarget >= Math.PI/2 && this.screenPos.x > this.targetScreenPos.x) ||
         (this.angleToTarget < Math.PI/2  && this.screenPos.x < this.targetScreenPos.x)) {
        this.screenPos.x += this.vel.x * dt;
        this.screenPos.y -= this.vel.y * dt;
      } else {
        this.inGrid = true;
      }
    }
  }

  update(dt) {
    if (this.isMoving) this.animateMove(dt);
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
