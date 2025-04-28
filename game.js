import { rawPatterns } from './patterns.js?v=2';

let cellSize=2;
let rows;
let cols;
let grid;
let generation;
let genStart;
let requestId;
let going = false;
let delay = 100;

let delayValues = [0, 250, 500, 750, 1000, 1500, 2000];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const bnGo = document.getElementById("bnGo");
const bnStep = document.getElementById("bnStep");
const lbGeneration = document.getElementById("lbGeneration");
const ddPattern = document.getElementById("ddPattern");
const rnDelay = document.getElementById("rnDelay");
const lbDelay = document.getElementById("lbDelay");

function parsePattern(rawPattern) {
    return rawPattern.trim().split("\n").map(line =>
        [...line.trim()].map(char => (char === 'O' ? 1 : 0))
    );
}

const patterns = {};
for (const [name, patternStr] of Object.entries(rawPatterns)) {
    patterns[name] = parsePattern(patternStr);
}

bnStep.addEventListener("click", () => {
    requestId = requestAnimationFrame(step);
});

ddPattern.addEventListener("change", () => {
    init();
});

rnDelay.addEventListener("change", () => {
    setSpeed();
});

bnGo.addEventListener("click", () => {
    if (!going) {
        start();
    } else {
        stop();
    }
});

canvas.addEventListener("wheel", (e) => {
    cellSize += e.deltaY/100;
    drawGrid();
});

function setSpeed() {
    delay = parseInt(delayValues[rnDelay.value]);
    lbDelay.textContent = delay + " ms";
}

function zeroGrid() {
    grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
}


function createGrid() {
    if (ddPattern.value === "random") {
        grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0).map(() => Math.random() > 0.8 ? 1 : 0));
        return;
    }

    zeroGrid();
    let desiredPattern = patterns[ddPattern.value];
    desiredPattern && applyPatternToGrid(desiredPattern);
}

function applyPatternToGrid(patternArray) {
    const rows = grid.length;
    const cols = grid[0].length;
    const patternRows = patternArray.length;
    const patternCols = patternArray[0].length;
    const startRow = Math.floor((rows - patternRows) / 2);
    const startCol = Math.floor((cols - patternCols) / 2);

    for (let r = 0; r < patternRows; r++) {
        for (let c = 0; c < patternCols; c++) {
            if (patternArray[r][c] === 1) {
                const gridRow = startRow + r;
                const gridCol = startCol + c;
                if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
                    grid[gridRow][gridCol] = 1;
                }
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col]) {
                ctx.fillStyle = "white";
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

function getNextGeneration(grid) {
    const newGrid = grid.map(arr => [...arr]);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let liveNeighbors = 0;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    let x = row + i;
                    let y = col + j;
                    if (x === rows) { x = 0; }
                    if (y === cols) { y = 0; }
                    if (x < 0) { x = rows - 1; }
                    if (y < 0) { y = cols - 1; }
                    liveNeighbors += grid[x][y];
                }
            }
            if (grid[row][col] === 1) {
                if (liveNeighbors < 2 || liveNeighbors > 3) newGrid[row][col] = 0;
            } else {
                if (liveNeighbors === 3) newGrid[row][col] = 1;
            }
        }
    }
    return newGrid;
}

function update(timestamp) {
    timestamp = Math.floor(timestamp);
    if (genStart === undefined) {
        genStart = timestamp;
    }    
    let elapsed = timestamp - genStart;
    if (going && (elapsed > delay)) {
        step();
        genStart = timestamp;
    }
    requestId = requestAnimationFrame(update);
}

function step() {
    if (generation){
        generation += 1;
    } else {
        generation = 1;
    }
    lbGeneration.textContent = generation;
    grid = getNextGeneration(grid);
    drawGrid();
}

function init() {
    stop();
    generation = 0;
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);
    setSpeed();
    createGrid();
    drawGrid();
}

function start() {
    going = true;
    bnGo.textContent = "stop";
    bnStep.disabled = true;
    drawGrid();
    requestId = requestAnimationFrame(update);
}

function stop() {
    cancelAnimationFrame(requestId);
    going = false;
    bnGo.textContent = "go";
    bnStep.disabled = false;
}

Object.keys(rawPatterns).forEach(patternName => {
    const option = document.createElement('option');
    option.value = patternName;
    option.textContent = patternName.charAt(0).toUpperCase() + patternName.slice(1);
    ddPattern.appendChild(option);
});

init();