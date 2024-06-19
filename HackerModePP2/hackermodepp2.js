/* eslint-disable default-case */
// Hacker++ Mode
const pauseButton=document.querySelector('.pause');
const resumeButton=document.querySelector('.resume');
const restartButton=document.querySelector('.restart');
const leaderboard=document.querySelector('.leaderboard');
const leaderboardButtons=document.querySelectorAll('.leaderboardButton');
const jetpackBox=document.querySelector('.jetpackBox');
const jetpackCountdownBox = document.querySelector('.jetpackCountdown');
const enableText=document.querySelector('.enableText');
const timer=document.querySelector('.timer');
const scoreBox=document.querySelector('.scoreBox');
const closeButton = document.querySelector('.close');
const scoreText = document.querySelector('.score p');
const bulletsLeftText = document.querySelector('.bulletsLeft p');
const zombiesKilledText = document.querySelector('.zombiesKilled p');
const infoText = document.querySelector('.powerUpInfo');
const popUp = document.querySelector('.popUp');
const popUpText2 = document.querySelector('.popUp2 p');
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
const pistolButton=document.querySelector('.pistol');
const ak47Button=document.querySelector('.ak47');
const sniperButton=document.querySelector('.sniper');
const weaponBox=document.querySelector('.weapons');
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
let isMouseDown = false;
let bulletLoaded = true;
let isRecoil = false;
let jetpackOn = false;
let jetpackTimer = 61;
let jetpackCountdown = 10;
let bigBlockSize=75;
let score = 0;
let roundNumber = 1;
let zombieNumber = 2;
let climberZombiesNumber = 2;
let passThroughZombiesNumber = 1;
let zombieSpeed = 0.15;
let zombiesKilled = 0;
let bulletsLeft = 20;
let powerUps = 0;
let mousePos = { x: 0, y: 0 };
const bulletNetVelocity = 10;
const gravityBullet = 0.17;
const gravity = 0.5;
let gravitySurvivor = 0.5;
const rect = canvas.getBoundingClientRect();
let weapon = 'pistol';
let interval = {pistol: 910, ak47: 1310, sniper: 1960};
let RFPistol = 60;
let RFAK = 42;
let RFSniper = 22;

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
        if(this.velocity.x === 0 || jetpackOn){
            if(this.facing === 'right')
                this.image = createImage('../images2/survivorIdle/idleRight.png');
            else
                this.image = createImage('../images2/survivorIdle/idleLeft.png');
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x > 0){
            this.image = createImage(`../images2/survivorRunRight/run${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images2/survivorRunLeft/run${this.frame}.png`);
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
            this.velocity.y += gravitySurvivor;
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
        if(keys.up && this.jumpCount < 2 && survivor.position.y > 0){ //to prevent survivor from jumping more
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

class HealthBar{
    constructor() {
        this.position = { x:survivor.position.x + 2 , y:survivor.position.y - 15 };
        this.width = 80;
        this.height = 10;
        this.width2 = 80;
    }
    takeDamage(){
        this.width2 -= 4;
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

class TemporaryHealthBar{
    constructor(){
        this.position = { x:survivor.position.x + 2 , y:survivor.position.y - 26};
        this.width = 80;
        this.height = 5;
        this.width2 = 80;
    }
    takeDamage(){
        this.width2 -= 27;
    }
    drawHealth(){
        c.fillStyle = 'rgb(239, 185, 108)';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.lineWidth = 2.5;
        c.strokeStyle = 'black';
        c.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
    drawHealth2() {
        c.fillStyle = 'rgb(241, 147, 15)';
        c.fillRect(this.position.x, this.position.y, this.width2, this.height);
    }
    update(){
        this.position.x = survivor.position.x + 2;
        this.position.y = survivor.position.y - 26;
        this.drawHealth();
        this.drawHealth2();
    }
}

let temporaryHealthBar = [];

class Jetpack{
    constructor(){
        this.position = {x: survivor.position.x-4, y:survivor.position.y + 75};
        this.height = 50;
        this.width = 25;
        this.imageLeft = createImage('../images1/jetpackleft.png');
        this.imageRight = createImage('../images1/jetpackright.png');
    }
    draw(){
        if(survivor.facing === 'left'){
           this.position.x = survivor.position.x + survivor.width-21;
           c.drawImage(this.imageLeft, this.position.x, this.position.y, this.width, this.height);
        }
        else{
           this.position.x = survivor.position.x-4;
           c.drawImage(this.imageRight, this.position.x, this.position.y, this.width, this.height);
        }
    }
    lift(){ 
        if(jetpackOn){
        survivor.velocity.y = (survivor.position.y >= canvas.height/8) ? survivor.velocity.y - 0.06 : 0;
        }
    } 
    update(){
        gravitySurvivor = jetpackOn ? 0 : 0.5;
        this.position.y = survivor.position.y + 82;
        this.draw(); 
    }
}

const jetpack = new Jetpack();

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
        this.count = 0;
        this.frame = 1;
        this.colliding = false;
        this.facing = (this.position.x >= survivor.position.x+survivor.width/2) ? 'left':'right';
    }
    takeDamage(){
        if(weapon === 'pistol')
           this.healthWidth2 -= 15;
        else if(weapon === 'ak47')
            this.healthWidth2 -= 25;
        else if(weapon === 'sniper')
            this.healthWidth2 -=45;

        if(this.healthWidth2 <= 0){
            score += 50;
            zombiesKilled++;
            handleScoreBox();
        }
    }
    draw(){
        if(this.velocity.x > 0){
            this.image = createImage(`../images2/zombieGirlWalkRight/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images2/zombieGirlWalkLeft/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else{
            if(this.facing === 'right')
                this.image = createImage(`../images2/zombieGirlAttackRight/attack${this.frame}.png`);
            else
                this.image = createImage(`../images2/zombieGirlAttackLeft/attack${this.frame}.png`); 
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
        this.count++;
        if(this.count % 4 === 0){
            this.count=0;
            this.frame++;
        }
        if(this.frame > 10)
            this.frame = 1;

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

let climberZombies = [];

class ClimberZombies{
    constructor({x,height,y}){
        this.position = {x:x , y:y};
        this.velocity = {x:0 , y:0};
        this.velocityIncrease = zombieSpeed + (Math.random()*0.3) + 0.1;
        this.velocityClimb = 1;
        this.width = 56 + Math.floor(Math.random()*8);
        this.height = height;
        this.healthWidth = 45;
        this.healthHeight = 4;
        this.healthWidth2 = 45;
        this.count = 0;
        this.frame = 1;
        this.onBlock = false; //default value
        this.facing = (this.position.x >= survivor.position.x+survivor.width/2) ? 'left':'right';
    }
    takeDamage(){
        if(weapon === 'pistol')
           this.healthWidth2 -= 15;
        else if(weapon === 'ak47')
            this.healthWidth2 -= 25;
        else if(weapon === 'sniper')
            this.healthWidth2 -=45;

        if(this.healthWidth2 <= 0){
            score += 50;
            zombiesKilled++;
            handleScoreBox();
        }
    }
    draw(){
        if(this.velocity.x > 0){
            this.image = createImage(`../images3/zombieBoyWalkRight/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images3/zombieBoyWalkLeft/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x === 0 || this.velocity.y < 0){
            if(this.facing === 'right')
                this.image = createImage(`../images3/zombieBoyAttackRight/attack${this.frame}.png`);
            else
                this.image = createImage(`../images3/zombieBoyAttackLeft/attack${this.frame}.png`); 
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
        this.count++;
        if(this.count % 4 === 0){
            this.count = 0;
            this.frame++;
        }
        if(this.frame > 10)
            this.frame = 1;

        if(this.velocity.x > 0)
            this.facing = 'right';
        else if(this.velocity.x < 0)
            this.facing = 'left';
    
        // reset onBlock value
        this.onBlock = false;
    
        // default value
        this.velocity.y = 0;
    
        // check for collisions with bigBlocks
        bigBlocks.forEach(block => {
            if (this.position.x + this.width > block.position.x &&
                this.position.x < block.position.x + block.width &&
                this.position.y + this.height >= block.position.y &&
                this.position.y < block.position.y + block.height) {

                if (this.velocity.x > 0 && this.position.x + this.width <= block.position.x + block.width/2) {
                    // approaching from the left side
                    this.velocity.x = 0;
                    this.velocity.y = -this.velocityClimb; // climbing up
                } 
                else if (this.velocity.x < 0 && this.position.x >= block.position.x + block.width/2) {
                    // approaching from the right side
                    this.velocity.x = 0;
                    this.velocity.y = -this.velocityClimb; // climbing up
                }
                if (this.position.y + this.height >= block.position.y &&
                    this.position.y + this.height <= block.position.y + block.height) {
                    this.onBlock = true;
                }
            }
        });
    
        // apply gravity if not on a block and above the platform height
        if (!this.onBlock && this.position.y + this.height < platformHeight)
            this.velocity.y += 2.5;
    
        // update position
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
    
        // horizontal movement towards survivor
        if (this.position.x + this.width <= survivor.position.x) 
            this.velocity.x = this.velocityIncrease;  // move right
        else if (this.position.x >= survivor.position.x + survivor.width)
            this.velocity.x = -this.velocityIncrease; // move left
        else
            this.velocity.x = 0;
    
        this.draw();
        this.drawHealth();
        this.drawHealth2();
    }      
}

let passThroughZombies = [];

class PassThroughZombies{
    constructor({x,height,y}){
        this.position = {x:x , y:y};
        this.velocity = {x:0 , y:0};
        this.velocityIncrease = zombieSpeed + (Math.random()*0.3) + 0.07;
        this.width = 52 + Math.floor(Math.random()*8);
        this.height = height;
        this.healthWidth = 45;
        this.healthHeight = 4;
        this.healthWidth2 = 45;
        this.count = 0;
        this.frame = 1;
        if(this.position.x >= survivor.position.x+survivor.width/2)
            this.facing = 'left';
        else
            this.facing = 'right';
    }
    takeDamage(){
        if(weapon === 'pistol')
           this.healthWidth2 -= 15;
        else if(weapon === 'ak47')
            this.healthWidth2 -= 25;
        else if(weapon === 'sniper')
            this.healthWidth2 -=45;

        if(this.healthWidth2 <= 0){
            score += 50;
            zombiesKilled++;
            handleScoreBox();
        }
    }
    draw(){
        if(this.velocity.x > 0){
            this.image = createImage(`../images1/passZombieWalkRight/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else if(this.velocity.x < 0){
            this.image = createImage(`../images1/passZombieWalkLeft/walk${this.frame}.png`);
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        }
        else{
            if(this.facing === 'right')
                this.image = createImage(`../images1/passZombieAttackRight/attack${this.frame}.png`);
            else
                this.image = createImage(`../images1/passZombieAttackLeft/attack${this.frame}.png`); 
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
        this.count++;
        if(this.count % 6 === 0){
            this.count=0;
            this.frame++;
        }
        if(this.frame > 6)
            this.frame = 1;

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
        this.recoilDistance = 10;
        this.recoilTime = 6;
        this.recoilTimeCount = 0;
    }
    draw() {
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));
        
        c.save();
        c.translate(this.survivor.position.x + this.survivor.width/2,
            this.survivor.position.y + this.survivor.height/1.6);
        if(isRecoil){
            c.translate(-this.recoilDistance*Math.cos(angle) , 
            -this.recoilDistance*Math.sin(angle));
        }
        c.rotate(angle);
        c.drawImage(this.image, 0, 0, 512, 332, 0, -this.height/2, this.width, this.height);
        c.restore();
    }
    update() {
        this.position.x = this.survivor.position.x + this.survivor.width/2;
        this.position.y = this.survivor.position.y + this.survivor.height/1.6 - this.height / 2;
        if(isRecoil){
            this.recoilTimeCount++;
            if(this.recoilTimeCount > this.recoilTime){
                isRecoil = false;
                this.recoilTimeCount = 0;
            }
        }
        this.draw();
    }  
}

const pistol = new Pistol(survivor);

class Ak47{
    constructor(survivor) {
        this.survivor = survivor;
        this.width = 80;
        this.height = 28;
        this.position = {
            x: this.survivor.position.x + this.survivor.width/2,
            y: this.survivor.position.y + this.survivor.height/1.6 - this.height/2
        };
        this.image = createImage('../images1/ak47.png');
        this.recoilDistance = 10;
        this.recoilTime = 7;
        this.recoilTimeCount = 0;
    }
    draw() {
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));
        
        c.save();
        c.translate(this.survivor.position.x + this.survivor.width/2,
            this.survivor.position.y + this.survivor.height/1.6);
        if(isRecoil){
            c.translate(-this.recoilDistance*Math.cos(angle) , 
            -this.recoilDistance*Math.sin(angle));
        }
        c.rotate(angle);
        c.drawImage(this.image, 0, 0, 459, 117, 0, -this.height/2, this.width, this.height);
        c.restore();
    }
    update() {
        this.position.x = this.survivor.position.x + this.survivor.width/2;
        this.position.y = this.survivor.position.y + this.survivor.height/1.6 - this.height/2;
        if(isRecoil){
            this.recoilTimeCount++;
            if(this.recoilTimeCount > this.recoilTime){
                isRecoil = false;
                this.recoilTimeCount = 0;
            }
        }
        this.draw();
    }  
}

const ak47 = new Ak47(survivor);

class Sniper{
    constructor(survivor) {
        this.survivor = survivor;
        this.width = 105;
        this.height = 30;
        this.position = {
            x: this.survivor.position.x + this.survivor.width/2,
            y: this.survivor.position.y + this.survivor.height/1.6 - this.height/2
        };
        this.image = createImage('../images1/sniper.png');
        this.recoilDistance = 10;
        this.recoilTime = 8;
        this.recoilTimeCount = 0;
    }
    draw() {
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width / 2));
        
        c.save();
        c.translate(this.survivor.position.x + this.survivor.width/2,
            this.survivor.position.y + this.survivor.height/1.6);
        if(isRecoil){
            c.translate(-this.recoilDistance*Math.cos(angle) , 
            -this.recoilDistance*Math.sin(angle));
        }
        c.rotate(angle);
        c.drawImage(this.image, 0, 0, 459, 117, 0, -this.height/2, this.width, this.height);
        c.restore();
    }
    update() {
        this.position.x = this.survivor.position.x + this.survivor.width/2;
        this.position.y = this.survivor.position.y + this.survivor.height/1.6 - this.height/2;
        if(isRecoil){
            this.recoilTimeCount++;
            if(this.recoilTimeCount > this.recoilTime){
                isRecoil = false;
                this.recoilTimeCount = 0;
            }
        }
        this.draw();
    }  
}

const sniper = new Sniper(survivor);

const pistolBulletImage = createImage('../images1/pistolBullet.png');
const ak47BulletImage = createImage('../images1/ak47Bullet.png');
const sniperBulletImage = createImage('../images1/sniperBullet.png');

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
        this.angleBullet = 0;
    }
    draw(){
        if(this.shot){
          this.angleBullet = Math.atan2(this.velocity.y, this.velocity.x);
          c.save();  //saves the current state of the canvas
          //shifts the origin of canvas to the center of the bullet
          c.translate(this.position.x + this.width/2, this.position.y + this.height/2);
          c.rotate(this.angleBullet);  //rotates the bullet

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

class Ak47Bullet{
    constructor(ak47,survivor,image){
        this.survivor=survivor;
        this.gun=ak47;
        this.position={x: this.gun.position.x , y: this.gun.position.y};
        this.velocity = {x:0 , y:0};
        this.width = 18;
        this.height = 6;
        this.image = image;
        this.shot = false;
        this.gravityBullet = gravityBullet;
        this.angleBullet = 0;
    }
    draw(){
        if(this.shot){
          this.angleBullet = Math.atan2(this.velocity.y, this.velocity.x);
          c.save();  //saves the current state of the canvas
          //shifts the origin of canvas to the center of the bullet
          c.translate(this.position.x + this.width/2, this.position.y + this.height/2);
          c.rotate(this.angleBullet);  //rotates the bullet

          if(mousePos.x > this.survivor.position.x + this.survivor.width/2)
               c.drawImage(this.image, -this.width/2-8, -this.height/2-7, this.width, this.height);
          else if(mousePos.x < this.survivor.position.x + this.survivor.width/2 )
               c.drawImage(this.image, -this.width/2+15, -this.height/2-10, this.width, this.height);
          else
               c.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);

          c.restore(); //restores the canvas state
        }
    }
    shoot(){
        this.shot = true;
        const angle = Math.atan2(mousePos.y - (this.survivor.position.y + this.survivor.height/1.6),
            mousePos.x - (this.survivor.position.x + this.survivor.width/2));

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

let ak47Bullets = [];

class SniperBullet{
    constructor(sniper,survivor,image){
        this.survivor=survivor;
        this.gun=sniper;
        this.position={x: this.gun.position.x , y: this.gun.position.y};
        this.velocity = {x:0 , y:0};
        this.width = 27;
        this.height = 9;
        this.image = image;
        this.shot = false;
        this.gravityBullet = gravityBullet;
        this.angleBullet = 0;
    }
    draw(){
        if(this.shot){
          this.angleBullet = Math.atan2(this.velocity.y, this.velocity.x);
          c.save();  //saves the current state of the canvas
          //shifts the origin of canvas to the center of the bullet
          c.translate(this.position.x + this.width/2, this.position.y + this.height/2);
          c.rotate(this.angleBullet);  //rotates the bullet

          if(mousePos.x > this.survivor.position.x + this.survivor.width/2)
               c.drawImage(this.image, -this.width/2-15, -this.height/2-2.5, this.width, this.height);
          else if(mousePos.x < this.survivor.position.x + this.survivor.width/2 )
               c.drawImage(this.image, -this.width/2+15, -this.height/2-10, this.width, this.height);
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

let sniperBullets = [];

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
        isRecoil = true;
        let newBullet;
        switch (weapon) {
            case 'pistol':
                newBullet = new PistolBullet(pistol, survivor, pistolBulletImage);
                loadBullet(interval.pistol);
                break;
            case 'ak47':
                newBullet = new Ak47Bullet(ak47, survivor, ak47BulletImage);
                loadBullet(interval.ak47);
                break;
            case 'sniper':
                newBullet = new SniperBullet(sniper, survivor, sniperBulletImage);
                loadBullet(interval.sniper);
                break;
        }

        newBullet.shoot();
        if (weapon === 'pistol') {
            pistolBullets.push(newBullet);
        } else if (weapon === 'ak47') {
            ak47Bullets.push(newBullet);
        } else if (weapon === 'sniper') {
            sniperBullets.push(newBullet);
        }
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
        case 74:
            if(jetpackTimer === 0 && !jetpackOn){
               jetpackOn = true;
               jetpackSound();
               jetpackCountdownFunc();
            }
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
            switch(weapon){
                case 'pistol':
                    bulletsLeft += 3;
                    break;
                case 'ak47':
                    bulletsLeft += 2;
                    break;
                case 'sniper':
                    bulletsLeft += 1;
                    break;
            }
            handleScoreBox();
            starSound();
        }
        zombie.update();
    });

    climberZombies.forEach((zombie,index)=>{
        if(zombie.healthWidth2 <= 0){
            climberZombies.splice(index,1);
            switch(weapon){
                case 'pistol':
                    bulletsLeft += 3;
                    break;
                case 'ak47':
                    bulletsLeft += 2;
                    break;
                case 'sniper':
                    bulletsLeft += 1;
                    break;
            }
            handleScoreBox();
            starSound();
        }
        zombie.update();
    });

    passThroughZombies.forEach((zombie,index)=>{
        if(zombie.healthWidth2 <= 0){
            passThroughZombies.splice(index,1);
            switch(weapon){
                case 'pistol':
                    bulletsLeft += 3;
                    break;
                case 'ak47':
                    bulletsLeft += 2;
                    break;
                case 'sniper':
                    bulletsLeft += 1;
                    break;
            }
            handleScoreBox();
            starSound();
        }
        zombie.update();
    });

    if(zombies.length === 0 && climberZombies.length === 0 && 
    passThroughZombies.length === 0){
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
        climberZombiesNumber += 0.5;
        passThroughZombiesNumber += 0.5;
        //draws zombies at the start of every round
        drawZombies(zombieNumber,zombies,Zombies);
        drawZombies(climberZombiesNumber,climberZombies,ClimberZombies);
        drawZombies(passThroughZombiesNumber,passThroughZombies,PassThroughZombies);
    }

    survivor.update();

    if(weapon === 'pistol'){
       pistol.update();
       handleCollision(pistolBullets);
       pistolBullets.forEach((bullet,index)=>{
        bullet.update();
        if (bullet.position.y > platformHeight-35||bullet.position.x > canvas.width||bullet.position.x < 0) {
            pistolBullets.splice(index,1);      //if bullets go off frame, remove bullet
        }
    });
    }

    else if(weapon === 'ak47'){
        ak47.update();
        handleCollision(ak47Bullets);  
        ak47Bullets.forEach((bullet,index)=>{
        bullet.update();
        if (bullet.position.y > platformHeight-35||bullet.position.x > canvas.width||bullet.position.x < 0) {
            ak47Bullets.splice(index,1);      //if bullets go off frame, remove bullet
        }
    });
    }

    else if(weapon === 'sniper'){
        sniper.update();
        handleCollision(sniperBullets); 
        sniperBullets.forEach((bullet,index)=>{
        bullet.update();
        if (bullet.position.y > platformHeight-35||bullet.position.x > canvas.width||bullet.position.x < 0) {
            sniperBullets.splice(index,1);      //if bullets go off frame, remove bullet
        }
    });
    }

    if(isMouseDown && bulletsLeft > 0) {
        switch(weapon){
            case 'pistol':
                projectionLine = new ProjectionLine(pistol, survivor);
                break;
            case 'ak47':
                projectionLine = new ProjectionLine(ak47, survivor);
                break;
            case 'sniper':
                projectionLine = new ProjectionLine(sniper, survivor);
                break;
        }
        projectionLine.update();  
    }
    if(temporaryHealthBar.length === 1){
        temporaryHealthBar[0].update();
        if(temporaryHealthBar[0].width2 <= 0)
            temporaryHealthBar.pop();
    }
    healthBar.update({ x: survivor.position.x, y: survivor.position.y });
    handlePowerUps();

    jetpack.update();
    if(jetpackOn)
        jetpack.lift();
    
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
        for(let i=0;i<climberZombies.length;i++){
            if(isColliding(bullet,climberZombies[i])){
                climberZombies[i].takeDamage();
                if(climberZombies[i].facing === 'right')
                    climberZombies[i].position.x -= 7;
                else
                    climberZombies[i].position.x +=7;
                bullets.splice(bulletIndex,1);
                break;
            }
        }
        for(let i=0;i<passThroughZombies.length;i++){
            if(isColliding(bullet,passThroughZombies[i])){
                passThroughZombies[i].takeDamage();
                if(passThroughZombies[i].facing === 'right')
                    passThroughZombies[i].position.x -= 7;
                else
                    passThroughZombies[i].position.x +=7;
                bullets.splice(bulletIndex,1);
                break;
            }
        }
        if(isColliding(bullet,survivor) && bullet.angleBullet > 0){
            healthBar.takeDamage();          //Survivor should be impacted when bullet
            bullets.splice(bulletIndex,1);   //collides with it
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
            if(temporaryHealthBar.length === 1)
                temporaryHealthBar[0].takeDamage();
            else
                healthBar.takeDamage();
            break;
        }
    }
    for(let i=0;i<climberZombies.length;i++){
        if(isColliding(climberZombies[i],survivor)){
            if(temporaryHealthBar.length === 1)
                temporaryHealthBar[0].takeDamage();
            else
                healthBar.takeDamage();
            break;
        }
    }
    for(let i=0;i<passThroughZombies.length;i++){
        if(isColliding(passThroughZombies[i],survivor)){
            if(temporaryHealthBar.length === 1)
                temporaryHealthBar[0].takeDamage();
            else
                healthBar.takeDamage();
            break;
        }
    }
  }
}

function handlePowerUps(){
    if(powerUps < Math.floor(zombiesKilled/10)){
      powerUps++;
      infoText.style.visibility = 'hidden';
      document.querySelector('.popUp').style.visibility = 'visible';
      setTimeout(()=>{
        document.querySelector('.popUp').style.visibility = 'hidden'
        infoText.style.visibility = 'visible';
      },3800);

        if(powerUps % 4 === 1){
            popUpText2.innerText = 'Rate of Fire increased for all weapons';
            increaseFireRate();
        }

        else if(powerUps % 4 === 2){
            popUpText2.innerText = 'You have got temporary immunity';
            if(temporaryHealthBar.length === 0)
                temporaryHealthBar.push(new TemporaryHealthBar());
            else
                temporaryHealthBar[0].width2 = 80;
        }

        else if(powerUps % 4 === 3){
            popUpText2.innerText = 'You have 10 extra bullets';
            bulletsLeft += 10;
        }

        else if(powerUps % 4 === 0){
            popUpText2.innerText = 'You have got +10 health';
            if(healthBar.width <=65)
                healthBar.width2 +=10;
            else
                healthBar.width2 = 80;
        }
    }
}

function increaseFireRate(){
    if(interval.pistol > 70){
        interval.pistol -= 140;
        RFPistol+=4.2;
        document.querySelector('.RFPistol2').style.width = `${RFPistol}px`;
    }
    if(interval.ak47 > 110){
        interval.ak47 -=200;
        RFAK+=7.2;
        document.querySelector('.RFAK2').style.width = `${RFAK}px`;
    }
    if(interval.sniper > 160){
        interval.sniper -=300;
        RFSniper+=9;
        document.querySelector('.RFSniper2').style.width = `${RFSniper}px`;
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
            infoText.style.visibility = 'visible';
            weaponBox.style.visibility = 'visible';
            pistolButton.style.border = '2px solid red';
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
        infoText.style.visibility = 'hidden';
        weaponBox.style.visibility = 'hidden';
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
        infoText.style.visibility = 'visible';
        weaponBox.style.visibility = 'visible';
        countdownFunc();
    })
}

function handlePlayAgain(){
    playAgainButton.addEventListener('click',() => {window.location.reload();})
}

function switchWeapon(){
    pistolButton.addEventListener('click',()=>{
        if(sniperBullets.length===0 && ak47Bullets.length===0 && weapon !== 'pistol' &&
            !gamePaused){
        weapon = 'pistol';
        pistolButton.style.border = '2px solid red';
        ak47Button.style.border = '';
        sniperButton.style.border = ''; }
    });
    ak47Button.addEventListener('click',()=>{
        if(sniperBullets.length===0 && pistolBullets.length===0 && weapon !== 'ak47' &&
            !gamePaused){
        weapon = 'ak47';
        ak47Button.style.border = '2px solid red';
        pistolButton.style.border = '';
        sniperButton.style.border = ''; }
    });
    sniperButton.addEventListener('click',()=>{
        if(pistolBullets.length===0 && ak47Bullets.length===0 && weapon !== 'sniper' && 
            !gamePaused){
        weapon = 'sniper';
        sniperButton.style.border = '2px solid red';
        ak47Button.style.border = '';
        pistolButton.style.border = ''; }
    });
}

function loadBullet(interval){
    setTimeout(()=>{
        bulletLoaded = true;
    },interval);
}

function jetpackCountdownFunc(){
    if(!jetpackOn){
    let jetpackId1 = setInterval(()=>{
        if(jetpackTimer > 0){
            if(!gamePaused){
            jetpackTimer--;
            document.querySelector('.timer').innerText = `${jetpackTimer}`;
            }
        }
        else{
            document.querySelector('.jetpackBox h1').style.visibility = 'hidden';
            timer.style.visibility = 'hidden';
            enableText.style.visibility = 'visible';
            clearInterval(jetpackId1);
        }
    },1000);
  }
  else{
    let jetpackId2 = setInterval(()=>{
        if(jetpackCountdown > 0){
            if(!gamePaused){
                enableText.style.visibility ='hidden';
                jetpackCountdownBox.style.visibility = 'visible';
                jetpackCountdownBox.innerText = `${jetpackCountdown}`;
                jetpackCountdown--;
            }
        }
        else{
            jetpackTimer = 61;
            document.querySelector('.jetpackBox h1').style.visibility = 'visible';
            timer.style.visibility = 'visible';
            jetpackCountdownBox.style.visibility = 'hidden';
            jetpackCountdown = 10;
            jetpackOn = false;
            clearInterval(jetpackId2);
            jetpackCountdownFunc();
        }
    },1000);
  }
}

function placeElements(){
    scoreBox.style.left = `${rect.left + 980}px`;
    scoreBox.style.top = `${rect.top + 8}px`;

    weaponBox.style.left = `${rect.left + 355}px`;
    weaponBox.style.top = `${rect.top + 472}px`;

    infoText.style.left = `${rect.left + 390}px`;
    infoText.style.top = `${rect.top + 10}px`;

    popUp.style.left = `${rect.left + 390}px`;
    popUp.style.top = `${rect.top + 10}px`;

    jetpackBox.style.left = `${rect.left + 10}px`;
    jetpackBox.style.top = `${rect.top + 8}px`;
}

function starSound(){
    const audio = new Audio();
    audio.src = '../sounds/star.mp3';
    audio.volume = 0.9;
    audio.play();
}

function gunShotSound(){
    const audio = new Audio();
    switch(weapon){
        case 'pistol':
            audio.src = '../sounds/pistolShot.mp3';
            audio.volume = 0.9;
            break;
        case 'ak47':
            audio.src = '../sounds/ak47Shot.mp3';
            audio.volume = 0.3;
            break;
        case 'sniper':
            audio.src = '../sounds/sniperShot.mp3';
            audio.volume = 0.1;
            break;
    }
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

function jetpackSound(){
    const audio = new Audio();
    audio.src = '../sounds/jetpackSound.mp3';
    audio.volume = 0.5;
    audio.play();
}

startGame();
drawZombies(zombieNumber,zombies,Zombies); //draws zombies at the start of the game
drawZombies(climberZombiesNumber,climberZombies,ClimberZombies);
drawZombies(passThroughZombiesNumber,passThroughZombies,PassThroughZombies);
animate();
placeElements();
jetpackCountdownFunc();
setInterval(zombieBlockDestroy,2000);
setInterval(zombieSurvivorAttack,1500);
switchWeapon();
pauseFunc();
displayLeaderBoard();
handlePlayAgain();

//scrollbar for leaderboard
//change sprite of climber zombie when it is climbing