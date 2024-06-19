/* eslint-disable default-case */
// Normal Mode
const pauseButton=document.querySelector('.pause');
const resumeButton=document.querySelector('.resume');
const restartButton=document.querySelector('.restart');
const leaderboard=document.querySelector('.leaderboard');
const leaderboardButtons=document.querySelectorAll('.leaderboardButton');
const scoreBox=document.querySelector('.scoreBox');
const closeButton = document.querySelector('.close');
const scoreText = document.querySelector('.score p');
const bulletsLeftText = document.querySelector('.bulletsLeft p');
const zombiesKilledText = document.querySelector('.zombiesKilled p');
const restriction=document.querySelector('.restriction');
const username=document.querySelector('.username');
const startButton = document.querySelector('.start');
const countdown=document.querySelector('.countdown');
const round=document.querySelector('.round');
const blackScreen1=document.querySelector('.blacken1');
const blackScreen2=document.querySelector('.blacken2');
const blackScreen3=document.querySelector('.blacken3');
const blackScreen4=document.querySelector('.blacken4');
const blackScreen5=document.querySelector('.blacken5');
const blackScreen6=document.querySelector('.blacken6');
const playAgainButton=document.querySelector('.playAgain');
const finalScore=document.querySelector('.gameOverBox p');
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click',handleBulletShoot);
window.addEventListener('mousedown', handleMouseDown);
window.addEventListener('mouseup', handleMouseUp);
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
restartButton.addEventListener('click',()=>{window.location.reload();});

canvas.width = 1240;
canvas.height = 546;

let gamePaused=true;
let isGameOver = false;
let bigBlockSize=75;
let score = 0;
let roundNumber = 1;
let zombieNumber = 5;
let zombieSpeed = 0.2;
let zombiesKilled = 0;
let bulletsLeft = 20;
let mousePos = { x: 0, y: 0 };
const bulletNetVelocity = 10;
const gravityBullet = 0.17;
const rect = canvas.getBoundingClientRect();
const gravity = 0.5;
let isMouseDown = false;
let bulletLoaded = true;
let interval = 900;

window.addEventListener('resize', function () {
    canvas.width = 1240;
    canvas.height = 546;
});

let keys = { left: false, right: false, up: false};

class Platform {
    constructor({ x, y, image }) {
        this.position = { x: x, y: y };
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
    update(){
        this.draw();
    }
}

const platformImage = createImage('../images1/platform.png');

const platforms = [
    new Platform({ x: 0, y: 465, image: platformImage }),
    new Platform({ x: 578, y: 465, image: platformImage }),
    new Platform({ x: 1156, y: 465, image: platformImage })
];

const platformHeight = platforms[0].position.y;

class BackgroundObject{
    constructor({x,y,image}){
        this.position={x:x , y:y};
        this.image=image;
        this.width = image.width;
        this.height = image.height;
    }
    draw(){
        c.drawImage(this.image,this.position.x,this.position.y);
    }
}

const bgObjects=[new BackgroundObject({x:-1,y:-1,image:createImage('../images1/nightBg.png')})];

class Survivor {
    constructor() {
        this.width = 85;
        this.height = 155;
        this.position = { x: canvas.width/2-20, y:-this.height };
        this.velocity = { x: 0, y: 2 };
        this.frame = 1;
        this.count = 0;
        this.jumpCount = 0;
        this.facing = 'right';
    }
    draw() {
        if(this.velocity.x > 0){
            this.image = createImage(`../images2/survivorRunRight/run${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images2/survivorRunLeft/run${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x === 0){
            if(this.facing === 'right')
                this.image = createImage('../images2/survivorIdle/idleRight.png');
            else
                this.image = createImage('../images2/survivorIdle/idleLeft.png');
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }
    update() {
        this.count++;
        if(this.count % 3 === 0){
            this.count = 0;
            this.frame++;
        }
        if(this.frame > 10){
            this.frame = 1;
        }
        if(keys.right)
            this.facing = 'right';
        else if(keys.left)
            this.facing = 'left';
        // update position
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if(this.position.y+this.height+this.velocity.y<=platformHeight)
            this.velocity.y += gravity;
        else{
            this.velocity.y=0;
            this.jumpCount = 0;
        }
        // horizontal movement
        if (keys.right) 
            this.velocity.x = 5;
        else if (keys.left) 
            this.velocity.x = -5;
        else 
            this.velocity.x = 0;

        // jumping
        if(keys.up && this.jumpCount < 2){ //to prevent survivor from jumping more
            this.velocity.y=-12;            //than twice
            this.jumpCount++;
        }
    
        if(this.position.x + this.width >= canvas.width-1){
            if(keys.right)
                this.velocity.x = 0;
        }                               // to prevent survivor from going off-frame
        else if(this.position.x <= 1){
            if(keys.left)
                this.velocity.x = 0;
        }
        bigBlocks.forEach(block => {
            if (
                this.position.x + this.width >= block.position.x &&
                this.position.x <= block.position.x + block.width &&
                this.position.y + this.height >= block.position.y &&
                this.position.y <= block.position.y + block.height
            ) {
                if (keys.right && this.position.x < block.position.x) {
                    this.velocity.x = 0;
                }
                if (keys.left && this.position.x + this.width > block.position.x + block.width) {
                    this.velocity.x = 0;
                }
            }
            if(this.position.y + this.height <= block.position.y &&
                this.position.y + this.height + this.velocity.y >= block.position.y &&
                this.position.x + this.width >= block.position.x &&
                this.position.x <= block.position.x + block.width
            ){
                this.velocity.y= 0;
                this.jumpCount = 0;
            }
        });

        this.draw();
    }
}

const survivor = new Survivor();

class HealthBar {
    constructor() {
        this.position = { x:survivor.position.x + 2 , y:survivor.position.y - 15 };
        this.width = 80;
        this.height = 10;
        this.width2 = 80;
    }
    takeDamage(){
        this.width2 -= 2.5;
        if(this.width2 <= 0)
            handleGameOver();
    }
    drawHealth(){
        c.fillStyle = 'rgb(117, 238, 117)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.lineWidth = 4;
        c.strokeStyle = 'black';
        c.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
    drawHealth2() {
        c.fillStyle = 'rgb(7, 168, 7)';
        c.fillRect(this.position.x, this.position.y, this.width2, this.height);
    }
    update({ x, y }) {
        this.position.x = x+2;
        this.position.y = y-15;
        this.drawHealth();
        this.drawHealth2();
    }
}

const healthBar = new HealthBar();

let zombies = [];

class Zombies{
    constructor({x,height,y}){
        this.position = {x:x , y:y};
        this.velocity = {x:0 , y:0};
        this.velocityIncrease = zombieSpeed + (Math.random()*0.3);
        this.width = 52 + Math.floor(Math.random()*8);
        this.height = height;
        this.healthWidth = 45;
        this.healthHeight = 4;
        this.healthWidth2 = 45;
        this.colliding = false;
        if(this.position.x >= survivor.position.x+survivor.width/2)
            this.facing = 'left';
        else
            this.facing = 'right';
    }
    takeDamage(){
           this.healthWidth2 -= 15;

        if(this.healthWidth2 <= 0){
            score += 50;
            zombiesKilled++;
            handleScoreBox();
        }
    }
    draw(){
        if(this.velocity.x > 0){
            this.image = createImage(`../images1/zombieGirlRightIdle.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images1/zombieGirlLeftIdle.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else{
            if(this.facing === 'right')
                this.image = createImage(`../images1/zombieGirlRightIdle.png`);
            else
                this.image = createImage(`../images1/zombieGirlLeftIdle.png`);
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
    }
    drawHealth(){
        c.fillStyle = 'rgb(235, 120, 120)';
        c.fillRect(this.position.x + 7.5, this.position.y-2, this.healthWidth, this.healthHeight);
        c.lineWidth = 1;
        c.strokeStyle = 'black';
        c.strokeRect(this.position.x + 7.5, this.position.y-2, this.healthWidth, this.healthHeight);
    }
    drawHealth2(){
        c.fillStyle = 'red';
        c.fillRect(this.position.x + 7.5, this.position.y-2, this.healthWidth2, this.healthHeight);
    }
    update(){
        if(this.velocity.x > 0)
            this.facing = 'right';
        else if(this.velocity.x < 0)
            this.facing = 'left';

        // update position
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if(this.position.x + this.width <= survivor.position.x)
            this.velocity.x = this.velocityIncrease;  //zombie horizontal velocity
        else if(this.position.x >= survivor.position.x + survivor.width)
            this.velocity.x = -this.velocityIncrease; //zombie horizontal velocity
        else
            this.velocity.x = 0;

            bigBlocks.forEach(block => {
                if (
                    this.position.x + this.width >= block.position.x &&
                    this.position.x <= block.position.x + block.width &&
                    this.position.y + this.height >= block.position.y &&
                    this.position.y <= block.position.y + block.height
                ) {
                    if (this.velocity.x > 0 && this.position.x <= block.position.x) {
                        this.velocity.x = 0;
                    }
                    if (this.velocity.x < 0 && this.position.x + this.width >= block.position.x + block.width) {
                        this.velocity.x = 0;
                    }
                }
            });   

        this.draw();
        this.drawHealth();
        this.drawHealth2();
    }
}

function drawZombies(number,array,Class){
    for(let i=0;i<number;i++){
        let height = 88 + Math.floor(Math.random()*12);
        array.push(new Class({x:Math.floor(Math.random()*20),
            height:height, y:platformHeight-height}));
            
        array.push(new Class({x:1100 + Math.floor(Math.random()*130),
            height:height, y:platformHeight-height}));
    }
}

const bigBlock=createImage('../images1/woodenBoxBig.png');

class BigBlocks{
    constructor({x,y,image}) {
        this.position = { x: x, y: y };
        this.velocity = {x: 0, y: 2};
        this.width = bigBlockSize;
        this.height = bigBlockSize;
        this.image=image;
        this.healthWidth = 65;
        this.healthHeight = 6;
        this.healthWidth2 = 65;
    }
    draw() {
        c.drawImage(this.image,this.position.x,this.position.y,bigBlockSize,bigBlockSize);
    }
    takeDamage(damage){
        this.healthWidth2 -= damage;
    }
    drawHealth(){
        c.fillStyle = 'rgb(166, 166, 245)';
        c.fillRect(this.position.x+5,this.position.y-12,this.healthWidth,this.healthHeight);
        c.lineWidth = 2;
        c.strokeStyle = 'black';
        c.strokeRect(this.position.x+5,this.position.y-12,this.healthWidth,this.healthHeight);
    }
    drawHealth2(){
        c.fillStyle = 'blue';
        c.fillRect(this.position.x+5,this.position.y-12,this.healthWidth2,this.healthHeight);
    }
    update(){
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        if(this.position.y+this.height+this.velocity.y<=platformHeight)
            this.velocity.y += gravity;
        else
            this.velocity.y=0;

        bigBlocks.forEach((block)=>{
            if(block !== this && this.position.y + this.height <= block.position.y &&
                this.position.y + this.height + this.velocity.y >= block.position.y &&
                this.position.x + this.width >= block.position.x &&
                this.position.x <= block.position.x + block.width
            ){
                this.velocity.y= 0;
            }
        });

        this.draw();
        this.drawHealth();
        this.drawHealth2();
    }
}

let bigBlocks=[new BigBlocks({x:385 , y:platformHeight-bigBlockSize, image:bigBlock}),
    new BigBlocks({x:430 , y:platformHeight-(bigBlockSize*2), image:bigBlock}),
    new BigBlocks({x:305 , y:platformHeight-bigBlockSize, image:bigBlock}),
    new BigBlocks({x:730 , y:platformHeight-bigBlockSize, image:bigBlock}),
    new BigBlocks({x:760 , y:platformHeight-(bigBlockSize*2), image:bigBlock}),
    new BigBlocks({x:810 , y:platformHeight-bigBlockSize, image:bigBlock}),
    new BigBlocks({x:465, y:platformHeight-bigBlockSize, image:bigBlock}),
    new BigBlocks({x:350, y:platformHeight-(bigBlockSize*2), image:bigBlock}),
    new BigBlocks({x:890 , y:platformHeight-bigBlockSize, image:bigBlock})
];

class Pistol{
    constructor(survivor) {
        this.survivor = survivor;
        this.width = 60;
        this.height = 20;
        this.position = {
            x: this.survivor.position.x + this.survivor.width/2,
            y: this.survivor.position.y + this.survivor.height/1.6 - this.height/2
        };
        this.image = createImage('../images1/pistol.png');
    }
    draw() {
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));
        
        c.save();
        c.translate(this.survivor.position.x + this.survivor.width/2,
            this.survivor.position.y + this.survivor.height/1.6);
        c.rotate(angle);
        c.drawImage(this.image, 0, 0, 512, 332, 0, -this.height/2, this.width, this.height);
        c.restore();
    }
    update() {
        this.position.x = this.survivor.position.x + this.survivor.width/2;
        this.position.y = this.survivor.position.y + this.survivor.height/1.6 - this.height / 2;
        this.draw();
    }  
}

const pistol = new Pistol(survivor);

const pistolBulletImage = createImage('../images1/pistolBullet.png');

class PistolBullet{
    constructor(pistol,survivor,image){
        this.survivor=survivor;
        this.gun=pistol;
        this.position={x: this.gun.position.x , y: this.gun.position.y};
        this.velocity = {x:0 , y:0};
        this.width = 24;
        this.height = 8;
        this.image = image;
        this.shot = false;
        this.gravityBullet = gravityBullet;
    }
    draw(){
        if(this.shot){
          let angleBullet = Math.atan2(this.velocity.y, this.velocity.x);
          c.save();  //saves the current state of the canvas
          //shifts the origin of canvas to the center of the bullet
          c.translate(this.position.x + this.width/2, this.position.y + this.height/2);
          c.rotate(angleBullet);  //rotates the bullet

          if(mousePos.x > this.survivor.position.x + this.survivor.width/2)
               c.drawImage(this.image, -this.width/2-8, -this.height/2-6, this.width, this.height);
          else if(mousePos.x < this.survivor.position.x + this.survivor.width/2 )
               c.drawImage(this.image, -this.width/2+4, -this.height/2-17, this.width, this.height);
          else
               c.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);

          c.restore(); //restores the canvas state
        }
    }
    shoot(){
        this.shot = true;
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));

        this.velocity.x = Math.cos(angle)*bulletNetVelocity;   //Projectile motion formula
        this.velocity.y = Math.sin(angle)*bulletNetVelocity;                     
        
        let tipGunX = this.gun.position.x + this.gun.width*Math.cos(angle);
        let tipGunY = this.gun.position.y + this.gun.width*Math.sin(angle);

        this.position = {x: tipGunX, y: tipGunY};
    }
    update(){
        if(this.shot){
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.velocity.y += this.gravityBullet;
            this.draw();
        }
    }
}

let pistolBullets = [];

class ProjectionLine{
    constructor(gun,survivor){
        this.gun=gun;
        this.survivor = survivor;
        this.velocity = bulletNetVelocity;
    }
    placePoint(x,y){
        c.beginPath();
        c.arc(x, y, 3, 0, Math.PI*2, false);
        c.fillStyle = 'white';
        c.fill();
    }
    draw(){
        let angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));

        let tipGunX = this.gun.position.x + this.gun.width*Math.cos(angle);
        let tipGunY;

        if(mousePos.x > this.survivor.position.x + this.survivor.width/2)
            tipGunY = this.gun.position.y + this.gun.width*Math.sin(angle) + 2.5;
        else if(mousePos.x < this.survivor.position.x + this.survivor.width/2 )
            tipGunY = this.gun.position.y + this.gun.width*Math.sin(angle) + 14;
        else
            tipGunY = this.gun.position.y + this.gun.width*Math.sin(angle);

        for(let i=0; i<500; i+=3){
            let x = tipGunX + this.velocity*Math.cos(angle)*i;
            let y = tipGunY + this.velocity*Math.sin(angle)*i + 0.5*gravityBullet*i*i;
            if(y>platformHeight)
                break;
            else
                this.placePoint(x,y);
        }
        }
    update(){
        this.draw();
    }
}

let projectionLine;

function handleBulletShoot() {
    if (bulletsLeft > 0 && bulletLoaded) {
        let newBullet;
        newBullet = new PistolBullet(pistol, survivor, pistolBulletImage);
        loadBullet(interval);

        newBullet.shoot();
        pistolBullets.push(newBullet);
        bulletLoaded = false;
        bulletsLeft -= 1;
        handleScoreBox();
        gunShotSound();
    }
}

function handleMouseDown(){
    isMouseDown = true;
}

function handleMouseUp(){
    isMouseDown = false;
}

function handleKeyDown(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 37:
        case 65:
            keys.left = true;
            break;
        case 39:
        case 68:
            keys.right = true;
            break;
        case 32:
        case 38:
        case 87:
            keys.up = true;
            break;
    }
}

function handleKeyUp(event) {
    let keyCode = event.keyCode;
    switch (keyCode) {
        case 37:
        case 65:
            keys.left = false;
            break;
        case 39:
        case 68:
            keys.right = false;
            break;
        case 32:
        case 38:
        case 87:
            keys.up = false;
            break;
    }
}

function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = event.clientX - rect.left;
    mousePos.y = event.clientY - rect.top;
}

function animate() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    bgObjects.forEach(obj => obj.draw());
    platforms.forEach(platform=>platform.update());

  if(!gamePaused){
    bgObjects.forEach(obj => obj.draw());
    platforms.forEach(platform=>platform.update());

    bigBlocks.forEach((block,index)=>{
        if(block.healthWidth2<=0)
            bigBlocks.splice(index,1);
        block.update();
    });

    zombies.forEach((zombie,index)=>{
        if(zombie.healthWidth2 <= 0){
            zombies.splice(index,1);
            bulletsLeft += 4;
            handleScoreBox();
            starSound();
        }
        zombie.update();
    });

    if(zombies.length === 0){
        roundNumber++;
        gamePaused = true;
        blackScreen5.style.visibility = 'visible';
        round.innerText = `Round ${roundNumber}`;
        setTimeout(()=>{
            blackScreen5.style.visibility = 'hidden';
            gamePaused = false;
            zombieGrowl();
        },2500);
        zombieSpeed += 0.1;
        zombieNumber += 1;
        //draws zombies at the start of every round
        drawZombies(zombieNumber,zombies,Zombies);
    }

    survivor.update();   //update survivor

    pistol.update();     //update pistol
    handleCollision(pistolBullets);
    pistolBullets.forEach((bullet,index)=>{
     bullet.update();
     if (bullet.position.y > platformHeight-35||bullet.position.x > canvas.width||bullet.position.x < 0) {
         pistolBullets.splice(index,1);      //if bullets go off frame, remove bullet
     }
 });

    if(isMouseDown && bulletsLeft > 0) {
        projectionLine = new ProjectionLine(pistol, survivor);
        projectionLine.update();  
    }
    
    healthBar.update({ x: survivor.position.x, y: survivor.position.y });

    if(bulletsLeft === 0){
        handleGameOver();
        setTimeout(()=>{alert('No Bullets Left');},1500);
    }
    }

    requestAnimationFrame(animate);
}

function handleCollision(bullets){
    bullets.forEach((bullet,bulletIndex)=>{
        bigBlocks.forEach((block)=>{
            if(isColliding(bullet, block)){
                block.takeDamage(1.5);
                bullets.splice(bulletIndex,1);
            }
    });
        for(let i=0;i<zombies.length;i++){
            if(isColliding(bullet,zombies[i])){
                zombies[i].takeDamage();
                if(zombies[i].facing === 'right')
                    zombies[i].position.x -= 7;
                else
                    zombies[i].position.x += 7;
                bullets.splice(bulletIndex,1);
                break;
            }
        }
    });
}

function zombieBlockDestroy(){
    if(!gamePaused){
    bigBlocks.forEach((block)=>{
        for(let i=0;i<zombies.length;i++){
            if(isColliding(zombies[i],block)){
                block.takeDamage(4);
                boxDamageSound();
                break;
            }
        }
    });
  }
}

function zombieSurvivorAttack(){
    if(!gamePaused){
    for(let i=0;i<zombies.length;i++){
        if(isColliding(zombies[i],survivor)){
            healthBar.takeDamage();
            break;
        }
    }
  }
}

function createImage(imageSrc) {
    const image = new Image();
    image.src = imageSrc;
    return image;
}

function pauseFunc(){
    pauseButton.addEventListener('click',()=>{
        blackScreen1.style.visibility='visible';
        gamePaused=true;
    });
    resumeButton.addEventListener('click',()=>{
        blackScreen1.style.visibility='hidden';
        countdownFunc();
    })
}

function startGame(){
    startButton.addEventListener('click',()=>{
        if(usernameRestrict() === 'hidden'){
            blackScreen3.style.visibility='hidden';
            blackScreen5.style.visibility='visible';
            round.innerText = `Round ${roundNumber}`;
            setTimeout(()=>{
                gamePaused = false;
                blackScreen5.style.visibility = 'hidden';
                zombieGrowl();
            },2500);
        }
    });
}

function isColliding(bullet, block) {
    return (
        bullet.position.x < block.position.x + block.width &&
        bullet.position.x + bullet.width > block.position.x &&
        bullet.position.y < block.position.y + block.height &&
        bullet.position.y + bullet.height > block.position.y
    );
}

function countdownFunc(){
    if(!isGameOver){
    let secCount=4;
    blackScreen2.style.visibility='visible';
    setInterval(()=>{
        if(secCount === 0){
            secCount = null;
            countdown.innerText=" ";
            gamePaused = false;
            blackScreen2.style.visibility = 'hidden';
        }
        else if(secCount === 1){
            countdown.innerText="PLAY";
            secCount--;
        }
        else if(secCount === 2 || secCount === 3 || secCount === 4){
            countdown.innerText=`${secCount-1}`; 
            secCount--;
        }
    },1000);
  }
}

function usernameRestrict(){
    if(username.value.length < 4)
        restriction.style.visibility = 'visible';
    else
        restriction.style.visibility = 'hidden';
    return restriction.style.visibility;
}

function handleScoreBox(){
    scoreText.innerText = `Score : ${score}`;
    bulletsLeftText.innerText = `Bullets Left : ${bulletsLeft}`;
    zombiesKilledText.innerText = `Zombies Killed : ${zombiesKilled}`;
}

function handleGameOver(){
    gamePaused = true;
    isGameOver = true;
    let isAppended = false;
    gameOverSound();
    blackScreen4.style.visibility = 'visible';
    finalScore.innerText = `Your Score : ${score}`;
    if(localStorage.getItem('scores') &&
       JSON.parse(localStorage.getItem('scores')).length > 0
    ){
        let array = JSON.parse(localStorage.getItem('scores'));
        for(let i=0;i<array.length;i++){
            let n = array[i].score;
            if(i===0){
                if(score >= n && !isAppended){
                    array.splice(0,0,{username:username.value, score:score});
                    isAppended = true;
                    break;
                }
            }
            if(i===array.length-1 && !isAppended){
                if(score < n){
                    array.push({username:username.value, score:score});
                    isAppended = true;
                    break;
                }
            }
            else{
                if(score <= n && score > array[i+1].score && !isAppended){
                    array.splice(i+1,0,{username:username.value, score:score});
                    isAppended = true;
                    break;
                }
            }
        }
        localStorage.setItem('scores',JSON.stringify(array));
    }
    else{
        localStorage.setItem('scores',JSON.stringify([{username:username.value,
             score:score}]));
    }
}

function displayLeaderBoard(){
    leaderboardButtons.forEach((button)=>{
        button.addEventListener('click',()=>{
        gamePaused = true;
        blackScreen6.style.visibility = 'visible';
        let container = document.createElement('div');
        container.className = 'container';
        leaderboard.appendChild(container);
        let array = JSON.parse(localStorage.getItem('scores'));
        let a = array.length;
        for(let i=0;i<a;i++){
            let p = document.createElement('p');
            p.innerText = `${array[i].username}  :  ${array[i].score}`;
            container.appendChild(p);
        }
    });
});
    closeButton.addEventListener('click',()=>{
        leaderboard.removeChild(document.querySelector('.container'));
        blackScreen6.style.visibility = 'hidden';
        countdownFunc();
    })
}

function handlePlayAgain(){
    playAgainButton.addEventListener('click',() => {window.location.reload();})
}

function loadBullet(interval){
    setTimeout(()=>{
        bulletLoaded = true;
    },interval);
}

function placeElements(){
    scoreBox.style.left = `${rect.left + 980}px`;
    scoreBox.style.top = `${rect.top + 8}px`;
}

function starSound(){
    const audio = new Audio();
    audio.src = '../sounds/star.mp3';
    audio.volume = 0.9;
    audio.play();
}

function gunShotSound(){
    const audio = new Audio();
    audio.src = '../sounds/pistolShot.mp3';
    audio.volume = 0.9;
    audio.play();
}

function boxDamageSound(){
    const audio = new Audio();
    audio.src = '../sounds/boxDamage.mp3';
    audio.volume = 0.02;
    audio.play();
}

function gameOverSound(){
    const audio = new Audio();
    audio.src = '../sounds/GameOver.mp3';
    audio.volume = 0.4;
    audio.play();
}

function zombieGrowl(){
    const audio = new Audio();
    audio.src = '../sounds/zombieGrowl.mp3';
    audio.volume = 0.5;
    audio.play();
}

startGame();
drawZombies(zombieNumber,zombies,Zombies); //draws zombies at the start of the game
animate();
placeElements();
setInterval(zombieBlockDestroy,2000);
setInterval(zombieSurvivorAttack,2000);
pauseFunc();
displayLeaderBoard();
handlePlayAgain();

//scrollbar for leaderboard