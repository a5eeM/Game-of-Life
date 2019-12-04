// declare global variables
const rows = 40;
const columns = 96;
const reproductionTime = 100;
let playing = false;
let timer;

// define grids
let grid = new Array(rows);
let nextGrid = new Array(rows);

// initialize - function called after DOM loads
function initialize() {
    createTable();
    initializeGrid();
    resetGrid();
    controlButtonSetUp();
}

// function initializeGrid to Initialize the cell grid
function initializeGrid() {
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(columns);
        nextGrid[i] = new Array(columns);
    }
}

// function resetGrid to reset the grids to "dead" state
function resetGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            // set the grid values to 0
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

// function copyAndResetGrid to copy the nextGrid to grid and reset nextGrid to "dead" state
function copyAndResetGrid() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}


// function createTable to create the grid layout dynamically
function createTable() {
    let cellContainer = document.getElementById("cellContainer");
    if (!cellContainer) {
        // throw no div found error
        console.error("Error: no div found for the cell table!");
    }

    // create table dynamically which will hold tr and td elements
    let table = document.createElement("table")

    for (let i = 0; i < rows; i++) {
        // create tr element
        let tr = document.createElement("tr");
        for (let j = 0; j < columns; j++) {
            // create td element and set its attributes
            let cell = document.createElement("td");
            cell.setAttribute("id", i + "_" + j);
            cell.setAttribute("class", "dead");
            // assign a click handler
            cell.onclick = cellClickHandler;
            // append the created td elemet to tr
            tr.appendChild(cell);
        }
        // append the tr element to table
        table.appendChild(tr);
    }
    // append the created table cells to cell container
    cellContainer.appendChild(table);
}

// function cellClickHandler for each cell's onClickHandler definiton
function cellClickHandler(e) {
    // split the cell id to get individual
    // rows and columns and store them
    let rowcolumn = this.id.split("_");
    let row = rowcolumn[0];
    let col = rowcolumn[1];

    let classes = this.getAttribute("class");
    if (classes.indexOf("live") > -1) {
        this.setAttribute("class", "dead");
        grid[row][col] = 0;
    } else {
        this.setAttribute("class", "live");
        grid[row][col] = 1;
    }
    /*
    let cell = e.target;
    let className = cell.class; // this doesn't work, cell.getAttribute("class") does
    console.log(cell.id); // this works
    console.log(cell.class); // this doesn't, why?
    if(className === "dead"){
        cell.class = "live"; // doesn't work, cell.setAttribute("class", "live") does
    } else {
        cell.class = "dead"; // cell.setAttribute("class", "dead") works
    }
    */
}

// function update view to update the view according to grid value
function updateView() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            let cell = document.getElementById(i + "_" + j);
            if (grid[i][j] == 0) {
                cell.setAttribute("class", "dead");
            } else {
                cell.setAttribute("class", "live");
            }
        }
    }
}

// funtion controlButtonSetUp to setup the controls
function controlButtonSetUp() {
    // There are three buttons and hence three event handlers we need to configure.
    // runButton handler
    // Can't use fat arrow function in the first case because 'this' in an arrow
    // function is a window defined in the global context. Using addEventListener
    // which defines a function expression which allows to change 'this' depending 
    // on the target element.
    
    let runButton = document.getElementById("run");
    runButton.addEventListener('click', function() {
        if (playing) {
            console.log("Pause");
            playing = false;
            this.innerHTML = "Continue";
            clearTimeout(timer);
        } else {
            console.log("Continue");
            playing = true;
            this.innerHTML = "Pause"
            play();
        }
    })

    // resetButton - using the fat arrow function as the onclick handler
    let resetButton = document.getElementById("reset");
    resetButton.onclick = () => {
        console.log("Clear the grid!");

    playing = false;
    let runButton = document.getElementById("run");
    runButton.innerHTML = "Run";
    clearTimeout(timer);

    let cellsList = document.getElementsByClassName("live");
    let cells = [];
    for (let i = 0; i < cellsList.length; i++) {
        cells.push(cellsList[i]);
    }
    // set the cell class to dead
    for (let i = 0; i < cells.length; i++) {
        cells[i].setAttribute("class", "dead");
    }

    resetGrid();
    }

    // randomConfigurationGenerator handler - using the fat arrow function as the onclick handler
    let randomButton = document.getElementById("random");
    randomButton.onclick = () => {
        if (playing) {
            return;
        }
        
        // clear and reset the grid
        resetButtonHandler();
    
        // populate the grid randomly
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                let isLive = Math.round(Math.random());
                if (isLive == 1) {
                    let cell = document.getElementById(i + "_" + j);
                    // marks live cells randomly and dynamically
                    cell.setAttribute("class", "live");
                    grid[i][j] = 1;
                }
            }
        }
    }
}

// resetButtonHandler definition required for random configuration handler
function resetButtonHandler() {
    console.log("Clear the grid!");

    playing = false;
    let runButton = document.getElementById("run");
    runButton.innerHTML = "Run";
    clearTimeout(timer);

    let cellsList = document.getElementsByClassName("live");
    let cells = [];
    for (let i = 0; i < cellsList.length; i++) {
        cells.push(cellsList[i]);
    }
    // set the cell class to dead
    for (let i = 0; i < cells.length; i++) {
        cells[i].setAttribute("class", "dead");
    }

    resetGrid();
}

// play
function play() {
    console.log("Play");
    computeNextGen();

    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

// compute the next generation
function computeNextGen() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            applyRules(i, j);
        }
    }

    copyAndResetGrid();
    updateView();
}

// function applyRules applies John Conway's rules for Game of Life
// RULES
// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
// Any live cell with two or three live neighbours lives on to the next generation.
// Any live cell with more than three live neighbours dies, as if by overcrowding.
// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
function applyRules(row, col) {
    let numNeighbors = countNeighbors(row, col);
    if (grid[row][col] == 1) {
        if (numNeighbors < 2) {
            nextGrid[row][col] = 0;
        } else if (numNeighbors == 2 || numNeighbors == 3) {
            nextGrid[row][col] = 1;
        } else if (numNeighbors > 3) {
            nextGrid[row][col] = 0;
        } 
    } else if (grid[row][col] == 0) {
        if (numNeighbors == 3) {
            nextGrid[row][col] = 1;
        }
    }
}

// function countingNeighbors count the immediate neighbors of a cell
function countNeighbors(row, col) {
    let count = 0;

    // check for upper row
    if (row-1 >= 0) {
        // neighbors on top
        if (grid[row-1][col] == 1) {
            count++;
        }
    }

    // check for upper row with left column
    if (row-1 >= 0 && col-1 >= 0) {
        // neighbor on left
        if (grid[row-1][col-1] == 1) {
            count++;
        }
    }

    // check for upper row with right column
    if (row-1 >= 0 && col+1 < columns) {
        // neighbor on top right
        if (grid[row-1][col+1] == 1) {
            count++;
        }
    }

    // check if left column exists
    if (col-1 >= 0) {
        // neighbor on immediate left
        if (grid[row][col-1] == 1) {
            count++;
        }
    }

    if (col+1 < columns) {
        // neighbor on immediate right
        if (grid[row][col+1] == 1) {
            count++;
        }
    }

    // check if bottom row exists
    if (row+1 < rows) {
        // neighbor directly below
        if (grid[row+1][col] == 1) {
            count++;
        }
    }

    // check if bottom row with left column exists
    if (row+1 < rows && col-1 >= 0) {
        // neighbor on bottom left
        if (grid[row+1][col-1] == 1) {
            count++;
        }
    }

    // check if bottom row with right column exists
    if (row+1 < rows && col+1 < columns) {
        // neighbor on bottom right side
        if(grid[row+1][col+1] == 1) {
            count++;
        }
    }

    // return count
    return count;
}

// start everything
window.onload = initialize;
