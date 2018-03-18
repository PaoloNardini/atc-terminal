function ConsoleSwitch() {

    this.x = 0;
    this.y = 0;
    this.OnOff = 0;
    this.name = '';
    this.line = 0;
    this.pos = 0;

    // Graphic object
    this.gDraw = new createjs.Container();

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(CONSOLE_COLOR).moveTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_WIDTH).lineTo(-CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_WIDTH).lineTo(CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_WIDTH).lineTo(CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_WIDTH).lineTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_WIDTH).endStroke();

    this.gLabel = new createjs.Text("", "normal 12px Courier", CONSOLE_COLOR);
    this.gLabel.x = 0 - (CONSOLE_SWITCH_WIDTH / 2);
    this.gLabel.y = 0 - (CONSOLE_SWITCH_HEIGHT / 2);
    this.gLabel.lineHeight = 12;

    this.gDraw.addChild(this.gBox, this.gLabel);

    this.gDraw.addEventListener("click", function(event) {
        if (event.currentTarget.name != undefined) {
            consoleSwitchClicked(event.currentTarget.name);
        }
    });
}

ConsoleSwitch.prototype.isOn = function() {
    return (this.OnOff == 1);
}

ConsoleSwitch.prototype.on = function() {
    this.OnOff = 1;
    console.log('turn on');
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginFill(CONSOLE_SWITCH_ON_COLOR).beginStroke(CONSOLE_COLOR).moveTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).lineTo(-CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_HEIGHT).lineTo(CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_HEIGHT).lineTo(CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).lineTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).endStroke();
}

ConsoleSwitch.prototype.off = function() {
    this.OnOff = 0;
    console.log('turn off');
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginFill(CONSOLE_SWITCH_OFF_COLOR).beginStroke(CONSOLE_COLOR).moveTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).lineTo(-CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_HEIGHT).lineTo(CONSOLE_SWITCH_WIDTH,CONSOLE_SWITCH_HEIGHT).lineTo(CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).lineTo(-CONSOLE_SWITCH_WIDTH,-CONSOLE_SWITCH_HEIGHT).endStroke();
}

ConsoleSwitch.prototype.setLine = function ( line ) {
    this.line = line;
}

ConsoleSwitch.prototype.setPos = function ( pos ) {
    this.pos = pos;
    this.setY(20 + ((this.line) * (CONSOLE_SWITCH_HEIGHT * 2.4)));
    this.setX(30 + ((this.pos) * (CONSOLE_SWITCH_WIDTH * 2.2)));
}

ConsoleSwitch.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = this.x;
}

ConsoleSwitch.prototype.setY = function ( y ) {
    this.y = y; // + ((this.line) * (CONSOLE_SWITCH_HEIGHT * 2));
    this.gDraw.y = this.y;
}

ConsoleSwitch.prototype.setName = function(name) {
    this.name = name;
    this.gDraw.name = name;
}

ConsoleSwitch.prototype.setLabel = function(label) {
    // this.name = label;
    this.gLabel.text = label;
    // this.gDraw.name = label;
}