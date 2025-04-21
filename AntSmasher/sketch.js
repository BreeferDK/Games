let gameState = 'intro';
let score = 0;
let timer = 30;
let lastTime = 0;
let bugs = [];

function preload() {
    imgBugSlow = loadImage("res/img/Breefer_04.png");
    imgBugFast = loadImage("res/img/Lille_01.png");
    soundGameOver = loadSound("res/snd/game-over.mp3", () => {
      soundGameOver.setVolume(0.5);
    });
    soundClick = loadSound("res/snd/click.mp3", () => {
        soundClick.setVolume(0.5);
      });
    imgBG = loadImage("res/img/Background.jpg")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  
  bugs = [];
  // Ensure at least 2 fast bugs
  for (let i = 0; i < 2; i++) {
    let bug = new Bug();
    bug.isFast = true;
    bugs.push(bug);
  }
  // Add remaining regular bugs
  for (let i = 0; i < 3; i++) {
    bugs.push(new Bug());
  }
}

function draw() {
  background(50);
  imageMode(CORNER);
  image(imgBG, 0, 0, width, height, 0, 0, imgBG.height, COVER);
  frameRate(40);
  
  switch (gameState) {
    case 'intro':
      drawIntro();
      break;
    case 'gameplay':
      drawGameplay();
      break;
    case 'gameover':
      drawGameover();
      break;
  }
}

function drawIntro() {
  textAlign(CENTER);
  fill('#eb6608');
  
  textSize(min(width, height) * 0.05);
  text('Tryk på skærmen og se hvor\nmange insekter du kan\nsmadre på et halv minut\n', width/2, height/2);
}

function drawGameplay() {
  // Timer
  if (frameCount - lastTime > 60) {
    timer--;
    lastTime = frameCount;
  }
  
  if (timer <= 0) {
    gameState = 'gameover';
    return;
  }

  // Score
  fill('#eb6608');
  textSize(width * 0.05);
  text(score, width/2, height * 0.1);
  
  // Timer display
  text("Tid: " + timer, width/2, height * 0.9);
  
  // Update and display bugs
  for (let bug of bugs) {
    bug.update();
    bug.display();
  }
}

function drawGameover() {
  fill('#eb6608');
  textSize(width * 0.08);
  text('Game Over!', width/2, height/3);
  textSize(width * 0.05);
  text('Final Score: ' + score, width/2, height/2);
  
  noLoop();
  soundGameOver.play();
  // Send score to parent React component
  window.parent.postMessage({ score }, "*");
}

class Bug {
  constructor() {
    this.isFast = random() < 0.07;
    this.reset();
  }
  
  reset() {
    let side = floor(random(4));
    
    switch(side) {
      case 0: // top
        this.x = random(width);
        this.y = -20;
        this.angle = random(PI/4, 3*PI/4);
        break;
      case 1: // right
        this.x = width + 20;
        this.y = random(height);
        this.angle = random(3*PI/4, 5*PI/4);
        break;
      case 2: // bottom
        this.x = random(width);
        this.y = height + 20;
        this.angle = random(5*PI/4, 7*PI/4);
        break;
      case 3: // left
        this.x = -20;
        this.y = random(height);
        this.angle = random(-PI/4, PI/4);
        break;
    }
    
    // Make fast bugs noticeably faster
    this.baseSpeed = random(2, 5);
    this.speed = this.isFast ? this.baseSpeed * 2.2 : this.baseSpeed;
    
    // Keep isFast status when resetting
    let wasFast = this.isFast;
    this.isFast = wasFast;
  }
  
  update() {
    this.x += cos(this.angle) * this.speed;
    this.y += sin(this.angle) * this.speed;
    
    // Reset if bug is far outside the screen
    if (this.x < -50 || this.x > width + 50 || 
        this.y < -50 || this.y > height + 50) {
      this.reset();
    }
  }
  
  display() {
    // Center the image on the bug's position
    imageMode(CENTER);
    this.isFast ? 
      image(imgBugFast, this.x, this.y, 75, 60) : 
      image(imgBugSlow, this.x, this.y, 75, 60);
  }
  
  hits(px, py) {
    // Increase hit area to match image size
    let hitSize = 50; // Adjust this value based on your needs
    return dist(px, py, this.x, this.y) < hitSize;
  }
}

function touchStarted() {
    handleInteraction();
    return false;
  }
  
  function mousePressed() {
    handleInteraction();
  }

function handleInteraction() {
  if (gameState === 'intro') {
    gameState = 'gameplay';
    score = 0;
    timer = 30;
    lastTime = frameCount;
  } else if (gameState === 'gameplay') {
    for (let bug of bugs) {
      if (bug.hits(mouseX, mouseY)) {
        soundClick.play();
        score += bug.isFast ? 3 : 1;
        bug.reset();
      }
    }
  } else if (gameState === 'gameover') {
    loop();
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 