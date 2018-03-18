function ClockBar() {
    this.Container_constructor();

    this.lines = [];
    this.width = 100;

    // Graphic objects
    this.gMsg = new createjs.Text("00:00:00", "normal 20px Courier", CLOCK_COLOR);
    this.gMsg.x = 2;
    this.gMsg.y = 0;
    this.gMsg.lineHeight = 19;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(CLOCK_BAR_COLOR).beginFill(CLOCK_BAR_COLOR).dr(0,0,100,25);
    this.addChild(this.gBox, this.gMsg);

    this.x = 1;
    this.y = 0;

}
createjs.extend(ClockBar, createjs.Container);
createjs.promote(ClockBar, "Container");

ClockBar.prototype.setX = function ( x ) {
    this.x = x;
}

ClockBar.prototype.setY = function ( y ) {
    this.y = y;
}

ClockBar.prototype.updateTime = function ( h, m, s) {
    this.gMsg.text = clockFormat(h,m,s);
}

ClockBar.prototype.showMessage = function ( msg ) {
    this.gMsg.text = msg;
}


