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
        
        // 游戏速度配置（毫秒间隔，数值越大越慢）
        this.speedConfig = {
            easy: 300,    // 简单：300ms，非常慢，适合新手
            medium: 200,  // 中等：200ms，适中速度
            hard: 120     // 困难：120ms，较快但可控
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
        // 添加调试信息，检查DOM元素是否存在
        console.log('开始设置事件监听器...');
        
        const desktopSettingsBtn = document.getElementById('desktop-settings-btn');
        const desktopHistoryBtn = document.getElementById('desktop-history-btn');
        const desktopInstructionsBtn = document.getElementById('desktop-instructions-btn');
        
        console.log('桌面端按钮元素:', {
            settings: desktopSettingsBtn,
            history: desktopHistoryBtn,
            instructions: desktopInstructionsBtn
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
        
        // 使用事件委托处理按钮点击
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            console.log('点击的元素ID:', target.id, '文本内容:', target.textContent); // 调试信息
            
            // 开始游戏/重新开始按钮（start-btn，文本会根据状态变化）
            if (target.id === 'start-btn') {
                console.log('start-btn被点击！文本内容:', target.textContent);
                if (target.textContent === '开始游戏') {
                    this.startGame();
                } else if (target.textContent === '重新开始') {
                    this.restartGame();
                }
                return;
            }
            
            // 暂停/继续按钮（pause-btn，文本会根据状态变化）
            if (target.id === 'pause-btn') {
                console.log('pause-btn被点击！文本内容:', target.textContent);
                this.togglePause();
                return;
            }
            
            // 重新开始按钮（在游戏结束覆盖层中，固定ID）
            if (target.id === 'restart-btn') {
                console.log('restart-btn被点击！');
                this.restartGame();
                return;
            }
            
            // 设置面板关闭按钮
            if (target.id === 'close-settings') {
                this.hideSettings();
                return;
            }
            
            // 历史记录关闭按钮
            if (target.id === 'close-history') {
                this.hideHistory();
                return;
            }
            
            // 移动端按钮
            if (target.id === 'mobile-settings-btn') {
                this.showSettings();
                return;
            }
            
            if (target.id === 'mobile-history-btn') {
                this.showHistory();
                return;
            }
            
            if (target.id === 'mobile-instructions-btn') {
                this.showInstructions();
                return;
            }
            
            // 桌面端按钮
            if (target.id === 'desktop-settings-btn') {
                console.log('桌面端设置按钮被点击！');
                this.showSettings();
                return;
            }
            
            if (target.id === 'desktop-history-btn') {
                console.log('桌面端历史记录按钮被点击！');
                this.showHistory();
                return;
            }
            
            if (target.id === 'desktop-instructions-btn') {
                console.log('桌面端游戏说明按钮被点击！');
                this.showInstructions();
                return;
            }
            
            // 方向键
            if (target.id === 'up-btn') {
                this.setDirection('up');
                return;
            }
            
            if (target.id === 'down-btn') {
                this.setDirection('down');
                return;
            }
            
            if (target.id === 'left-btn') {
                this.setDirection('left');
                return;
            }
            
            if (target.id === 'right-btn') {
                this.setDirection('right');
                return;
            }
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
        console.log('startGame被调用，当前游戏状态:', this.gameState); // 调试信息
        if (this.gameState === 'stopped' || this.gameState === 'gameOver') {
            console.log('开始新游戏...'); // 调试信息
            this.resetGame();
            this.gameState = 'running';
            this.updateButtons();
            this.updateGameSpeed(); // 确保使用当前选择的难度速度
            console.log('游戏已启动，状态:', this.gameState); // 调试信息
        } else {
            console.log('游戏已在运行中，无法再次启动'); // 调试信息
        }
    }
    
    togglePause() {
        console.log('togglePause被调用，当前游戏状态:', this.gameState); // 调试信息
        
        if (this.gameState === 'running') {
            this.gameState = 'paused';
            this.stopGameLoop();
            this.updateButtons();
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.updateGameSpeed(); // 确保使用当前选择的难度速度
            this.updateButtons();
        } else {
            console.log('游戏状态不是running或paused，无法暂停/继续'); // 调试信息
        }
    }
    
    restartGame() {
        console.log('restartGame被调用，当前游戏状态:', this.gameState); // 调试信息
        this.hideGameOver();
        this.resetGame();
        this.gameState = 'running';
        this.updateButtons();
        this.updateGameSpeed(); // 确保使用当前选择的难度速度
        console.log('游戏已重新开始，状态:', this.gameState); // 调试信息
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
        console.log('startGameLoop被调用，速度:', this.speedConfig[this.difficulty], 'ms'); // 调试信息
        this.gameLoop = setInterval(() => {
            console.log('setInterval 回调函数正在执行！'); // 新增：确认回调是否执行
            this.update();
            this.draw();
        }, this.speedConfig[this.difficulty]);
        console.log('游戏循环已启动，ID:', this.gameLoop); // 调试信息
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
        console.log('update被调用，游戏状态:', this.gameState, '蛇长度:', this.snake.length); // 调试信息
        
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
        
        console.log('蛇头新位置:', head.x, head.y); // 调试信息
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            console.log('检测到碰撞，游戏结束'); // 调试信息
            this.gameOver();
            return;
        }
        
        // 添加新头部
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            console.log('吃到食物！'); // 调试信息
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
        console.log('draw被调用，游戏状态:', this.gameState); // 调试信息
        
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
        
        console.log('更新按钮状态，当前游戏状态:', this.gameState); // 调试信息
        
        switch(this.gameState) {
            case 'stopped':
            case 'gameOver':
                startBtn.textContent = '开始游戏';
                pauseBtn.disabled = true;
                pauseBtn.textContent = '暂停';
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
        console.log('设置按钮被点击了！'); // 调试信息
        document.getElementById('settings-panel').classList.add('show');
    }
    
    hideSettings() {
        document.getElementById('settings-panel').classList.remove('show');
    }
    
    showHistory() {
        console.log('历史记录按钮被点击了！'); // 调试信息
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
        console.log('游戏说明按钮被点击了！'); // 调试信息
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
    console.log('DOM加载完成，开始初始化游戏...'); // 调试信息
    const game = new SnakeGame();
    game.init(); // 调用初始化方法
    
    // 将游戏实例挂载到全局，方便调试
    window.snakeGame = game;
    console.log('游戏初始化完成！'); // 调试信息
});
