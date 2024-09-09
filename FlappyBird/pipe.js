function pipe(){
  this.top=random(height/1.5);
  this.bottom = random(height/2)
  this.x = width;
  this.pipeWidth = 35
  this.speed=4
  this.counted=false
  
  this.show = function(){
    fill("#eb6608");
    rect(this.x, 0, this.pipeWidth, this.top)
    rect(this.x, height-this.bottom, this.pipeWidth, this.bottom)
  }
  
  this.offscreen = function(){
    if(this.x < -this.pipeWidth){
      return true
    }
    else return false
  }
  
  this.hits = function(bird){
    if(bird.y < this.top || bird.y > height - this.bottom){
      if(bird.x > this.x && bird.x < this.x +this.pipeWidth){
        return true
      }
    }
  }
  
  this.passed = function(bird){
    if(bird.x > this.x + this.pipeWidth && this.counted == false){
        return true
    }
  }
  
  this.update = function(){
    this.x -= this.speed
  }
  
}