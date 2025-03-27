let gameState = 'INTRO';
let score = 0;
let timer = 30;
let lastTime = 0;
let blocks = [];
let currentBlock;
let blockSpeed = 5;
let blockSize;

const DIMENSIONS = { width: 540, height: 960 };

const WIDTH = 7; // how many cells can fit
const STARTING_WIDTH = 3; // base cell count

/* highest stack */
const MID_HEIGHT = Math.floor(DIMENSIONS.height / (DIMENSIONS.width / WIDTH) / 2);

var grid = []; // the stack

function preload() {
    imgLogo = loadImage('res/img/logo.png');
    soundStack = loadSound('res/snd/drop.mp3');
    soundGameOver = loadSound('res/snd/game-over.mp3');
    imgBG = loadImage("res/img/Background.jpg")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
   /* initialize values */
   initializeGrid();

   frameRate(5); // speed of the game
   textAlign(CENTER);
   textSize(50);
}

function draw() {
  background(50);
  imageMode(CORNER);
  image(imgBG, 0, 0, width, height, 0, 0, imgBG.height, COVER);
  
  switch(gameState) {
    case 'INTRO':
      drawIntro();
      break;
    case 'GAMEPLAY':
      drawGameplay();
      break;
    case 'GAMEOVER':
      drawGameover();
      break;
  }
}

function drawIntro() {
  textAlign(CENTER);
  fill('#eb6608');
  
  textSize(min(width, height) * 0.05);
  text('Tryk start og se hvor højt\net tårn du kan bygge\npå et halvt minut', width/2, height/2);
}

function drawGameplay() {
  if (millis() - lastTime >= 1000) {
    timer--;
    lastTime = millis();
  }

  handleGrid();
  
  // Score display
  fill('#eb6608');
  textSize(min(width, height) * 0.05);
  text('Score: ' + score, width/2, height * 0.1);
  
  // Timer display
  text('Tid: ' + timer, width/2, height * 0.9);
  

  if (timer <= 0) {
    gameState = 'GAMEOVER';
  }
}

function handleGrid() {

    var size = width / WIDTH; // size of each cell
  
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

function initializeGrid() {

  grid = [];
  
  grid.push(new Row(0, STARTING_WIDTH));
}

function drawGameover() {
  fill('#eb6608');
  textSize(min(width, height) * 0.1);
  text('GAME OVER', width/2, height/3);
  textSize(min(width, height) * 0.05);
  text('Final Score: ' + score, width/2, height/2);

  noLoop();
  soundGameOver.play();
  // Send score to parent React component
  window.parent.postMessage({ score }, "*");
  
}

function touchStarted() {
  handleInteraction();
  return false;
}

function mousePressed() {
  handleInteraction();
}

function handleInteraction() {
  if (gameState === 'INTRO') {
    gameState = 'GAMEPLAY';
    lastTime = millis();
    blocks = [];
    score = 0;
    timer = 30;
  } else if (gameState === 'GAMEPLAY') {
      soundStack.play()
        
      var y = grid.length - 1; // height of the stack
      var cellCount = grid[y].stop(grid[y - 1]); // how many cells are still stackable
    
      if (cellCount < 1) {
            // no more stackable cells
    
        gameState = 'GAMEOVER'
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
    
      grid.push(new Row((y > MID_HEIGHT) ? MID_HEIGHT : y, cellCount)); // push new Row
  } else if (gameState === 'GAMEOVER') {

  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  blockSize = min(width, height) * 0.1;
} 