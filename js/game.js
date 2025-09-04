// 贪吃蛇游戏主文件

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;
        
        // 游戏状态
        this.gameState = 'stopped'; // stopped, running, paused, gameOver
        this.score = 0;
        this.highScore = 0;
        this.difficulty = 'medium';
        this.pixelStyle = '16bit';
        
        // 游戏速度配置
        this.speedConfig = {
            easy: 150,
            medium: 100,
            hard: 70
        };
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // 食物
        this.food = this.generateFood();
        
        // 游戏循环
        this.gameLoop = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        this.loadHighScore();
        this.setupEventListeners();
        this.draw();
        this.updateScoreDisplay();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 按钮控制
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideSettings();
        });
        
        // 历史记录按钮
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        // 历史记录按钮事件监听
        document.getElementById('history-btn').addEventListener('click', () => {
            this.showHistory();
        });
        
        // 游戏说明按钮事件监听
        document.getElementById('instructions-btn').addEventListener('click', () => {
            this.showInstructions();
        });
        
        // 移动端按钮事件监听
        document.getElementById('mobile-settings-btn').addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('mobile-history-btn').addEventListener('click', () => {
            this.showHistory();
        });
        
        document.getElementById('mobile-instructions-btn').addEventListener('click', () => {
            this.showInstructions();
        });
        
        document.getElementById('close-history').addEventListener('click', () => {
            this.hideHistory();
        });
        
        // 齿轮按钮事件监听
        document.getElementById('gear-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleGearMenu();
        });
        
        // 齿轮菜单项事件监听
        document.getElementById('gear-settings').addEventListener('click', () => {
            this.hideGearMenu();
            this.showSettings();
        });
        
        document.getElementById('gear-history').addEventListener('click', () => {
            this.hideGearMenu();
            this.showHistory();
        });
        
        document.getElementById('gear-instructions').addEventListener('click', () => {
            this.hideGearMenu();
            this.showInstructions();
        });
        
        // 点击其他地方关闭齿轮菜单
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.gear-btn') && !e.target.closest('.gear-menu')) {
                this.hideGearMenu();
            }
        });
        
        // 移动端虚拟方向键
        document.getElementById('up-btn').addEventListener('click', () => {
            this.setDirection('up');
        });
        
        document.getElementById('down-btn').addEventListener('click', () => {
            this.setDirection('down');
        });
        
        document.getElementById('left-btn').addEventListener('click', () => {
            this.setDirection('left');
        });
        
        document.getElementById('right-btn').addEventListener('click', () => {
            this.setDirection('right');
        });
        
        // 设置面板
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            if (this.gameState === 'running') {
                this.updateGameSpeed();
            }
        });
        
        document.getElementById('pixel-style-select').addEventListener('change', (e) => {
            this.pixelStyle = e.target.value;
            this.draw();
        });
    }
    
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.setDirection('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.setDirection('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.setDirection('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.setDirection('right');
                break;
            case ' ':
                e.preventDefault();
                if (this.gameState === 'running') {
                    this.togglePause();
                }
                break;
        }
    }
    
    setDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        if (opposites[newDirection] !== this.direction) {
            this.nextDirection = newDirection;
        }
    }
    
    startGame() {
        if (this.gameState === 'stopped' || this.gameState === 'gameOver') {
            this.resetGame();
            this.gameState = 'running';
            this.updateButtons();
            this.startGameLoop();
        }
    }
    
    togglePause() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
            this.stopGameLoop();
            this.updateButtons();
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.startGameLoop();
            this.updateButtons();
        }
    }
    
    restartGame() {
        this.hideGameOver();
        this.resetGame();
        this.gameState = 'running';
        this.updateButtons();
        this.startGameLoop();
    }
    
    resetGame() {
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.updateScoreDisplay();
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speedConfig[this.difficulty]);
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    updateGameSpeed() {
        if (this.gameState === 'running') {
            this.stopGameLoop();
            this.startGameLoop();
        }
    }
    
    update() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 移动蛇头
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.food = this.generateFood();
        } else {
            // 如果没有吃到食物，移除尾部
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
            return true;
        }
        
        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.stopGameLoop();
        this.updateButtons();
        this.saveScore();
        this.showGameOver();
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格（可选）
        this.drawGrid();
        
        // 绘制蛇
        this.drawSnake();
        
        // 绘制食物
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        const pixelSize = this.pixelStyle === '8bit' ? 2 : 1;
        
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 蛇头用不同颜色
            if (index === 0) {
                this.ctx.fillStyle = '#00ff00';
            } else {
                this.ctx.fillStyle = '#00cc00';
            }
            
            if (this.pixelStyle === '8bit') {
                // 8-bit像素风格
                this.ctx.fillRect(x + pixelSize, y + pixelSize, this.gridSize - pixelSize * 2, this.gridSize - pixelSize * 2);
            } else {
                // 16-bit像素风格
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const pixelSize = this.pixelStyle === '8bit' ? 2 : 1;
        
        this.ctx.fillStyle = '#ff0000';
        
        if (this.pixelStyle === '8bit') {
            // 8-bit像素风格
            this.ctx.fillRect(x + pixelSize, y + pixelSize, this.gridSize - pixelSize * 2, this.gridSize - pixelSize * 2);
        } else {
            // 16-bit像素风格
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
        }
    }
    
    updateButtons() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        switch(this.gameState) {
            case 'stopped':
            case 'gameOver':
                startBtn.textContent = '开始游戏';
                pauseBtn.disabled = true;
                break;
            case 'running':
                startBtn.textContent = '重新开始';
                pauseBtn.disabled = false;
                pauseBtn.textContent = '暂停';
                break;
            case 'paused':
                startBtn.textContent = '重新开始';
                pauseBtn.disabled = false;
                pauseBtn.textContent = '继续';
                break;
        }
    }
    
    showGameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-overlay').classList.add('show');
    }
    
    hideGameOver() {
        document.getElementById('game-overlay').classList.remove('show');
    }
    
    showSettings() {
        document.getElementById('settings-panel').classList.add('show');
    }
    
    hideSettings() {
        document.getElementById('settings-panel').classList.remove('show');
    }
    
    showHistory() {
        this.updateHistoryDisplay();
        document.getElementById('history-panel').classList.add('show');
    }
    
    hideHistory() {
        document.getElementById('history-panel').classList.remove('show');
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('history-list');
        const history = JSON.parse(localStorage.getItem('snakeHistory') || '[]');
        
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #cccccc;">暂无历史记录</p>';
            return;
        }
        
        historyList.innerHTML = history.map((record, index) => `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-score">${record.score}分</span>
                    <span class="history-difficulty">${this.getDifficultyText(record.difficulty)}</span>
                </div>
                <span class="history-date">${record.date}</span>
            </div>
        `).join('');
    }
    
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '简单',
            'medium': '中等',
            'hard': '困难'
        };
        return difficultyMap[difficulty] || difficulty;
    }
    
    toggleGearMenu() {
        const gearMenu = document.getElementById('gear-menu');
        gearMenu.classList.toggle('show');
    }
    
    hideGearMenu() {
        const gearMenu = document.getElementById('gear-menu');
        gearMenu.classList.remove('show');
    }
    
    saveScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        // 保存历史记录
        const history = JSON.parse(localStorage.getItem('snakeHistory') || '[]');
        const record = {
            score: this.score,
            difficulty: this.difficulty,
            date: new Date().toLocaleString()
        };
        
        history.push(record);
        history.sort((a, b) => b.score - a.score);
        
        // 只保留前10个记录
        if (history.length > 10) {
            history.splice(10);
        }
        
        localStorage.setItem('snakeHistory', JSON.stringify(history));
        this.updateScoreDisplay();
    }
    
    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }
    
    updateScoreDisplay() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    // 添加游戏说明显示
    showInstructions() {
        const instructions = `
            <div style="text-align: left; line-height: 1.6;">
                <h4 style="color: #00ff00; margin-bottom: 10px;">游戏说明：</h4>
                <p><strong>控制方式：</strong></p>
                <ul style="margin-left: 20px; margin-bottom: 15px;">
                    <li>键盘：方向键或WASD</li>
                    <li>移动端：点击虚拟方向键</li>
                    <li>暂停：空格键或暂停按钮</li>
                </ul>
                <p><strong>游戏规则：</strong></p>
                <ul style="margin-left: 20px; margin-bottom: 15px;">
                    <li>控制蛇吃红色食物</li>
                    <li>每吃一个食物得10分</li>
                    <li>避免撞墙或撞到自己</li>
                    <li>蛇会随着吃食物而变长</li>
                </ul>
                <p><strong>难度说明：</strong></p>
                <ul style="margin-left: 20px;">
                    <li>简单：速度慢，适合新手</li>
                    <li>中等：标准速度</li>
                    <li>困难：速度快，挑战性高</li>
                </ul>
            </div>
        `;
        
        // 创建说明弹窗
        const overlay = document.createElement('div');
        overlay.className = 'settings-panel show';
        overlay.innerHTML = `
            <div class="settings-content">
                <h3>游戏说明</h3>
                ${instructions}
                <div class="setting-group">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // 将游戏实例挂载到全局，方便调试
    window.snakeGame = game;
});
