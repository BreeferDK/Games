var rows = 3;
var columns = 3;
var currTile;
var otherTile;
var turns = 0;
var correctOrder = [];

var mainImage = new Image();
const BOARD_SIZE = 300;
var tileWidth = BOARD_SIZE / columns;
var tileHeight = BOARD_SIZE / rows;

const GAME_STATES = {
    INTRO: 'intro',
    GAMEPLAY: 'gameplay',
    GAMEOVER: 'gameover'
};

let currentState = GAME_STATES.INTRO;
let timeLeft = 30;
let timerInterval;

const MAX_SCORE = 100;
const TIME_PENALTY = 1;  // Points deducted per second
const MOVE_PENALTY = 1;  // Points deducted per move
const TIME_BONUS = 2;  // Points gained per second remaining
const COMPLETION_BONUS = 20;  // Bonus for completing the puzzle
let currentScore = MAX_SCORE;

let dragImage = null;
let dragOffsetX, dragOffsetY;

window.onload = function() {
    mainImage.src = "./images/logo.png";
    mainImage.onload = function() {
        showIntroState();
    };
}

function showIntroState() {
    currentState = GAME_STATES.INTRO;
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = `
        <div class="intro-screen">
            <p>Tryk start og se om du</p>
            <p>kan samle puslespillet</p>
            <p>på et halv minut<p>
            <button onclick="startGame()" class="start-btn">Start Game</button>
        </div>
    `;
}

function startGame() {
    currentState = GAME_STATES.GAMEPLAY;
    timeLeft = 30;
    turns = 0;
    currentScore = MAX_SCORE;
    
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = `
        <div class="game-layout">
            <div class="score-display">
                Score: <span id="score">${currentScore}</span><br>
                Træk: <span id="turns">0</span>
            </div>
            <div id="board"></div>
            <div id="pieces"></div>
            <div class="timer-display">
                Tid: <span id="timer">30</span>
            </div>
        </div>
    `;

    initializeGame();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        
        // Update score based on time
        currentScore = Math.max(0, currentScore - TIME_PENALTY);
        document.getElementById('score').textContent = currentScore;
        
        if (timeLeft <= 10) {
            document.getElementById('timer').classList.add('low-time');
        }
        
        if (timeLeft <= 0) {
            gameOver(false);
        }
    }, 1000);
}

function gameOver(won) {
    currentState = GAME_STATES.GAMEOVER;
    clearInterval(timerInterval);
    
    // Calculate final score
    const timeBonus = won ? timeLeft * TIME_BONUS : 0;  // 200 points per second remaining
    const completionBonus = won ? COMPLETION_BONUS : 0;  // 5000 points for completion
    const finalScore = Math.max(0, currentScore + timeBonus + completionBonus);
    
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = `
        <div class="gameover-screen">
            <h1>${won ? 'Tillykke!' : 'Game Over!'}</h1>
            <p>${won ? 'Du samlede puslespillet!' : 'Tiden er gået!'}</p>
            <p>Final Score: ${finalScore}</p>
            <p class="score-breakdown">
                Base Score: ${currentScore}<br>
                ${won ? `Time Bonus: ${timeBonus}<br>` : ''}
                ${won ? `Completion Bonus: ${COMPLETION_BONUS}` : ''}
            </p>
            <p>Træk: ${turns}</p>
            <p>Tiid: ${30 - timeLeft} seconds</p>
        </div>
    `;
    let score = finalScore;
    // Send score to parent React component
    window.parent.postMessage({ score }, "*");
}

function initializeGame() {
    // Store correct order of pieces
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            correctOrder.push(r * columns + c);
        }
    }

    // Initialize the board with blank tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("canvas");
            tile.width = tileWidth;
            tile.height = tileHeight;
            tile.draggable = true;

            // Draw blank tile
            let ctx = tile.getContext("2d");
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, tileWidth, tileHeight);

            // Add drag events
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
        }
    }

    // Create shuffled pieces
    let pieces = [];
    for (let i = 0; i < rows * columns; i++) {
        pieces.push(i);
    }
    pieces.sort(() => Math.random() - 0.5);

    // Create image pieces
    for (let i = 0; i < pieces.length; i++) {
        let tile = document.createElement("canvas");
        tile.width = tileWidth;
        tile.height = tileHeight;
        tile.draggable = true;

        let pieceIndex = pieces[i];
        let x = (pieceIndex % columns) * (mainImage.width / columns);
        let y = Math.floor(pieceIndex / columns) * (mainImage.height / rows);

        let ctx = tile.getContext("2d");
        ctx.drawImage(mainImage, 
            x, y, 
            mainImage.width / columns, mainImage.height / rows,
            0, 0,
            tileWidth, tileHeight
        );

        // Add drag events
        tile.addEventListener("dragstart", dragStart);
        tile.addEventListener("dragover", dragOver);
        tile.addEventListener("drop", dragDrop);
        tile.addEventListener("dragend", dragEnd);

        // Position randomly
        tile.style.position = "absolute";
        let pos = getRandomPosition();
        tile.style.left = pos.x + "px";
        tile.style.top = pos.y + "px";

        document.getElementById("pieces").append(tile);
    }

    // Add touch events along with drag events
    for (let tile of document.getElementsByTagName("canvas")) {
        addTouchEvents(tile);
    }
}

function addTouchEvents(tile) {
    tile.addEventListener("touchstart", touchStart, { passive: false });
    tile.addEventListener("touchmove", touchMove, { passive: false });
    tile.addEventListener("touchend", touchEnd, { passive: false });
}

let touchStartX, touchStartY;
let touchedTile = null;

function touchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchedTile = this;
    currTile = this;

    // Create visual feedback for touch dragging
    dragOffsetX = touch.clientX - this.getBoundingClientRect().left;
    dragOffsetY = touch.clientY - this.getBoundingClientRect().top;
    
    dragImage = this.cloneNode(true);
    dragImage.style.position = "fixed";
    dragImage.style.zIndex = "1000";
    dragImage.style.opacity = "0.8";
    dragImage.style.pointerEvents = "none";
    document.body.appendChild(dragImage);
    
    updateDragImagePosition(touch.clientX, touch.clientY);
}

function touchMove(e) {
    e.preventDefault();
    if (!touchedTile) return;
    
    const touch = e.touches[0];
    updateDragImagePosition(touch.clientX, touch.clientY);
    
    const tile = document.elementFromPoint(touch.clientX, touch.clientY);
    if (tile && tile.tagName === 'CANVAS') {
        otherTile = tile;
    }
}

function touchEnd(e) {
    e.preventDefault();
    if (dragImage) {
        dragImage.remove();
        dragImage = null;
    }
    
    if (!touchedTile || !otherTile) {
        touchedTile = null;
        return;
    }

    dragEnd();
    touchedTile = null;
    otherTile = null;
}

// Update CSS for better touch handling
function updateCSS() {
    const style = document.createElement('style');
    style.textContent = `
        canvas {
            touch-action: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
        }
        
        body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
        }
    `;
    document.head.appendChild(style);
}

// Call updateCSS when window loads
window.addEventListener('load', updateCSS);

function dragStart(e) {
    currTile = this;
    // Create visual feedback for dragging
    dragOffsetX = e.clientX - this.getBoundingClientRect().left;
    dragOffsetY = e.clientY - this.getBoundingClientRect().top;
    
    // Create drag image
    dragImage = this.cloneNode(true);
    dragImage.style.position = "fixed";
    dragImage.style.zIndex = "1000";
    dragImage.style.opacity = "0.8";
    dragImage.style.pointerEvents = "none";
    document.body.appendChild(dragImage);
    
    // Position the drag image
    updateDragImagePosition(e.clientX, e.clientY);
}

function updateDragImagePosition(x, y) {
    if (dragImage) {
        dragImage.style.left = (x - dragOffsetX) + "px";
        dragImage.style.top = (y - dragOffsetY) + "px";
    }
}

// Add mousemove listener for drag visual feedback
document.addEventListener('mousemove', (e) => {
    if (currTile && dragImage) {
        updateDragImagePosition(e.clientX, e.clientY);
    }
});

function dragOver(e) {
    e.preventDefault();
}

function dragDrop() {
    otherTile = this;
}

function dragEnd() {
    if (dragImage) {
        dragImage.remove();
        dragImage = null;
    }
    
    if (!currTile || !otherTile) return;
    
    if (currTile.parentElement.id === "board" && otherTile.parentElement.id === "board") {
        // Swap images between board pieces
        let currCtx = currTile.getContext("2d");
        let otherCtx = otherTile.getContext("2d");
        
        let currImg = currCtx.getImageData(0, 0, tileWidth, tileHeight);
        let otherImg = otherCtx.getImageData(0, 0, tileWidth, tileHeight);
        
        currCtx.putImageData(otherImg, 0, 0);
        otherCtx.putImageData(currImg, 0, 0);
        
        turns += 1;
        currentScore = Math.max(0, currentScore - MOVE_PENALTY);
        document.getElementById('score').textContent = currentScore;
        document.getElementById('turns').innerText = turns;
        checkWin();
    }
    else if (currTile.parentElement.id === "pieces" && otherTile.parentElement.id === "board") {
        // Move piece from pieces to board
        let boardTile = otherTile;
        let pieceTile = currTile;

        // Get both images
        let pieceCtx = pieceTile.getContext("2d");
        let boardCtx = boardTile.getContext("2d");
        
        let pieceImg = pieceCtx.getImageData(0, 0, tileWidth, tileHeight);
        let boardImg = boardCtx.getImageData(0, 0, tileWidth, tileHeight);
        
        // Check if board tile has an image (not white/blank)
        let hasImage = false;
        let boardData = boardImg.data;
        for (let i = 0; i < boardData.length; i += 4) {
            if (boardData[i] !== 255 || boardData[i + 1] !== 255 || boardData[i + 2] !== 255) {
                hasImage = true;
                break;
            }
        }

        // If board tile has an image, swap them
        if (hasImage) {
            boardCtx.putImageData(pieceImg, 0, 0);
            pieceCtx.putImageData(boardImg, 0, 0);
        } else {
            // Otherwise, just move the piece and clear the original
            boardCtx.putImageData(pieceImg, 0, 0);
            pieceCtx.clearRect(0, 0, tileWidth, tileHeight);
            // Remove the blank piece
            pieceTile.remove();
        }

        turns += 1;
        currentScore = Math.max(0, currentScore - MOVE_PENALTY);
        document.getElementById('score').textContent = currentScore;
        document.getElementById('turns').innerText = turns;
        checkWin();
    }
}

function getRandomPosition() {
    const padding = 50;
    const maxX = window.innerWidth - tileWidth - padding;
    const maxY = window.innerHeight - tileHeight - padding;
    const boardRect = document.getElementById("board").getBoundingClientRect();
    
    let x, y;
    do {
        x = padding + Math.random() * maxX;
        y = padding + Math.random() * maxY;
    } while (
        x > boardRect.left - tileWidth && x < boardRect.right &&
        y > boardRect.top - tileHeight && y < boardRect.bottom
    );
    
    return { x, y };
}

function checkWin() {
    const boardTiles = document.getElementById("board").getElementsByTagName("canvas");
    let currentOrder = [];

    // Get current arrangement
    for (let i = 0; i < boardTiles.length; i++) {
        const tile = boardTiles[i];
        const imageData = tile.getContext("2d").getImageData(0, 0, tileWidth, tileHeight).data;
        
        // Find which piece this is by comparing with original image
        let pieceFound = false;
        for (let j = 0; j < correctOrder.length; j++) {
            const pieceIndex = correctOrder[j];
            const x = (pieceIndex % columns) * (mainImage.width / columns);
            const y = Math.floor(pieceIndex / columns) * (mainImage.height / rows);
            
            // Create temp canvas to compare
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = tileWidth;
            tempCanvas.height = tileHeight;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(mainImage, 
                x, y, 
                mainImage.width / columns, mainImage.height / rows,
                0, 0,
                tileWidth, tileHeight
            );
            
            const correctImageData = tempCtx.getImageData(0, 0, tileWidth, tileHeight).data;
            
            // Compare the image data
            if (compareImageData(imageData, correctImageData)) {
                currentOrder[i] = pieceIndex;  // Store in correct position
                pieceFound = true;
                break;
            }
        }
        
        if (!pieceFound) {
            return false;
        }
    }

    // Check if the arrangement is correct (all pieces in order)
    for (let i = 0; i < correctOrder.length; i++) {
        if (currentOrder[i] !== correctOrder[i]) {
            return false;
        }
    }

    // If we get here, the puzzle is solved
    gameOver(true);
    return true;
}

// Make the image comparison more reliable
function compareImageData(data1, data2) {
    if (data1.length !== data2.length) return false;
    const tolerance = 20; // Increased tolerance
    const samplingRate = 40; // Check every 40th pixel to improve performance
    
    for (let i = 0; i < data1.length; i += samplingRate) {
        const r1 = data1[i];
        const g1 = data1[i + 1];
        const b1 = data1[i + 2];
        
        const r2 = data2[i];
        const g2 = data2[i + 1];
        const b2 = data2[i + 2];
        
        const colorDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        if (colorDiff > tolerance * 3) {
            return false;
        }
    }
    return true;
}
