Array.prototype.sample = function() {
  return this[Math.floor(Math.random() * this.length)];
};

class Game {
  constructor() {
    this.width = 9;
    this.height = 9;
    this.board = [];

    for (var r = 0; r < this.height; r++) {
      this.board[r] = [];
      for (var c = 0; c < this.width; c++) {
        this.board[r][c] = 0;
      }
    }
  }

  getEmptyPositions() {
    var positions = [];

    for (var r = 0; r < this.height; r += 3) {
      for (var c = 0; c < this.width; c++) {
        if (this.board[r][c]) continue;
        positions.push({r: r, c: c});
      }
    }

    return positions;
  }

  placePiece(piece, position) {
    var r = position.r;
    var c = position.c;

    this.board[r][c] = piece[0];
    this.board[r + 1][c] = piece[1];
    this.board[r + 2][c] = piece[2];

    return this;
  }

  get emptyPositions() {
    return this.getEmptyPositions();
  }
}

class GameAI { // RandomAI
  constructor(game) {
    this.game = game;
  }

  getPosition(piece) {
    var position = this.game.emptyPositions.sample();

    this.game.placePiece(piece, position);

    return position;
  }
}

var game = new Game();
var gameAI = new GameAI(game);

var channel = require('js/game.js').default.channel;
channel.onMessage = function(e, t, n) {
  if (e === 'game:new_piece') {
    var position = gameAI.getPosition(t.piece);
    setTimeout(function() {
      channel.push('game:place_piece', {
        x: position.c, // column
        y: position.r  // row
      });
    }, 500);
  }
  return t;
}
