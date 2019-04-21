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
    this.ghostBubble;
  }

  update(mousePos) {
    const mouseRelX = mousePos.x - this.origin.x;
    const mouseRelY = -mousePos.y + this.origin.y;

    this.angle = Math.atan2(mouseRelY, mouseRelX);

    if (this.angle < 0.3 || this.angle > Math.PI - 0.3) return;

    this.samplePoints = [];
    this.sampleHexes();

    this.mousePos = mousePos;
  }

  sampleHexes() {
    const sampleDistance = 2;
    let positionFound = false;

    const yIncrement = sampleDistance * Math.sin(this.angle);

    let y = yIncrement;

    while (!positionFound && y < 500) {
      const sampleXCenter = y / Math.tan(this.angle) + this.origin.x;
      const sampleYCenter = this.origin.y - y;

      const sampleCenterPos = { x: sampleXCenter, y: sampleYCenter };

      const sampleX0 = sampleXCenter + cfg.BUBBLE_RADIUS * Math.sin(this.angle);
      const sampleY0 = sampleYCenter + cfg.BUBBLE_RADIUS * Math.cos(this.angle);
      const sampleX1 = sampleXCenter - cfg.BUBBLE_RADIUS * Math.sin(this.angle);
      const sampleY1 = sampleYCenter - cfg.BUBBLE_RADIUS * Math.cos(this.angle);

      const samplePos = { x: sampleX1, y: sampleY1 };
      const samplePos2 = { x: sampleX0, y: sampleY0 };

      this.samplePoints.push(samplePos, samplePos2);

      // calculate grid position of sample point
      const sampleGridPos0 = this.screenPosToGridPos(samplePos);
      const sampleGridPos1 = this.screenPosToGridPos(samplePos2);

      if (this.isInGrid(sampleGridPos0) || this.isInGrid(sampleGridPos1)) {
        const offset = cfg.BUBBLE_RADIUS - 5;

        const offsetCenterPosX = sampleCenterPos.x + offset * Math.cos(Math.PI - this.angle);
        const offsetCenterPosY = sampleCenterPos.y + offset * Math.sin(Math.PI - this.angle);

        const ghostGridPos = this.screenPosToGridPos({ x: offsetCenterPosX, y: offsetCenterPosY });

        this.ghostBubble = this.makeGhostBubble(ghostGridPos);
        positionFound = true;
      }

      y += yIncrement;

      if (!positionFound) {
        this.ghostBubble = undefined;
        this.lastGhostPos = undefined;
      }
    }
  }

  isInGrid(sampleGridPos) {
    for (let bubbleIdx = 0; bubbleIdx < this.grid.bubbles.length; ++bubbleIdx) {
      const bubblePos = this.grid.bubbles[bubbleIdx].gridPos;
      if (sampleGridPos.q == bubblePos.q && sampleGridPos.r == bubblePos.r) {
        return true;
      }
    }
    return false;
  }

  makeGhostBubble(gridPos) {
    const bubble = new Bubble(1, cfg.BUBBLE_RADIUS);
    bubble.color = '#fff';
    bubble.addGridPosition(this.grid, gridPos.q, gridPos.r);

    return bubble;
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
    const endX = this.origin.x + Math.cos(this.angle) * this.guideLen;
    const endY = this.origin.y - Math.sin(this.angle) * this.guideLen;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 3;

    ctx.beginPath();
    ctx.moveTo(this.origin.x, this.origin.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // this.samplePoints.forEach(point => {
    //   ctx.lineWidth = 1;
    //   ctx.beginPath();
    //   ctx.arc(point.x, point.y, 1, 0, Math.PI*2);
    //   ctx.stroke();
    // });

    if (this.ghostBubble) {
      this.ghostBubble.draw(ctx);
    }
  }

}
