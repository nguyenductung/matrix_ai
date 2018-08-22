Array.prototype.sample = function() {
  return this[Math.floor(Math.random() * this.length)];
};

class Game {
  constructor() {
    this.turn = 0;
    this.maxTurn = 27;
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

  static allPieces() {
    return [
      [7, 7, 7],
      [7, 7, 8],
      [7, 7, 9],
      [7, 7, 10],
      [7, 8, 7],
      [7, 8, 8],
      [7, 8, 9],
      [7, 8, 10],
      [7, 9, 7],
      [7, 9, 8],
      [7, 9, 9],
      [7, 9, 10],
      [7, 10, 7],
      [7, 10, 8],
      [7, 10, 9],
      [7, 10, 10],
      [8, 7, 7],
      [8, 7, 8],
      [8, 7, 9],
      [8, 7, 10],
      [8, 8, 7],
      [8, 8, 8],
      [8, 8, 9],
      [8, 8, 10],
      [8, 9, 7],
      [8, 9, 8],
      [8, 9, 9],
      [8, 9, 10],
      [8, 10, 7],
      [8, 10, 8],
      [8, 10, 9],
      [8, 10, 10],
      [9, 7, 7],
      [9, 7, 8],
      [9, 7, 9],
      [9, 7, 10],
      [9, 8, 7],
      [9, 8, 8],
      [9, 8, 9],
      [9, 8, 10],
      [9, 9, 7],
      [9, 9, 8],
      [9, 9, 9],
      [9, 9, 10],
      [9, 10, 7],
      [9, 10, 8],
      [9, 10, 9],
      [9, 10, 10],
      [10, 7, 7],
      [10, 7, 8],
      [10, 7, 9],
      [10, 7, 10],
      [10, 8, 7],
      [10, 8, 8],
      [10, 8, 9],
      [10, 8, 10],
      [10, 9, 7],
      [10, 9, 8],
      [10, 9, 9],
      [10, 9, 10],
      [10, 10, 7],
      [10, 10, 8],
      [10, 10, 9],
      [10, 10, 10]
    ];
  }

  boardString() {
    return this.board.map(r => r.join('')).join('');
  }

  printBoard() {
    console.log(this.board.map(r => r.map(i => i.toString().padStart(3)).join('')).join('\n'));
  }

  clone() {
    var game = new Game();
    game.turn = this.turn;
    game.board = JSON.parse(JSON.stringify(this.board));
    return game;
  }

  isFinished() {
    return this.turn == this.maxTurn;
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

const INF = 999999999;

class AlphaBeta {
  constructor() {
    this.maxDepth = 3;
    this.maxMoveBreadth = 27;
    this.minMoveBreadth = 64;
  }

  search(game, piece, depth = this.maxDepth, alpha = -INF, beta = INF, maxMove = true) {
    if (depth === 0 || game.isFinished()) {
      var score = game.score;
      if (score !== 0) score = score - depth * Math.abs(score) / score;
      return {
        score: score,
        position: undefined
      };
    }
    else if (maxMove) {
      var oldScore = game.score;
      var maxScore = -INF;
      var positions = game.emptyPositions
        .map(position => {
          return {
            position: position,
            score: game.tryGetScore(piece, position)
          };
        })
        .filter(i => i.score > oldScore)
        .sort((i, j) => j.score - i.score)
        .map(i => i.position)
        .slice(0, this.maxMoveBreadth);

      var bestPosition = positions[0];

      for (var i = 0; i < positions.length; i++) {
        var position = positions[i];
        var g = game.clone();
        g.placePiece(piece, position);

        var result = this.search(g, undefined, depth - 1, alpha, beta, false);
        if (result.score > maxScore) {
          maxScore = result.score;
          bestPosition = position;
        }
        if (maxScore > alpha) alpha = maxScore;

        if (beta <= alpha) { // beta cut
          return {
            score: maxScore,
            position: position
          };
        }
      }

      return {
        score: maxScore,
        position: bestPosition
      };
    }
    else {
      var minScore = INF;
      var pieces = Game.allPieces();

      if (depth > 2) {
        // sort pieces
        pieces = pieces
          .map(p => {
            var score = game.emptyPositions.reduce((maxScore, position) => Math.max(maxScore, game.tryGetScore(p, position)));
            return {piece: p, score: score};
          })
          .sort((i, j) => i.score - j.score)
          .map(i => i.piece)
          .slice(0, this.minMoveBreadth);
      }

      var bestPiece = pieces[0];

      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];

        var result = this.search(game, p, depth - 1, alpha, beta, true);
        if (result.score < minScore) {
          minScore = result.score;
          bestPiece = p;
        }
        if (minScore < beta) beta = minScore;

        if (beta <= alpha) { // alpha cut
          return {
            score: minScore,
            position: undefined
          }
        }
      }

      return {
        score: minScore,
        position: undefined
      };
    }
  }
}

class GameAI { // AlphaBetaAI
  constructor(game) {
    this.game = game;
    this.alphaBeta = new AlphaBeta();
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

  getRandomPosition() {
    return this.game.emptyPositions.sample();
  }

  searchPosition(piece) {
    if (this.game.turn >= 15) {
      this.alphaBeta.maxDepth = 9;
      this.alphaBeta.maxMoveBreadth = 5;
      this.alphaBeta.minMoveBreadth = 2;
    }
    else if (this.game.turn >= 10) {
      this.alphaBeta.maxDepth = 9;
      this.alphaBeta.maxMoveBreadth = 6;
      this.alphaBeta.minMoveBreadth = 2;
    }
    else if (this.game.turn >= 5) {
      this.alphaBeta.maxDepth = 5;
      this.alphaBeta.maxMoveBreadth = 27;
      this.alphaBeta.minMoveBreadth = 64;
    }

    return this.alphaBeta.search(this.game, piece).position || this.getRandomPosition();
  }

  getPosition(piece) {
    var position;

    if (this.game.turn === 0) {
      position = this.getFirstPosition(piece);
    }
    else {
      position = this.searchPosition(piece);
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
