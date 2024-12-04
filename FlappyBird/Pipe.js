class Pipe {
  constructor() {
    this.spacing = windowHeight * 0.3;
    this.top = random(height/6, (3/4) * height);
    this.bottom = this.top + this.spacing;
    this.x = width;
    this.w = windowWidth * 0.1;
    this.speed = 6;
  }
  
  show() {
    fill('#eb6608');
    rect(this.x, 0, this.w, this.top);
    rect(this.x, this.bottom, this.w, height);
  }
  
  update() {
    this.x -= this.speed;
  }
  
  offscreen() {
    return this.x < -this.w;
  }
  
  hits(bird) {
    if (bird.y < this.top || bird.y > this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }
} 