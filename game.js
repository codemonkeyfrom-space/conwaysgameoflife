let cellSize;
let patternName;
let rows;
let cols;
let grid;
let generation;
let startTime;
let genStart;
let requestId;
let going = false;
let delay = 100;

let delayValues = [0, 250, 500, 750, 1000, 1500, 2000, 3000, 5000];

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const ddSize = document.getElementById("ddSize");
const bnGo = document.getElementById("bnGo");
const bnStep = document.getElementById("bnStep");
const lbGeneration = document.getElementById("lbGeneration");
const ddPattern = document.getElementById("ddPattern");
const rnDelay = document.getElementById("rnDelay");
const lbDelay = document.getElementById("lbDelay");


ddSize.addEventListener("change", () => {
    init();
});

bnStep.addEventListener("click", () => {
    requestId = requestAnimationFrame(step);
});

ddPattern.addEventListener("change", () => {
    init();
});

rnDelay.addEventListener("change", () => {
    setSpeed();
    drawGrid();
});

bnGo.addEventListener("click", () => {
    if (!going) {
        start();
    } else {
        stop();
    }
});

function setSpeed() {
    delay = parseInt(delayValues[rnDelay.value]);
    lbDelay.textContent = delay;
}

function createGrid() {
    let desiredPattern = ddPattern.value;
    let emptyPattern = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

    if (desiredPattern === "random") {
        console.log("pattern: random");
        return new Array(rows).fill(null).map(() => new Array(cols).fill(0).map(() => Math.random() > 0.8 ? 1 : 0));
    }

    if (desiredPattern === "glider") {
        console.log("pattern: glider");
        let gliderPattern = emptyPattern;
        let midRow = Math.floor(rows/2);
        let midCol = Math.floor(cols/2);
        gliderPattern[midRow][midCol] = 1;
        gliderPattern[midRow + 1][midCol + 1] = 1;
        gliderPattern[midRow + 2][midCol - 1] = 1;
        gliderPattern[midRow + 2][midCol] = 1;
        gliderPattern[midRow + 2][midCol+ 1] = 1;
        return gliderPattern;
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
    console.log("getNextGeneration");
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
    timeStamp = Math.floor(timestamp);
    if (genStart === undefined) {
        genStart = timestamp;
    }

    elapsed = timestamp - genStart;

    if (going && (elapsed > delay)) {
        step();
        genStart = timestamp;
    }
    requestId = requestAnimationFrame(update);
}

function step() {
    if (generation === undefined){
        generation = 1;
    } else {
        generation += 1;
    }
    lbGeneration.textContent = "Generation: " + generation;
    grid = getNextGeneration(grid);
    drawGrid();
}

function init() {
    stop();
    cellSize = parseFloat(ddSize.value);
    rows = Math.floor(canvas.height / cellSize);
    cols = Math.floor(canvas.width / cellSize);
    patternName = ddPattern.value;
    setSpeed();
    grid = createGrid();
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

init();