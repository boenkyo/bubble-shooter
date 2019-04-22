import cfg from './config';
import { Bubble } from './bubble';

export default class AimGuide {

  constructor(game, inputHandler, origin, grid) {
    this.game = game;
    this.inputHandler = inputHandler;
    this.origin = origin;
    this.grid = grid;
    this.angle = Math.PI / 2;
    this.guideLen = 100;

    this.samplePoints = [];
    this.wallHitPos;
    this.hitPos;
    this.hitScreenPos;
    this.lastSamplePos;
  }

  update(mousePos) {
    const mouseRelX = mousePos.x - this.origin.x;
    const mouseRelY = -mousePos.y + this.origin.y;

    this.angle = Math.atan2(mouseRelY, mouseRelX);

    if (this.angle < 0.3 || this.angle > Math.PI - 0.3) {
      this.hitPos       = undefined;
      this.hitScreenPos = undefined;
      return;
    }

    this.samplePoints = [];

    this.sampleHexes();

    this.mousePos = mousePos;
  }

  sampleHexes() {
    const sampleDistance = 2;
    const yIncrement = sampleDistance * Math.sin(this.angle);

    let y = yIncrement;
    let positionFound = false;

    while (!positionFound && y < 1000) {
      const sampleYCenter = this.origin.y - y;
      let sampleXCenter = y / Math.tan(this.angle) + this.origin.x;

      if (sampleXCenter <= cfg.BUBBLE_RADIUS) {
        if (!this.wallHitPos) {
          this.wallHitPos = { x: sampleXCenter, y: sampleYCenter };
        }
        sampleXCenter = -y / Math.tan(this.angle) - this.origin.x + this.wallHitPos.x;
      } else if (sampleXCenter >= this.game.width - cfg.BUBBLE_RADIUS) {
        if (!this.wallHitPos) {
          this.wallHitPos = { x: sampleXCenter, y: sampleYCenter };
        }
        sampleXCenter = this.wallHitPos.x - y / Math.tan(this.angle) + this.origin.x;
      } else if (this.wallHitPos) {
        this.wallHitPos = undefined;
      }

      const sampleCenterPos = { x: sampleXCenter, y: sampleYCenter };

      this.samplePoints.push(sampleCenterPos);

      if (this.collidingWithBubble(sampleCenterPos)) {
        this.hitPos = this.screenPosToGridPos(sampleCenterPos);
        this.hitScreenPos = this.grid.gridPosToScreenPos(this.hitPos);
        this.lastSamplePos = sampleCenterPos;
        positionFound = true;
      }

      y += yIncrement;

      if (!positionFound) {
        this.hitPos       = undefined;
        this.hitScreenPos = undefined;
      }
    }
  }

  collidingWithBubble(samplePos) {
    for (let bubbleIdx = 0; bubbleIdx < this.grid.bubbles.length; ++bubbleIdx) {
      const bubblePos = this.grid.bubbles[bubbleIdx].getScreenPos();
      const dist = Math.hypot(samplePos.x - bubblePos.x, samplePos.y - bubblePos.y);
      if (dist <= cfg.BUBBLE_RADIUS*2) return true;
    }
    return false;
  }

  screenPosToGridPos(pos) {
    const xPos = pos.x - this.grid.xOffset;
    const yPos = pos.y - this.grid.yOffset;
    const q = (Math.sqrt(3)/3 * xPos - 1/3 * yPos) / cfg.TILE_RADIUS;
    const r = (2/3 * yPos) / cfg.TILE_RADIUS;

    return this.cubeRound({ x: q, z: r, y: -q - r });
  }

  cubeRound(pos) {
    let rx = Math.round(pos.x);
    let ry = Math.round(pos.y);
    let rz = Math.round(pos.z);

    const xDiff = Math.abs(rx - pos.x);
    const yDiff = Math.abs(ry - pos.y);
    const zDiff = Math.abs(rz - pos.z);

    if (xDiff > yDiff || xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    return { q: rx, r: rz };
  }

  draw(ctx) {
    if (this.hitPos) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 5;
      ctx.beginPath();
      ctx.moveTo(this.origin.x, this.origin.y);

      if (this.wallHitPos) {
        ctx.lineTo(this.wallHitPos.x, this.wallHitPos.y);
      }

      ctx.lineTo(this.lastSamplePos.x, this.lastSamplePos.y);
      ctx.stroke();
    }

    // debug
    // this.samplePoints.forEach(point => {
    //   ctx.lineWidth = 1;
    //   ctx.beginPath();
    //   ctx.arc(point.x, point.y, 1, 0, Math.PI*2);
    //   ctx.stroke();
    // });
    // if (this.wallHitPos) {
    //   ctx.lineWidth = 2;
    //   ctx.strokeStyle = '#fff';
    //   ctx.beginPath();
    //   ctx.arc(this.wallHitPos.x, this.wallHitPos.y, cfg.BUBBLE_RADIUS, 0, Math.PI*2);
    //   ctx.stroke();
    // }

    if (this.hitScreenPos) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.hitScreenPos.x, this.hitScreenPos.y, cfg.BUBBLE_RADIUS, 0, Math.PI*2);
      ctx.stroke();
    }
  }

}
