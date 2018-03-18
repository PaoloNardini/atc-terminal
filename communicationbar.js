
function CommunicationBar() {
    this.Container_constructor();

    this.lines = [];
    this.width = 100;

    // Graphic objects
    this.gMsg = new createjs.Text("", "normal 15px Courier", MSG_COLOR);
    this.gMsg.x = 5;
    this.gMsg.y = 0;
    this.gMsg.lineHeight = 14;
    // this.gMsg.setBounds(0,0,100,40);

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(MSG_BAR_COLOR).beginFill(MSG_BAR_COLOR).dr(0,0,50,20);
    this.addChild(this.gBox, this.gMsg);

    this.x = 80;
    this.y = 5;

}
createjs.extend(CommunicationBar, createjs.Container);
createjs.promote(CommunicationBar, "Container");

CommunicationBar.prototype.setX = function ( x ) {
    this.x = x;
}

CommunicationBar.prototype.setY = function ( y ) {
    this.y = y;
}

CommunicationBar.prototype.setWidth = function ( w ) {
    this.width = w;
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(MSG_BAR_COLOR).beginFill(MSG_BAR_COLOR).dr(0,0,w,18);
}

CommunicationBar.prototype.showMessage = function ( msg, type ) {
    this.lines[this.lines.length] = msg;
    var color;
    switch (type) {
        case MSG_TO_PLANE:
            color = MSG_BAR_COLOR_1;
            break;
        case MSG_FROM_PLANE:
            color = MSG_BAR_COLOR_2;
            break;
        case MSG_FROM_TWR:
        case MSG_TO_TWR:
            msg = 'TWR: ' + msg;
            color = MSG_BAR_COLOR_3;
            break;
        case MSG_FROM_ATC:
        case MSG_TO_ATC:
            msg = 'ATC: ' + msg;
            color = MSG_BAR_COLOR_4;
            break;
        case MSG_ERROR:
            msg = 'ERROR: ' + msg;
            color = MSG_BAR_COLOR_ERR;
            break;
        default:
            color = MSG_BAR_COLOR;
            break;
    }
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(color).beginFill(color).dr(0,0,this.width,30);
    this.gMsg.text = msg;
    var that = this;
    setTimeout(function() {
        that.gBox.graphics.clear();
        that.gMsg.text = '';
    },10000)
}


