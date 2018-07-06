var gameProperties = {
    screenWidth: 350,
    screenHeight: 720,

    defaultTextStyle: {
        fill: 'white'
    },

    scale: 1.3,
    tilePadding: 5,

    get tileWidth () {
        return 32 * this.scale;
    },
    get tileHeight (){
        return 32 * this.scale;
    },
    
    winningChainLength:4,

    boardWidth: 7,
    boardHeight: 6,

    AIEnable1: false,
    AIPlayerTurn1: "RED",
    AIPlayer1Level: 1,

    AIEnable2: false,
    AIPlayerTurn2: "YELLOW",
    AIPlayer2Level: 1,

    playerTurnHex:{
        RED: "0xFF7777",
        YELLOW: "0xFFFF00"
    }
};

var states = {
    playerTurn: "RED",
    AIturn: false,
    modified: {
        value: false,
        x: -1,
        y: -1
    },
    tileStates: {
        EMPTY: "EMPTY",
        RED: "RED",
        YELLOW: "YELLOW",
    },
    winStates: {
        up: "U",
        upLeft: "UL",
        upRight: "UR",
        right: "R"
    }
};

var gameSkelli = function(game){
    this.boardPixelSize;
    this.board;
    this.AIPlayer1;
    this.AIPlayer2;
    this.win;
    this.menu;
};

gameSkelli.prototype = {
    init: function() {
        this.boardPixelWidth = gameProperties.boardWidth * (gameProperties.tileWidth + gameProperties.tilePadding);
        this.boardPixelHeight = gameProperties.boardHeight * (gameProperties.tileWidth + gameProperties.tilePadding);
    },
    
    preload: function () {
        game.load.image("EMPTY", "images/connect4/sprites/empty.png");
        game.load.image("RED", "images/connect4/sprites/red.png");
        game.load.image("YELLOW", "images/connect4/sprites/yellow.png");
        game.load.image("resetBtn", "images/connect4/sprites/resetbtn.png");
        game.load.image("startBtn", "images/connect4/sprites/start.png");
        game.load.spritesheet("aiToggle", "images/connect4/sprites/humanAiToggle.png", 64, 18);
        game.load.image("decArrowBtn", "images/connect4/sprites/decArrow.png");
        game.load.image("incArrowBtn", "images/connect4/sprites/incArrow.png");
        game.load.image("firstPlayer", "images/connect4/sprites/firstPlr.png");
    },
    
    create: function () {
        game.stage.backgroundColor = "#222222";
        this.board = new Board(gameProperties.boardWidth, gameProperties.boardHeight);
        this.board.moveTo(15  , 30);
        this.win = false;
        this.start = false;
        this.menu = new MenuCollection(108,  this.boardPixelHeight + 43);
        this.AIPlayer1 = new miniMaxAI(gameProperties.AIPlayer1Level, gameProperties.AIPlayerTurn1);
        this.AIPlayer2 = new miniMaxAI(gameProperties.AIPlayer2Level, gameProperties.AIPlayerTurn2);
    },

    update: function () {
        // upadtes game sprites when they are modified
        
        if (states.modified.value == true) {
            let tempTile = this.board.getTile(states.modified.x, states.modified.y);
            tempTile.updateSprite();
            states.modified.value = !states.modified.value;

            let result = checkWin(this.board, states.modified.x, states.modified.y, tempTile.getState());
            if (result){
                game.add.text(game.world.centerX, game.world.centerY - (this.boardPixelHeight / 2), tempTile.getState() + " PLAYER WINS", { 
                    font: "25px Arial", fill: tempTile.getState(), align: "center", stroke:"#111111", strokeThickness: 6 
                }).anchor.setTo(0.5);

                displayWin(result.direction, result.start.x, result.start.y, this.board);
                this.win = true;
            }
        }

        if (states.playerTurn == gameProperties.AIPlayerTurn1 && gameProperties.AIEnable1 == true && this.win != true){
            this.AIPlayer1.preformTurn(this.board);
            return;
        }

        if (states.playerTurn == gameProperties.AIPlayerTurn2 && gameProperties.AIEnable2 == true && this.win != true){
            this.AIPlayer2.preformTurn(this.board);
        }
    }
};


var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.CANVAS, 'gameDiv', gameSkelli);