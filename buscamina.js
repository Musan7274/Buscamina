document.addEventListener('DOMContentLoaded', () => {
    const minefield = document.getElementById('minefield');
    const restartButton = document.getElementById('restartButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    const resetButton = document.getElementById('resetButton');
    const minesLeftDisplay = document.getElementById('minesLeft');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score');
    const rows = 10;
    const cols = 10;
    const minesCount = 20;
    let cells;
    let minePositions;
    let minesLeft;
    let score;
    let timer;
    let timerInterval;
    let isPaused = false;
    let gameOver = false;
    const infoItem = document.querySelectorAll('.info-item')[0];

    const createBoard = () => {
        minefield.innerHTML = '';
        cells = [];
        minePositions = generateMinePositions();
        minesLeft = minesCount;
        score = 0;
        timer = 0;
        isPaused = false;
        gameOver = false;
        updateDisplay();

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener('click', () => revealCell(cell));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    toggleFlag(cell);
                });

                cells.push(cell);
                minefield.appendChild(cell);
            }
        }

        startTimer();
    };

    const generateMinePositions = () => {
        const positions = new Set();
        while (positions.size < minesCount) {
            const position = Math.floor(Math.random() * rows * cols);
            positions.add(position);
        }
        return positions;
    };

    const revealCell = (cell) => {
        if (gameOver || isPaused || cell.classList.contains('revealed') || cell.classList.contains('flagged')) return;

        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const index = row * cols + col;

        if (minePositions.has(index)) {
            cell.classList.add('mine');
            revealAllMines();
            clearInterval(timerInterval);
            gameOver = true;
            updateDisplay('lose');
            alert('¡Has perdido! 💀');
        } else {
            const minesAround = countMinesAround(row, col);
            cell.classList.add('revealed');
            cell.textContent = minesAround > 0 ? minesAround : '';
            score += 10;
            updateDisplay();

            if (minesAround === 0) {
                revealSurroundingCells(row, col);
            }
        }

        checkWin();
    };

    const revealAllMines = () => {
        cells.forEach((cell, index) => {
            if (minePositions.has(index)) {
                cell.classList.add('mine');
            }
        });
    };

    const countMinesAround = (row, col) => {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                if (r === 0 && c === 0) continue;
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const index = newRow * cols + newCol;
                    if (minePositions.has(index)) {
                        count++;
                    }
                }
            }
        }
        return count;
    };

    const revealSurroundingCells = (row, col) => {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    const cell = cells[newRow * cols + newCol];
                    revealCell(cell);
                }
            }
        }
    };

    const toggleFlag = (cell) => {
        if (isPaused || cell.classList.contains('revealed')) return;

        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            cell.textContent = '';
            minesLeft++;
        } else {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
            minesLeft--;
        }
        updateDisplay();
    };

    const checkWin = () => {
        if (gameOver) return;

        const revealedCells = cells.filter(cell => cell.classList.contains('revealed')).length;
        const flaggedMines = cells.filter((cell, index) => cell.classList.contains('flagged') && minePositions.has(index)).length;

        if (revealedCells + flaggedMines === rows * cols) {
            clearInterval(timerInterval);
            gameOver = true;
            updateDisplay('win');
            alert('¡Has ganado! 😎🎉');
        }
    };

    const updateDisplay = (result = '') => {
        minesLeftDisplay.textContent = `🕳️ Minas restantes: ${minesLeft}`;
        timerDisplay.textContent = `⏱️ Tiempo: ${timer} s`;
        scoreDisplay.textContent = `🏆 Puntaje: ${score}`;

        switch (result) {
            case 'win':
                infoItem.textContent = '😎 Has ganado!';
                infoItem.classList.add('win');
                break;
            case 'lose':
                infoItem.textContent = '💀 Has perdido!';
                infoItem.classList.add('lose');
                break;
            default:
                infoItem.textContent = '😊 Juega y diviértete!';
                infoItem.classList.remove('win', 'lose');
        }
    };

    const startTimer = () => {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!isPaused && !gameOver) {
                timer++;
                updateDisplay();
            }
        }, 1000);
    };

    restartButton.addEventListener('click', () => {
        gameOver = false;  // Reset the game over state
        createBoard();
    });

    pauseButton.addEventListener('click', () => { isPaused = true; });
    resumeButton.addEventListener('click', () => { isPaused = false; });
    resetButton.addEventListener('click', () => { score = 0; updateDisplay(); });

    createBoard();
});
