let gameState = 'INTRO';
let score = 0;
let timeLeft = 30;
let lastTime = 0;
let clickSound;
let circleSize;

function preload() {
  clickSound = loadSound('res/snd/click.mp3'); // Add a click sound file to your project
  gameOverSound = loadSound('res/snd/game-over.mp3');
  imgBreefer = loadImage("res/img/breefers/Breefer_03.png");
  imgBG = loadImage("res/img/Background.jpg")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  circleSize = min(width, height) * 0.2;
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
  text('Tryk på skærmen og se hvor mange\ngange du rammer figuren\npå et halv minut', width/2, height/2);
}

function drawGameover() {
    textSize(min(width, height) * 0.08);
    fill("#eb6608");
    text('GAME OVER', width/2, height/3);
    
    textSize(min(width, height) * 0.05);
    text('Score: ' + score, width/2, height/2);
    noLoop();
    gameOverSound.play();
    // Send score to parent React component
    window.parent.postMessage({ score }, "*");
  }
  

function drawGameplay() {
  if (millis() - lastTime >= 1000) {
    timeLeft--;
    lastTime = millis();
    if (timeLeft <= 0) {
      gameState = 'GAMEOVER';
    }
  }
  
  // Draw timer at bottom
  textSize(min(width, height) * 0.05);
  fill("#eb6608");
  text('Tid tilbage: ' + timeLeft, width/2, height * 0.9);
  
  // Draw score
  text('Score: ' + score, width/2, height/6);
  
  // Draw Breefer
  imageMode(CENTER);
  image(imgBreefer, width/2, height/2, width/3, height/3)
  
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
    score = 0;
    timeLeft = 30;
    lastTime = millis();
  } else if (gameState === 'GAMEPLAY') {
    let d = dist(mouseX, mouseY, width/2, height/2);
    if (d < circleSize/2) {
      score++;
      clickSound.play();
    }
  } else if (gameState === 'GAMEOVER') {
    
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circleSize = min(width, height) * 0.2;
}