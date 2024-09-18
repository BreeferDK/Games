var scoreMultiplier = 10;
var score = 0;
var gameTime = 30000;

var gameState = 0; /* 0=Game not started, 1= Playing =9 GameOver */


let imgBird;
let imgBG;
let Soundflap;
let soundGameOver;

var bird;
var pipes=[]

function preload() {
  imgBird = loadImage("res/img/flappybird.png");
  imgBG = loadImage("res/img/flappybirdbg.png")
  soundFlap = loadSound("res/snd/wing-flap.mp3");
  soundGameOver = loadSound("res/snd/game-over.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER);
  textSize(50);
  
  bird= new bird();
  pipes.push(new pipe())
}

function draw() {
  background(215);  
  image(imgBG, 0, 0, width, height, 0, 0, imgBG.height, COVER);

  drawScore();
  
  bird.show();
  
  if(gameState === 0){
    drawStartScreen();
  }
  
  if(gameState === 1){
    drawGame();
  }
  
  
  if(gameState===9){
    drawGameOver();
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
    handleControls();
  }
}
function mousePressed() {
  
  handleControls();
}

function touchStarted() {
    if (!fullscreen()) {
      fullscreen(true);
    }
    if (!playing && !gameOver){
      startGame();
    }
  playGame();
}

function handleControls(){
  if(gameState===0){
      startGame();
  }
  if(gameState===1){
      gameInput();
  }
  if(gameState===9){
      
  }
}

function drawGame(){
  
   for (var i = pipes.length-1; i >=0; i--){
    pipes[i].show()
    pipes[i].update()
     
    if (pipes[i].hits(bird)){
      endGame()
    } 
     
    if (pipes[i].passed(bird)) {
      if(pipes[i].counted==false){
        pipes[i].counted=true
        score += 1;
        
      }
    }
    
    if (pipes[i].offscreen()){
      pipes.splice(i,1)
    }
  }
  
  bird.update();
  bird.show();
  
  if(frameCount %90 ==0){
    pipes.push(new pipe())
  }
  
 
  
}

function gameInput() {
      bird.up();
  

}

/**
 * start the game
 */
function startGame() {  
  setTimeout(endGame, gameTime)
  gameState=1;
}

function endGame(){
  if(gameState!=9){
  noLoop();
  soundGameOver.play();
  gameState=9;
  }    
}

/**
 * draws game over message
 */
function drawGameOver() {

    noStroke();
    fill("#eb6608");
    stroke(0)
    text("Game Over!", windowWidth / 2, windowHeight / 3 + 50);
    
    score *= scoreMultiplier
  
    console.log(score)
    // Send score to parent React component
    window.parent.postMessage({ score }, "*");
}

/**
 * draws the score
 */
function drawScore() {
  noStroke();
  fill("#eb6608");
  stroke(0)
  text(score, windowWidth / 2, 70);
}

function drawStartScreen(){
  {
    noStroke();
    fill("#eb6608");
    stroke(0)
    textSize(40);
    text("tryk for at starte!", windowWidth / 2, windowHeight / 2);
  }
}  
