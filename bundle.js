(function () {
  'use strict';

  var cfg = {
    // Grid
    GRID_WIDTH:   16,
    GRID_HEIGHT:  9,
    GRID_SPACING: 6,
    TILE_RADIUS:  20,

    // Bubble
    BUBBLE_RADIUS: 15,
  };

  class Bubble {

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

  function getRandomBubbleType() {
    const values = Object.values(BubbleType);
    return values[Math.floor(Math.random() * values.length)];
  }

  class Grid {

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

  class AimGuide {

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

  class InputHandler {

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

  class Game {

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

    shootBubble() {
      this.activeBubble.shotHandler
        .shoot(this.aimGuide.angle);
    }

  }

  const canvas = document.getElementById('my-canvas');
  const scaled = scaleAndGetContext(canvas);

  const ctx         = scaled.ctx;
  const GAME_WIDTH  = scaled.gameWidth;
  const GAME_HEIGHT = scaled.gameHeight;

  const game = new Game(canvas, GAME_WIDTH, GAME_HEIGHT);

  // game loop

  let tLast = 0;

  function gameLoop(tCurrent) {
    const dt = tCurrent - tLast;
    tLast = tCurrent;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    game.update(dt);
    game.draw(ctx);

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);


  function scaleAndGetContext(canvas) {
    const pr = window.devicePixelRatio;
    canvas.width *= pr;
    canvas.height *= pr;
    canvas.style.width = `${canvas.width/pr}px`;
    canvas.style.height = `${canvas.height/pr}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(pr, pr);

    const gameWidth = parseFloat(canvas.style.width);
    const gameHeight = parseFloat(canvas.style.height);

    return { ctx, gameWidth, gameHeight };
  }

}());
