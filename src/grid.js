import { Bubble, getRandomBubbleType } from './bubble';

export default class Grid {

  // TODO: make constants class with bubble and grid sizes

  constructor(game, cfg) {
    this.cfg = cfg;

    this.width      = cfg.GRID_WIDTH;
    this.height     = cfg.GRID_HEIGHT;
    this.spacing    = cfg.GRID_SPACING;
    this.tileRadius = cfg.TILE_RADIUS;

    const tileWidth = cfg.TILE_RADIUS * Math.sqrt(3);
    this.xOffset = (game.width - tileWidth * this.width + 1/2 * tileWidth) / 2;
    this.yOffset = cfg.TILE_RADIUS;

    this.bubbles = this.createBubbles(this.height);

    this.debug = false;
  }

  createBubbles(height) {
    const bubbles = [];
    for (let r = 0; r < height; ++r) {
      const rOffset = Math.floor(r/2);
      for (let q = -rOffset; q < this.width - rOffset; ++q) {
        const bubbleType = getRandomBubbleType();
        const bubble = new Bubble(bubbleType, this.cfg.BUBBLE_RADIUS);
        bubble.addGridPosition(this, q, r);

        bubbles.push(bubble);
      }
    }
    return bubbles;
  }

  drawBubbles(ctx) {
    this.bubbles.forEach(bubble => {
      bubble.draw(ctx);
    });
  }

  shiftDown() {
    this.bubbles.forEach(bubble => {
      const newQ = bubble.gridPos.q - 1;
      const newR = bubble.gridPos.r + 2;

      bubble.gridPos.update(newQ, newR);
    });

    const newBubbles = this.createBubbles(2);
    this.bubbles = newBubbles.concat(this.bubbles);
  }

  addBubble(bubble, q, r) {
    delete bubble.shotHandler;
    bubble.addGridPosition(this, q, r);
    this.bubbles.push(bubble);
  }

}
