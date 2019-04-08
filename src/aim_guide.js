export default class AimGuide {

  constructor(inputHandler, origin) {
    this.inputHandler = inputHandler;
    this.origin = origin;

    this.angle = Math.PI / 2;
    this.guideLen = 100;
  }

  update(mousePos) {
    const relX = mousePos.x - this.origin.x;
    const relY = -mousePos.y + this.origin.y;

    this.angle = Math.atan2(relY, relX);
    this.mousePos = mousePos;
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
  }

}
