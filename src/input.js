export default class InputHandler {

  constructor(game, canvas) {
    this.canvas = canvas;

    document.addEventListener('keydown', event => {
      switch (event.code) {
        case 'KeyD':
          game.grid.debug = !game.grid.debug;
          break;
        case 'Space':
          game.shootBubble();
          break;
      }
    });

    document.addEventListener('mousedown', event => {
      game.shootBubble();
    });

    document.addEventListener('mousemove', event => {
      const mousePos = this.getMousePos(event);
      game.aimGuide.update(mousePos);
    });
  }

  getMousePos(event) {
    return {
      x: event.clientX - this.canvas.offsetLeft,
      y: event.clientY - this.canvas.offsetTop,
    };
  }

}
