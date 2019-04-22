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
    this.activeBubble.update(dt);
  }

  getNewBubble() {
    this.activeBubble = new Bubble(getRandomBubbleType(), cfg.BUBBLE_RADIUS);
    this.activeBubble.addScreenPos(Object.assign({ ...this.aimGuide.origin }));
  }

  shootBubble() {
    this.activeBubble.shoot(this.aimGuide.hitScreenPos, this.aimGuide.hitPos, this.aimGuide.wallHitPos);
  }

}
