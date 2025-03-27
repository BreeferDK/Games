let gameState = 'INTRO';
let score = 0;
let timeLeft = 30;
let lastTime = 0;
let holes = [];
let currentMole = -1;
let moleTimer = 0;
let moleShowDuration = 1000;
let initialMoleShowDuration = 1000;
let minMoleShowDuration = 400;  // Fastest speed possible
let speedIncrement = 50;        // How much faster it gets per hit
let missTimeout = 3000;  // 3 seconds
let lastHitTime = 0;
let speedDecrement = 25; // Slower speed decrease than increase

function preload() {
    imgBreefer = loadImage('res/img/breefers/Breefer001.png');
    imgBG = loadImage('res/img/Background.jpg');
    soundClick = loadSound('res/snd/Shovel_Whack.mp3');
    soundGameOver = loadSound('res/snd/game-over.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  setupHoles();
}

function setupHoles() {
  const rows = 3;
  const cols = 3;
  const spacing = min(width, height) / 4;
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = width/2 + (j - 1) * spacing;
      let y = height/2 + (i - 1) * spacing;
      holes.push({
        x: x,
        y: y,
        radius: spacing/3,
        hasMole: false
      });
    }
  }
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
  text('Tryk start og se hvor tit\ndu kan slå figuren i hovedet\npå et halv minut', width/2, height/2);
}

function drawGameplay() {
  // Update timer
  if (millis() - lastTime >= 1000) {
    timeLeft--;
    lastTime = millis();
    if (timeLeft <= 0) {
      gameState = 'GAMEOVER';
    }
  }
  
  // Check for missed moles and slow down
  if (millis() - lastHitTime > missTimeout) {
    moleShowDuration = min(initialMoleShowDuration, moleShowDuration + speedDecrement);
    lastHitTime = millis(); // Reset timer to prevent continuous slowdown
  }
  
  // Update mole position
  if (millis() - moleTimer >= moleShowDuration) {
    currentMole = int(random(holes.length));
    moleTimer = millis();
    holes.forEach(hole => hole.hasMole = false);
    holes[currentMole].hasMole = true;
  }
  
  // Draw holes and moles
  holes.forEach(hole => {
    // Draw hole
    fill(100);
    ellipse(hole.x, hole.y, hole.radius * 2);
    
    // Draw Breefer instead of mole
    if (hole.hasMole) {
      imageMode(CENTER);
      let breeferSize = hole.radius * 3;
      image(imgBreefer, 
            hole.x, 
            hole.y - hole.radius/2, 
            breeferSize, 
            breeferSize);
    }
  });
  
  // Draw score and timer
  fill('#eb6608');
  textSize(min(width, height) / 20);
  text('Score: ' + score, width/2, height/10);
  text('Time: ' + timeLeft, width/2, height * 0.9);
}

function drawGameover() {
    textSize(min(width, height) * 0.08);
    fill("#eb6608");
    text('GAME OVER', width/2, height/3);
    
    textSize(min(width, height) * 0.05);
    text('Score: ' + score, width/2, height/2);
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
    score = 0;
    timeLeft = 30;
    lastTime = millis();
    lastHitTime = millis();  // Initialize hit timer
    moleShowDuration = initialMoleShowDuration;
  } else if (gameState === 'GAMEPLAY') {
    checkMoleHit(mouseX, mouseY);
  } else if (gameState === 'GAMEOVER') {

  }
}

function checkMoleHit(x, y) {
  holes.forEach((hole, index) => {
    let d = dist(x, y, hole.x, hole.y);
    if (d < hole.radius && hole.hasMole) {
      score += 1;
      hole.hasMole = false;
      currentMole = -1;
      moleTimer = millis();
      lastHitTime = millis();  // Reset miss timer on successful hit
      soundClick.play();
      
      // Speed up the game
      moleShowDuration = max(minMoleShowDuration, moleShowDuration - speedIncrement);
    }
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  holes = [];
  setupHoles();
} 