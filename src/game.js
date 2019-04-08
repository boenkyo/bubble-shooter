import cfg from './config';
import Grid from './grid';
import AimGuide from './aim_guide';
import InputHandler from './input';
import { Bubble, getRandomBubbleType } from './bubble';


export default class Game {

  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;

    this.inputHandler = new InputHandler(this, canvas);

    this.grid = new Grid(this, cfg);

    this.aimGuide = new AimGuide(this.inputHandler, { x: width / 2, y: height - 30 });

    this.activeBubble = new Bubble(getRandomBubbleType(), cfg.BUBBLE_RADIUS);
    this.activeBubble.addShotHandler(Object.assign({ ...this.aimGuide.origin }), this);
  }

  draw(ctx) {
    this.grid.drawBubbles(ctx);
    this.aimGuide.draw(ctx);
    this.activeBubble.draw(ctx);
  }

  update(dt) {
    this.activeBubble.update(dt);

    if (!this.activeBubble.collided) {
      for (let i = 0; i < this.grid.bubbles.length; ++i) {
        const gridBubble = this.grid.bubbles[i];
        const collision = this.activeBubble.shotHandler
          .checkCollision(gridBubble);

        if (collision.colliding) {
          this.activeBubble.collided = true;

          let q = gridBubble.gridPos.q;
          let r = gridBubble.gridPos.r;

          if (collision.horizontalPos == 'left') {
            switch (collision.verticalPos) {
              case 'bottom': q--; r++; break;
              case 'middle': q--;      break;
              case 'top':    r--;
            }
          } else {
            switch (collision.verticalPos) {
              case 'bottom': r++; break;
              case 'middle': q++; break;
              case 'top':    q++; r--;
            }
          }

          this.grid.addBubble(this.activeBubble, q, r);

          // new active bubble
          this.activeBubble = new Bubble(getRandomBubbleType(), cfg.BUBBLE_RADIUS);
          this.activeBubble.addShotHandler(Object.assign({ ...this.aimGuide.origin }), this);

          break;
        }
      }
    }
  }

  shootBubble() {
    this.activeBubble.shotHandler
      .shoot(this.aimGuide.angle);
  }

}
