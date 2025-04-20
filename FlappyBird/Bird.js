class Bird {
  constructor() {
    this.y = height/2;
    this.x = width/4;
    this.gravity = 0.5;
    this.velocity = 0;
    this.lift = -10;
    this.size = windowWidth * 0.04;
  }
  
  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
    
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
  
  show() {
    image(imgBird, this.x, this.y, 60, 48);
  }
  
  flap() {
    this.velocity += this.lift;
    soundFlap.play()

  }
} 