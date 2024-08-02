const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let resolution = 20;
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;
const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const clickSound = document.getElementById('clickSound');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

let grid = buildGrid(GRID_WIDTH, GRID_HEIGHT);
let animationId;
let speed = 500;

speedSlider.addEventListener('input', () => {
    speed = speedSlider.value;
    speedValue.textContent = speed;
});

let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX;
let startY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.offsetX - offsetX;
    startY = e.offsetY - offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = e.offsetX - startX;
        offsetY = e.offsetY - startY;
        render(grid);
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    if (delta > 0) {
        resolution = Math.max(5, resolution - 5);
    } else {
        resolution = Math.min(50, resolution + 5);
    }
    render(grid);
});

canvas.addEventListener('click', toggleCellState);
document.getElementById('startButton').addEventListener('click', start);
document.getElementById('stopButton').addEventListener('click', stop);
document.getElementById('resetButton').addEventListener('click', reset);
document.getElementById('stepButton').addEventListener('click', advanceSteps);

function buildGrid(cols, rows) {
    return new Array(cols).fill(null)
        .map(() => new Array(rows).fill(null)
        .map(() => 0));
}

function render(grid) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            const cell = grid[col][row];
            ctx.beginPath();
            ctx.rect(col * resolution + offsetX, row * resolution + offsetY, resolution, resolution);
            ctx.fillStyle = cell ? '#61dafb' : '#20232a';
            ctx.fill();
            ctx.strokeStyle = '#282c34';
            ctx.stroke();
        }
    }
}

function nextGen(grid) {
    const nextGen = grid.map(arr => [...arr]);

    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            const cell = grid[col][row];
            let numNeighbors = 0;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) {
                        continue;
                    }
                    const x_cell = col + i;
                    const y_cell = row + j;

                    if (x_cell >= 0 && y_cell >= 0 && x_cell < GRID_WIDTH && y_cell < GRID_HEIGHT) {
                        const currentNeighbor = grid[x_cell][y_cell];
                        numNeighbors += currentNeighbor;
                    }
                }
            }

            if (cell === 1 && numNeighbors < 2) {
                nextGen[col][row] = 0;
            } else if (cell === 1 && numNeighbors > 3) {
                nextGen[col][row] = 0;
            } else if (cell === 0 && numNeighbors === 3) {
                nextGen[col][row] = 1;
            }
        }
    }
    return nextGen;
}

function update() {
    grid = nextGen(grid);
    render(grid);
    animationId = setTimeout(update, speed);
}

function start() {
    if (!animationId) {
        update();
    }
}

function stop() {
    clearTimeout(animationId);
    animationId = null;
}

function reset() {
    grid = buildGrid(GRID_WIDTH, GRID_HEIGHT);
    render(grid);
}

function advanceSteps() {
    const steps = parseInt(document.getElementById('stepInput').value) || 1;
    advanceStepByStep(steps);
}

function advanceStepByStep(steps) {
    if (steps > 0) {
        grid = nextGen(grid);
        render(grid);
        setTimeout(() => advanceStepByStep(steps - 1), 100);
    }
}

function toggleCellState(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - offsetX;
    const y = event.clientY - rect.top - offsetY;
    const col = Math.floor(x / resolution);
    const row = Math.floor(y / resolution);
    if (col >= 0 && col < GRID_WIDTH && row >= 0 && row < GRID_HEIGHT) {
        grid[col][row] = grid[col][row] ? 0 : 1;
        clickSound.play();
        render(grid);
    }
}
