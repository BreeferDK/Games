const DIMENSIONS = { width: 540, height: 960 };

const WIDTH = 7; // how many cells can fit
const STARTING_WIDTH = 3; // base cell count

/* highest stack */
const MID_HEIGHT = Math.floor(
  DIMENSIONS.height / (DIMENSIONS.width / WIDTH) / 2
);

var grid = []; // the stack

var score = 0;
var gameTime = 30000;

var gameOver = false;
var playing= false;

let imgLogo;
let imgBG;
let SoundStack;
let soundGameOver;

function preload() {
  imgLogo = loadImage("res/img/logo_clean.png");
  imgBG = loadImage("res/img/Background.jpg")
  soundStack = loadSound("res/snd/drop.mp3");
  soundGameOver = loadSound("res/snd/game-over.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  /* intialize values */
  initializeGrid();


  frameRate(5); // speed of the game
  textAlign(CENTER);
  textSize(50);
}

function draw() {
  background(215);  
  image(imgBG, 0, 0, windowHeight)

  handleGrid();

  drawScore();
  drawStartGame();
  drawGameOver();
}

function touchStarted () {
  if (!fullscreen()) {
    fullscreen(true);
  }
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.ontouchmove = function(event) {
    event.preventDefault();
};


/**
 * handles user input
 */
function keyPressed() {
  if (key == " "){
    if(!playing && !gameOver){
      startGame();
    }
    playGame();
  }
}
function mousePressed() {
  if(!playing && !gameOver){
      startGame();
    }
  playGame();
}

function playGame() {
  if(playing){
    if (!gameOver) {
      soundStack.play();
    }

    var y = grid.length - 1; // height of the stack
    var cellCount = grid[y].stop(grid[y - 1]); // how many cells are still stackable

    if (cellCount < 1) {
      // no more stackable cells

      endGame();
      return;
    }

    frameRate(5 + score); // increase difficulty

    if (++y > MID_HEIGHT) {
      // too high to see new stacks

      for (var i = 0; i < y; i++) {
        // translate stack down

        grid[i].y--;
      }
    }

    score = y;

    grid.push(new Row(y > MID_HEIGHT ? MID_HEIGHT : y, cellCount)); // push new Row
  }
}



/**
 * updates & draws Rows
 */
function handleGrid() {
  var size = windowWidth / WIDTH; // size of each cell

  fill("#eb6608");
  stroke(255);
  strokeWeight(3);

  for (var y = 0; y < grid.length; y++) {
    // loop through Rows

    if (grid[y].dynamic) {
      // only update if the Row is in focus

      grid[y].update();
    }

    grid[y].draw(size);
  }
}



/**
 * draws the score
 */
function drawScore() {
  noStroke();
  fill("#eb6608");
  text(score * 100, windowWidth / 2, 70);
}

function drawStartGame(){
  if (!playing && !gameOver) {
    noStroke();
    fill("#eb6608");
    textSize(40);
    text("tryk for at starte!", windowWidth / 2, windowHeight / 2);
  }
}  


/**
 * start the game
 */
function startGame() {  
  setTimeout(endGame, gameTime)
  playing = true;
  gameOver = false;
}


/**
 * ends the game
 */
function endGame() {
  noLoop();
  soundGameOver.play();
  playing=false;
  gameOver = true;
}

/**
 * draws game over message
 */
function drawGameOver() {
  if (gameOver) {
    noStroke();
    fill("#eb6608");
    textSize(40);
    text("Game Over!", windowWidth / 2, windowHeight / 3 + 50);
    textSize(50);
    let finalScore = score * 100;
    document.getElementById("finalScore").innerText = finalScore;
    document.getElementById("GameOver").innerText = GameOver;
  }
}

/**
 * resets the grid
 */
function initializeGrid() {
  grid = [];

  grid.push(new Row(0, STARTING_WIDTH));
}
