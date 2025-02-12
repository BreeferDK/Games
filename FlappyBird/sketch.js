let bird;
let pipes = [];
let gameState = 'INTRO';
let score = 0;
let timer = 30;
let lastTime = 0;

function preload() {
    imgBird = loadImage("res/img/Flappy2.png");
    imgBG = loadImage("res/img/flappybirdbg.png");
    soundFlap = loadSound("res/snd/wing-flap.mp3");
    soundGameOver = loadSound("res/snd/game-over.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bird = new Bird();
  pipes.push(new Pipe());
  
}

function draw() {
  background(135, 206, 235);
  
  switch(gameState) {
    case 'INTRO':
      showIntro();
      break;
    case 'GAMEPLAY':
      updateGame();
      break;
    case 'GAMEOVER':
      showGameOver();
      break;
  }
}

function showIntro() {
  textAlign(CENTER);
  textSize(windowWidth * 0.08);
  fill('#eb6608');
  text('FLAPPY BIRD', width/2, height/3);
  
  textSize(windowWidth * 0.03);
  text('Tryk for at flyve\nPrøv at overleve i 30 sec!', width/2, height/2);
  
  textSize(windowWidth * 0.02);
  text('Tryk for at starte', width/2, height * 0.7);
}

function updateGame() {
  // Timer logic
  if (millis() - lastTime >= 1000) {
    timer--;
    lastTime = millis();
  }
  
  if (timer <= 0) {
    gameState = 'GAMEOVER';
    return;
  }
  
  // Game logic
  bird.update();
  bird.show();
  
  if (frameCount % 90 == 0) {
    pipes.push(new Pipe());
  }
  
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].show();
    pipes[i].update();
    
    if (pipes[i].hits(bird)) {
      gameState = 'GAMEOVER';
    }
    
    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
      score++;
    }
  }
  
  // Show timer and score
  textSize(windowWidth * 0.03);
  fill('#eb6608');
  text(`Score: ${score}`, width/2, 50);
  text(`Time: ${timer}`, width/2, height - 30);
}

function showGameOver() {
  textAlign(CENTER);
  textSize(windowWidth * 0.08);
  fill('#eb6608');
  text('GAME OVER', width/2, height/3);
  
  textSize(windowWidth * 0.04);
  text(`Final Score: ${score}`, width/2, height/2);
  
  noLoop();
  soundGameOver.play();
  // Send score to parent React component
  window.parent.postMessage({ score }, "*");
}

function mousePressed() {
  if (gameState === 'INTRO') {
    gameState = 'GAMEPLAY';
    resetGame();
  } else if (gameState === 'GAMEPLAY') {
    bird.flap();
  } else if (gameState === 'GAMEOVER') {
    
  }
}

function keyPressed() {
  if (key === ' ') {
    if (gameState === 'GAMEPLAY') {
      bird.flap();
    }
  }
}

function resetGame() {
  bird = new Bird();
  pipes = [];
  score = 0;
  timer = 30;
  lastTime = millis();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  if (gameState === 'INTRO') {
    gameState = 'GAMEPLAY';
    resetGame();
    bird.flap();
  } else if (gameState === 'GAMEPLAY') {
    bird.flap();
  }
  return false;
} 