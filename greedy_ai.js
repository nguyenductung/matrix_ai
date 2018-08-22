Array.prototype.sample = function() {
  return this[Math.floor(Math.random() * this.length)];
};

class Game {
  constructor() {
    this.turn = 0;
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

  boardString() {
    return this.board.map(r => r.join('')).join('');
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

    this.turn += 1;

    return this;
  }

  tryGetScore(piece, position) {
    var r = position.r;
    var c = position.c;

    this.board[r][c] = piece[0];
    this.board[r + 1][c] = piece[1];
    this.board[r + 2][c] = piece[2];

    var score = this.score;

    this.board[r][c] = 0;
    this.board[r + 1][c] = 0;
    this.board[r + 2][c] = 0;

    return score;
  }

  getScoreInLine(line) {
    var score = 0;
    var values = [];

    for (var i = 0; i < line.length; i++) {
      var value = line[i] || 0;
      if (i !== 0 && value !== values[0]) {
        if (values.length >= 3) score += values[0] * values.length;
        values = [value];
      } else {
        values.push(value);
      }
    }

    if (values.length >= 3) score += values[0] * values.length;

    return score;
  }

  getRealScore() {
    var score = 0;

    // →
    for (var r = 0; r < this.height; r++) {
      score += this.getScoreInLine(this.board[r]);
    }
    // ↓
    for (var c = 0; c < this.width; c++) {
      score += this.getScoreInLine(this.board.map(r => r[c]));
    }
    // ↘
    for (var c = -(this.width - 1); c < this.width; c++) {
      var r = 0;
      var line = [];
      for (var i = 0; i < this.height; i++) {
        line.push(this.board[r + i][c + i] || 0);
      }
      score += this.getScoreInLine(line);
    }
    // ↗
    for (var c = -(this.width - 1); c < this.width; c++) {
      var r = this.height - 1;
      var line = [];
      for (var i = 0; i < this.height; i++) {
        line.push(this.board[r - i][c + i] || 0);
      }
      score += this.getScoreInLine(line);
    }

    return score;
  }

  getPotentialScoreInLine(line) {
    var score = 0;

    if (line[0] === undefined || line[1] === undefined || line[2] === undefined) return score;

    if ((!line[0] && line[1] === line[2])
        ||
        (!line[1] && line[2] === line[0])
        ||
        (!line[2] && line[0] === line[1])) {
      score = (line[0] + line[1] + line[2]) / 2;
      if (score !== 10) score /= 2;
    }

    return score;
  }

  getPotentialScoreAtPosition(r, c) {
    var score = 0;

    score += this.getPotentialScoreInLine([this.board[r][c], this.board[r][c + 1], this.board[r][c + 2]]); // →
    if (r < this.height - 2) {
      score += this.getPotentialScoreInLine([this.board[r][c], this.board[r + 1][c], this.board[r + 1][c]]); // ↓
      score += this.getPotentialScoreInLine([this.board[r][c], this.board[r + 1][c + 1], this.board[r + 2][c + 2]]); // ↘
      score += this.getPotentialScoreInLine([this.board[r][c], this.board[r + 1][c - 1], this.board[r + 2][c - 2]]); // ↙
    }
    return score;
  }

  getPotentialScore() {
    var score = 0;

    for (var r = 0; r < this.height; r++) {
      for (var c = 0; c < this.width; c++) {
        score += this.getPotentialScoreAtPosition(r, c);
      }
    }

    return score;
  }

  get emptyPositions() {
    return this.getEmptyPositions();
  }

  get score() {
    var str = this.boardString();

    if (Game.scores[str] !== undefined) {
      // get cached value
      return Game.scores[str];
    }

    var score = this.getRealScore() + this.getPotentialScore();
    Game.scores[str] = score; // cache value

    return score;
  }
}

Game.scores = {};

class GameAI { // GreedyAI
  constructor(game) {
    this.game = game;
  }

  getFirstPosition(piece) {
    var position = {
      r: 3,
      c: 1 + Math.floor(Math.random() * (this.game.width - 2))
    };

    if (piece[0] === piece[1] && piece[1] > piece[2] + 1) { // 9 9 7
      position.r = 6;
    }
    else if (piece[0] + 1 < piece[1] && piece[1] === piece[2]) { // 7 9 9
      position.r = 0;
    }

    var count = piece.filter(i => i === 10).length;
    if (count === 3) {
      position.c = Math.floor(this.game.width / 2);
    }
    else if (count < 2) {
      var cols = [...Array(this.game.width).keys()];
      if (count === 1) {
        cols = cols.slice(1, cols.length - 2);
      }
      cols = cols.filter(c => c < this.game.width / 3 || c >= 2 * this.game.width / 3);

      position.c = cols.sample();
    }

    return position;
  }

  getBestPosition(piece) {
    var positions = this.game.emptyPositions;
    var bestPosition = positions[0];
    var maxScore = 0;

    for (var i = 0; i < positions.length; i++) {
      var position = positions[i];
      var score = game.tryGetScore(piece, position);
      if (score > maxScore) {
        maxScore = score;
        bestPosition = position;
      }
    }

    return bestPosition;
  }

  getPosition(piece) {
    var position;

    if (this.game.turn === 0) {
      position = this.getFirstPosition(piece);
    }
    else {
      position = this.getBestPosition(piece);
    }

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
