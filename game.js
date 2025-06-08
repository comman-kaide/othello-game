class OthelloGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'black';
        this.blackScore = 2;
        this.whiteScore = 2;
        this.boardElement = document.getElementById('board');
        this.messageElement = document.getElementById('message');
        this.currentPlayerElement = document.getElementById('current-player');
        this.blackScoreElement = document.getElementById('black-score');
        this.whiteScoreElement = document.getElementById('white-score');
        
        this.init();
    }
    
    init() {
        // ボードの初期化
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // 初期配置
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
        
        this.currentPlayer = 'black';
        this.updateScore();
        this.render();
        this.updateValidMoves();
    }
    
    render() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col]) {
                    const disc = document.createElement('div');
                    disc.className = `disc ${this.board[row][col]}`;
                    cell.appendChild(disc);
                }
                
                cell.addEventListener('click', () => this.handleCellClick(row, col));
                this.boardElement.appendChild(cell);
            }
        }
        
        this.updateUI();
    }
    
    handleCellClick(row, col) {
        if (this.board[row][col] !== null) {
            return;
        }
        
        const flippedDiscs = this.getFlippedDiscs(row, col, this.currentPlayer);
        
        if (flippedDiscs.length === 0) {
            this.showMessage('そこには置けません！');
            return;
        }
        
        // 石を置く
        this.board[row][col] = this.currentPlayer;
        
        // 石をひっくり返す
        flippedDiscs.forEach(([r, c]) => {
            this.board[r][c] = this.currentPlayer;
            this.animateFlip(r, c);
        });
        
        // スコア更新
        this.updateScore();
        
        // プレイヤー交代
        this.switchPlayer();
        
        // 次のプレイヤーが置ける場所があるかチェック
        if (!this.hasValidMoves(this.currentPlayer)) {
            this.switchPlayer();
            if (!this.hasValidMoves(this.currentPlayer)) {
                this.endGame();
                return;
            }
            this.showMessage(`${this.currentPlayer === 'black' ? '黒' : '白'}はパスです`);
        }
        
        this.render();
        this.updateValidMoves();
    }
    
    getFlippedDiscs(row, col, player) {
        if (this.board[row][col] !== null) {
            return [];
        }
        
        const opponent = player === 'black' ? 'white' : 'black';
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        const flipped = [];
        
        for (const [dr, dc] of directions) {
            const discsToFlip = [];
            let r = row + dr;
            let c = col + dc;
            
            while (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === opponent) {
                discsToFlip.push([r, c]);
                r += dr;
                c += dc;
            }
            
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && this.board[r][c] === player && discsToFlip.length > 0) {
                flipped.push(...discsToFlip);
            }
        }
        
        return flipped;
    }
    
    hasValidMoves(player) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === null && this.getFlippedDiscs(row, col, player).length > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    updateValidMoves() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.board[row][col] === null && this.getFlippedDiscs(row, col, this.currentPlayer).length > 0) {
                cell.classList.add('valid-move');
                
                // ヒントを表示
                const hint = document.createElement('div');
                hint.className = 'hint';
                cell.appendChild(hint);
            } else {
                cell.classList.remove('valid-move');
            }
        });
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }
    
    updateScore() {
        this.blackScore = 0;
        this.whiteScore = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 'black') {
                    this.blackScore++;
                } else if (this.board[row][col] === 'white') {
                    this.whiteScore++;
                }
            }
        }
        
        this.blackScoreElement.textContent = this.blackScore;
        this.whiteScoreElement.textContent = this.whiteScore;
    }
    
    updateUI() {
        this.currentPlayerElement.textContent = this.currentPlayer === 'black' ? '黒' : '白';
    }
    
    showMessage(message) {
        this.messageElement.textContent = message;
        setTimeout(() => {
            this.messageElement.textContent = '';
        }, 2000);
    }
    
    animateFlip(row, col) {
        const cell = this.boardElement.children[row * 8 + col];
        const disc = cell.querySelector('.disc');
        if (disc) {
            disc.classList.add('flip');
        }
    }
    
    endGame() {
        let winner;
        if (this.blackScore > this.whiteScore) {
            winner = '黒の勝ち！';
        } else if (this.whiteScore > this.blackScore) {
            winner = '白の勝ち！';
        } else {
            winner = '引き分け！';
        }
        
        this.showMessage(`ゲーム終了！ ${winner}`);
        
        // 永続的にメッセージを表示
        setTimeout(() => {
            this.messageElement.textContent = `ゲーム終了！ ${winner}`;
        }, 2100);
    }
    
    pass() {
        if (this.hasValidMoves(this.currentPlayer)) {
            this.showMessage('まだ置ける場所があります！');
            return;
        }
        
        this.switchPlayer();
        this.render();
        this.updateValidMoves();
        this.showMessage('パスしました');
    }
}

// ゲームの初期化
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new OthelloGame();
    
    // 新しいゲームボタン
    document.getElementById('new-game-btn').addEventListener('click', () => {
        game.init();
    });
    
    // パスボタン
    document.getElementById('pass-btn').addEventListener('click', () => {
        game.pass();
    });
});