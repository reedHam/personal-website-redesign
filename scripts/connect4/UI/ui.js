// parent class created for inheritance 
class Button {
    /*  prams:
    *       x: x coordinate for the button
    *       y: y coordinate for the button
    *       alias: sprite alias (name given to sprite when loaded into memory)
    */
    constructor(x, y, alias){
        this.x = x;
        this.y = y;
        this.sprite = game.add.sprite(x, y, alias);
        this.sprite.tint = 0xDDDDDD;
        this.sprite.scale.set(gameProperties.scale + 1, gameProperties.scale + 1);
        this.sprite.inputEnabled = true;
        this.sprite.input.useHandCursor = true;
        this.sprite.events.onInputOver.add(this.hoverOver, this);
        this.sprite.events.onInputOut.add(this.hoverOut, this);
        this.sprite.events.onInputDown.add(this.click, this);
    }

    setPos(x, y){
        this.x = x;
        this.y = y;
        this.sprite.x = x;
        this.sprite.y = y;
    }

    getPos(){
        return {x: this.x, y: this.y};
    }

    hoverOver(){
        this.sprite.tint = 0xFFFFFF;
    }

    hoverOut(){
        this.sprite.tint = 0xDDDDDD;
    }

    click(){} // virtual function to be implemented in child classes
}

// TO-DO change name and sprite of this button to start since it reflects the operations better
// resets the game to default state
class ResetBtn extends Button {
    constructor(x, y){
        super(x, y, "startBtn");
    }

    click(){
        gameProperties.AIEnable1 = game.state.states.default.menu.getAiEnabled()['plr1'];
        gameProperties.AIPlayer1Level = game.state.states.default.menu.getAiLevels()['plr1'];
        gameProperties.AIEnable2 = game.state.states.default.menu.getAiEnabled()['plr2'];
        gameProperties.AIPlayer2Level = game.state.states.default.menu.getAiLevels()['plr2'];
        game.state.restart();
        states.playerTurn = "RED";
    }
}

// increments the ai search depth
class IncArrow extends Button {
    constructor(x, y, counter){
        super(x, y, "incArrowBtn");
        this.counter = counter;
    }

    click(){
        let level = parseInt(this.counter.text);
        if ( level < 7){
            this.counter.text =  level + 1; 
         }   
    }
}

// decrements the ai search depth
class DecArrow extends Button {
    constructor(x, y, counter){
        super(x, y, "decArrowBtn");
        this.counter = counter;
    }

    click(){
        let level = parseInt(this.counter.text);
        if ( level > 1){
           this.counter.text =  level - 1; 
        }   
    }
}

// toggle button to enable AI
class AiEnableButton extends Button {
    constructor (x, y){
        super(x, y, "aiToggle");
    }

    // returns 0 or 1, 0 being the first frame 
    getValue(){
        return this.sprite.frame;
    }

    // set the frame with 0 or 1, 0 being the first frame
    setValue(value){
        this.sprite.frame = value;
    }

    click(){
        this.sprite.frame = this.sprite.frame == 0 ? 1 : 0;
    }
}

// collection for the ai level arrow buttons and level counter 
class AiSelector {
    constructor(x, y){
        this.aiEnableBtn = new AiEnableButton(x , y);
        this.label = game.add.text(x + 21, y + 48, "AI Level", gameProperties.defaultTextStyle)
        this.counter = game.add.text(x + 65, y + 80, "1", gameProperties.defaultTextStyle);
        this.decArrow = new DecArrow(x + 21, y + 80, this.counter);
        this.incArrow = new IncArrow(x + 85, y + 80, this.counter);
    }

    setPos(x, y){
        this.counter.x = x;
        this.counter.y = y;
        this.decArrow.setPos(x, y);
        this.incArrow.setPos(x, y);
        this.aiEnableBtn.setPos(x, y);
    }

    getAiLevel(){
        return parseInt(this.counter.text);
    }

    setAiLevel(level){
        this.counter.setText(level + "");
    }

    getAiEnabled(){
        return this.aiEnableBtn.getValue();
    }

    setAiEnabled(value){
        this.aiEnableBtn.setValue(value);
    }
}

// collection of all menu elements
class MenuCollection {
    constructor(x, y){
        this.graphics = game.add.graphics(x, y); // add graphic for rectangle container
        this.graphics.lineStyle(2, 0xFFFFFF, 1);
        this.graphics.drawRect(-55, -8, 250, 382); // Out most rectangle
        this.graphics.drawRect(-50, 39, 241, 162); // Red Player
        this.graphics.drawRect(-50, 206, 241, 163); // Yellow Player

        this.btnReset = new ResetBtn(x + 35, y);

        this.player1Label = game.add.text(x , y + 40, "Red Player", {fill: 'red', stroke:"#111111", strokeThickness: 6});
        this.ai1Selector = new AiSelector(x, y + 80);
        this.ai1Selector.setAiLevel(gameProperties.AIPlayer1Level);
        this.ai1Selector.setAiEnabled(gameProperties.AIEnable1);

        this.player2Label = game.add.text(x - 14, y + 210, "Yellow Player", {fill: 'yellow', stroke:"#111111", strokeThickness: 6});
        this.ai2Selector = new AiSelector(x, y + 250);
        this.ai2Selector.setAiLevel(gameProperties.AIPlayer2Level);
        this.ai2Selector.setAiEnabled(gameProperties.AIEnable2);
    }

    getAiLevels(){
        return { plr1: this.ai1Selector.getAiLevel(), plr2: this.ai2Selector.getAiLevel()};
    }
    
    getAiEnabled(){
        return { plr1: this.ai1Selector.getAiEnabled(), plr2: this.ai2Selector.getAiEnabled()};
    }

    setPos(x, y){
        this.btnStart.setPos(x, y);
        this.btnStart.setPos(x, y);
        this.ai1Selector.setPos(x, y);
        this.ai2Selector.setPos(x, y);
    }
}