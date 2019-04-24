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
    this.grid = new Grid(this);
    this.aimGuide = new AimGuide(this, this.inputHandler, { x: width / 2, y: height - 30 }, this.grid);

    this.start();
  }

  start() {
    this.getNewBubble();
  }

  draw(ctx) {
    this.grid.drawBubbles(ctx);
    this.aimGuide.draw(ctx);
    this.activeBubble.draw(ctx);
  }

  update(dt) {
    if (this.activeBubble.inGrid) {
      this.grid.addBubble(this.activeBubble, this.activeBubble.targetGridPos.q,
                          this.activeBubble.targetGridPos.r);
      this.aimGuide.sampleHexes(); // prevent next bubble from going to same pos
    }
    this.activeBubble.update(dt);
  }

  getNewBubble() {
    this.activeBubble = new Bubble(getRandomBubbleType(), cfg.BUBBLE_RADIUS, this.grid);
    this.activeBubble.addScreenPos(Object.assign({ ...this.aimGuide.origin }));
  }

  shootBubble() {
    if (this.aimGuide.hitPos) {
      this.activeBubble.shoot(this.aimGuide.hitScreenPos, this.aimGuide.hitPos, this.aimGuide.wallHitPos);
    }
  }

}
