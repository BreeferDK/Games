function bird(){
  this.y=height/2
  this.x=64;
  
  this.gravity = 0.4;
  this.lift =-15;
  this.velocity = 0;
  
  this.show = function() {
    image(imgBird, this.x, this.y, 60, 48);
  }
  
  this.up=function(){
    this.velocity += this.lift;
    this.velocity*=0.9;
    soundFlap.play()
  }
  
  this.update = function(){
    this.velocity+= this.gravity;
    
    this.y+= this.velocity;
  
    if(this.y > height){
      this.y = height;
      this.velocity=0;
      endGame()
    }
  
    if(this.y < 0){
      this.y = 0;
      this.velocity=0;
    }
  }
  
  
}