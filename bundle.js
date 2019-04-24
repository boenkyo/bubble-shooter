(function () {
  'use strict';

  var cfg = {
    // Grid
    GRID_WIDTH:   16,
    GRID_HEIGHT:  9,
    GRID_SPACING: 6,
    TILE_RADIUS:  20,

    // Bubble
    BUBBLE_RADIUS: 17,
  };

  class Bubble {

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

  function getRandomBubbleType() {
    const values = Object.values(BubbleType);
    return values[Math.floor(Math.random() * values.length)];
  }

  class Grid {

    constructor(game) {
      this.game = game;

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
          const bubble = new Bubble(bubbleType, cfg.BUBBLE_RADIUS, this);
          bubble.addGridPosition(q, r);
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

        bubble.updateGridPosition(newQ, newR);
      });

      const newBubbles = this.createBubbles(2);
      this.bubbles = newBubbles.concat(this.bubbles);
    }

    addBubble(bubble, q, r) {
      bubble.isMoving = false;
      bubble.addGridPosition(q, r);
      this.bubbles.push(bubble);
      this.game.getNewBubble();
    }

    isPosEqual(pos1, pos2) {
      return pos1.q == pos2.q && pos1.r == pos2.r;
    }

    gridPosToScreenPos(gridPos) {
      const x = cfg.TILE_RADIUS *
                (Math.sqrt(3) * gridPos.q + Math.sqrt(3)/2 * gridPos.r)
                + this.xOffset;
      const y = cfg.TILE_RADIUS * (3/2 * gridPos.r)
                + this.yOffset;

      return { x, y };
    }

  }

  class AimGuide {

    constructor(game, inputHandler, origin, grid) {
      this.game = game;
      this.inputHandler = inputHandler;
      this.origin = origin;
      this.grid = grid;
      this.angle = Math.PI / 2;
      this.guideLen = 100;

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

      this.sampleHexes();

      this.mousePos = mousePos;
    }

    sampleHexes() {
      const sampleDistance = 5;
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
        const bubblePos = this.grid.bubbles[bubbleIdx].screenPos;
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
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.moveTo(this.origin.x, this.origin.y);

        if (this.wallHitPos) {
          ctx.lineTo(this.wallHitPos.x, this.wallHitPos.y);
        }

        ctx.lineTo(this.lastSamplePos.x, this.lastSamplePos.y);
        ctx.stroke();
      }

      if (this.hitScreenPos) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.hitScreenPos.x, this.hitScreenPos.y, cfg.BUBBLE_RADIUS, 0, Math.PI*2);
        ctx.stroke();
      }
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
