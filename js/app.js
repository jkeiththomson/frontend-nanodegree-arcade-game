//////////////////////////////////////////////////////////
// Consants class
///////////////////////////////////////////////////////////

// constants used for game play
class Constants {
    constructor() {
        // constants
        this.SCOREBOARD_HEIGHT = 100;   // height of scoreboard
        this.TOP_MARGIN = 50;           // margin at top of canvas
        this.PLAYER_LIVES = 4;          // number of "lives" per game
        this.ROWS = 6;                  // number of rows in game
        this.COLS = 5;                  // number of columns in game
        this.ROW_HEIGHT = 83;           // height of a single row
        this.COL_WIDTH = 101;           // width of a single column
        this.ENEMIES = 3;               // number of enemy bugs
        this.PLAYER_ROW = 5;            // player starting row
        this.PLAYER_COL = 2;            // player starting column
        this.ENEMY_ROW = 1;             // enemy starting row
        this.ENEMY_COL = -1;            // enemy starting column
        this.WATER_POINTS = 100;        // points for reaching water
    }
}

var constants = new Constants();

//////////////////////////////////////////////////////////
// Common base class for player and enemies
///////////////////////////////////////////////////////////
class Entity {
    constructor(sprite, vOffset) {
        this.sprite = sprite;
        this.vOffset = vOffset;
        this.row = 0;
        this.col = 0;
    }

    render() {
        const x = this.col * constants.COL_WIDTH;
        const y = this.row * constants.ROW_HEIGHT
                    + constants.SCOREBOARD_HEIGHT
                    + this.vOffset;
        ctx.drawImage(Resources.get(this.sprite), x, y);
    }
}

///////////////////////////////////////////////////////////
// Enemy class -- bugs that our player must avoid
///////////////////////////////////////////////////////////
class Enemy extends Entity {

    constructor() {
        super('images/enemy-bug.png', -23);
        this.increment = 0.1;
    }

    // reset an enemy's position and speed
    reset() {
        // enemy goes on a random row from 1-3
        this.row = Math.floor( Math.random() * 3 + 1 );

        // enemy starts offscreen left
        this.col = -1;

        // enemy speed is a random value
        this.increment = Math.random() * 3.0 + 1.5;
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // You should multiply any movement by the dt parameter
        // which will ensure the game runs at the same speed for
        // all computers.
        this.col += this.increment * dt;

        // if enemy went offscreen right, reset it to offscreen left
        if (this.col > constants.COLS) {
            this.reset();
        }
    }

    // return true if this enemy is at least
    // partially covering this square
    occupiesSquare(icol, irow) {
        // compute row and column of this enemy's head and tail
        // make the enemy be 1/3 of the way into a column before
        // a collision is detected there
        const enemyRow = this.row;
        const enemyTailCol = Math.floor(this.col + 0.33333333);
        const enemyHeadCol = Math.floor(this.col + 0.66666666);

        // see if input row and column are the same as this enemy's
        return (irow == enemyRow &&
               (icol == enemyHeadCol || icol == enemyTailCol) );
    }
}

///////////////////////////////////////////////////////////
// Player class -- the hero of our story
///////////////////////////////////////////////////////////
class Player extends Entity {
    constructor() {
        super('images/char-boy.png', -10);
        this.points = 0;
        this.spriteIndex = 0;
        this.livesLeft = constants.PLAYER_LIVES;

        // the array of images/sprites for the player
        this.spriteArray = [
            'images/char-boy.png',
            'images/char-cat-girl.png',
            'images/char-horn-girl.png',
            'images/char-pink-girl.png',
            'images/char-princess-girl.png'
        ];

    }

    // reset the player
    reset() {
        this.livesLeft = constants.PLAYER_LIVES;
        this.points = 0;
        this.sendHome();
    }

    // put the player back in starting position
    sendHome() {
        this.row = constants.PLAYER_ROW;
        this.col = constants.PLAYER_COL;
    }

    // Update the player's position
    update(dt) {
        // if player reached the water, reset him to home
        if (this.row <= 0) {
            this.points += constants.WATER_POINTS;
            this.sendHome();
        }
    }

    // the player lost a life, send him home and decrement lives left
    loseOneLife() {
        this.sendHome();
        this.livesLeft--;

        // if he lost his last life, game over
        if (this.livesLeft <= 0) {

            if (window.confirm("Game over! Do you want to play again?")) {
                // yes, start a new game
                reset();
            } else {
                // no, go to udacity website
                window.location.href = "http://www.udacity.com";
            }
        }
    };
    handleInput(keyCode) {
        switch(keyCode) {
            // pause and invoke the JS debugger
            case 'escape': {
                //debugger;
                break;
            }

            // toggle through the various player sprites
            case 'home': {
                this.spriteIndex++;
                if (this.spriteIndex >= this.spriteArray.length) {
                    this.spriteIndex = 0;
                }
                this.sprite = this.spriteArray[this.spriteIndex];
                player.render();
                scoreboard.render();
                break;
            }

            // move player one square left
            case 'left': {
                this.col--;
                if (this.col < 0) {
                    this.col = 0;
                }
                break;
            }
            // move player one square right
            case 'right': {
                this.col++;
                if (this.col > constants.COLS - 1) {
                    this.col = constants.COLS - 1;
                }
                break;
            }
            // move player one square up
            case 'up': {
                this.row--;
                if (this.row <= 0) {
                    this.row = 0;
                }
                break;
            }
            // move player one square down
            case 'down': {
                this.row++;
                if (this.row > constants.ROWS - 1) {
                    this.row = constants.ROWS - 1;
                }
                break;
            }
        }
    }
}

///////////////////////////////////////////////////////////
// Scoreboard class
///////////////////////////////////////////////////////////
class Scoreboard {

    constructor() {
        this.x = 0;
        this.y = constants.TOP_MARGIN;
        this.width = constants.COLS * constants.COL_WIDTH;
        this.height = constants.SCOREBOARD_HEIGHT;
    }

    render() {
        // draw background
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "rgb(206,218,255)";
        ctx.fill();
        ctx.strokeStyle = "rgb(80,80,80)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // draw background rect for player icon
        const scoreboardMargin = 10;
        const rectX = this.x + scoreboardMargin;
        const rectY = this.y + scoreboardMargin;
        const rectHeight = this.height - 2 * scoreboardMargin;
        const rectWidth = rectHeight;
        ctx.beginPath();
        ctx.rect(rectX, rectY, rectWidth, rectHeight);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fill();
        ctx.strokeStyle = "rgb(80,80,80)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // draw player icon (75% size)
        const img = Resources.get(player.sprite);
        const iconWidth = img.naturalWidth * 0.75;
        const iconHeight = img.naturalHeight * 0.75;
        const iconX = rectX + (rectWidth - iconWidth) / 2;
        const iconY = rectY + (rectHeight - iconHeight) / 2 - 2*scoreboardMargin;
        ctx.drawImage(img, iconX, iconY, iconWidth, iconHeight);

        // draw "HOME" help text
        ctx.fillStyle = "rgb(145,145,145)";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PRESS HOME", rectX + rectWidth / 2, rectY + rectHeight - 3);

        // draw number of lives left
        const lifeWidth = img.naturalWidth * 0.5;
        const lifeHeight = img.naturalHeight * 0.5;
        let lifeX = this.x + rectWidth + 2 * scoreboardMargin;
        const lifeY = this.y + (this.height - lifeHeight - constants.TOP_MARGIN * 0.5) / 2 + 6;
        for (let i=0; i < constants.PLAYER_LIVES; i++) {
            if (i >= player.livesLeft) {  // draw lives that are gone as ghosts
                ctx.save();
                ctx.globalAlpha = 0.2;
            }
            ctx.drawImage(img, lifeX, lifeY, lifeWidth, lifeHeight);
            if (i >= player.livesLeft) {
                ctx.restore();
            }
            lifeX += lifeWidth - 10;
        }

        // draw point total
        ctx.font = "40pt Courier";
        ctx.textAlign = "right";
        ctx.fillStyle = "rgb(145,145,145)";
        ctx.fillText(player.points, this.x + this.width - scoreboardMargin,
                        this.y + this.height * 0.7);
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
for (let i=0; i < constants.ENEMIES; i++) {
    allEnemies[i] = new Enemy();
}

// create player
var player = new Player();

// create scoreboard
var scoreboard = new Scoreboard();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        27: 'escape',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

