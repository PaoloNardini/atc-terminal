function CommunicationBar() {
    this.Container_constructor();

    this.lines = [];
    this.width = 400;

    // TODO
    // this.gMsgBox = new createjs.Container();

    // Graphic objects
    /*
    this.gMsg = new createjs.Text("", "normal 15px Courier", MSG_COLOR);
    this.gMsg.x = 5;
    this.gMsg.y = 0;
    this.gMsg.lineHeight = 14;
    // this.gMsg.setBounds(0,0,100,40);

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(MSG_BAR_COLOR).beginFill(MSG_BAR_COLOR).dr(0,0,50,20);
    */
    // this.gMsgBox.addChild()
    // this.addChild(this.gBox, this.gMsg);

    this.x = 0;
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
    for (var line=0; line < this.lines.length; line++) {
        this.lines[line].setWidth(w);
    }

    /*
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(MSG_BAR_COLOR).beginFill(MSG_BAR_COLOR).dr(0,0,w,18);
    */
}

CommunicationBar.prototype.showMessage = function ( msg, type ) {
    // this.lines[this.lines.length] = msg;
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
    /*
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(color).beginFill(color).dr(0,0,this.width,30);
    this.gMsg.text = msg;
    */

    this.pushMessage(msg, color);

    /*
    var that = this;
    setTimeout(function() {
        that.gBox.graphics.clear();
        that.gMsg.text = '';
    },10000)
    */
}


CommunicationBar.prototype.pushMessage = function ( msg, color ) {
    var line = this.lines.length;
    var o_message = new Message(msg, this.width, color);
    o_message.setStackPosition(line);
    this.lines[line] = o_message;
    this.addChild(o_message);
}

CommunicationBar.prototype.checkMessagesAge = function() {
    for (var line=0; line < this.lines.length; line++) {
        var o_message = this.lines[line];
        if (o_message.getAge() > MSG_BAR_DELAY) {
            // Delete expired message
            this.removeChild(o_message);
            // Shift  following messages
            for (var v = line+1; v < this.lines.length; v++) {
                if (v <= this.lines.length) {
                    this.lines[v].setStackPosition(v - 1);
                }
            }
            // Delete from array
            this.lines.splice(line,1);
            return;
        }
    }
}


function Message(msg, width, color) {
    this.Container_constructor();

    this.color = color;

    this.gBox = new createjs.Shape();
    // this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(color).beginFill(color).dr(0,0,width,18);
    this.gBox.x = 0;
    this.gBox.y = 5;

    this.gMsg = new createjs.Text("", "normal 15px Courier", MSG_COLOR);
    this.gMsg.text = msg;
    this.gMsg.lineHeight = 14;
    this.gMsg.x = 5;
    this.gMsg.y = 0;
    this.stackPosition = -1;
    this.timeDisplay = new Date().getTime();
    this.addChild(this.gBox, this.gMsg);
}
createjs.extend(Message, createjs.Container);
createjs.promote(Message, "Container");

Message.prototype.setX = function(x) {
    this.x = x;
}

Message.prototype.setY = function(y) {
    this.y = y;
}

Message.prototype.setWidth = function(w) {
    this.gBox.graphics.clear();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(this.color).beginFill(this.color).dr(0,0,w,18);
}

Message.prototype.setStackPosition = function(p) {
    this.stackPosition = p;
    this.gBox.y = p * 20;
    this.gMsg.y = p * 20;
}

Message.prototype.getAge = function() {
    return ((new Date().getTime()) - this.timeDisplay) / 1000;
}