function Track() {

    // Identification
    this.label = '';

    this.latitude = 0;
    this.longitude = 0;
    this.coarse = 0;
    this.distance = 0;
    this.fix = -1;
    this.altitude = -1;

    // Graphic objects
    this.gDraw = new createjs.Container();
    this.gLabel = new createjs.Text("", "normal 10px Courier", PLANE_TEXT_COLOR);
    this.gLabel.x = 0;
    this.gLabel.y = 0;
    this.gLabel.lineHeight = 9;
    this.gLabelConnector = new createjs.Shape();

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(PLANE_BODY_COLOR).dr(0,0,6,6);
    this.gTail = new createjs.Shape();
    this.gDraw.addChild(this.gBox, this.gTail, this.gLabel, this.gLabelConnector);

    // Graphic data
    this.x = (Math.random() * 1000);
    this.gDraw.x = this.x;
    this.y = (Math.random() * 500);
    this.gDraw.y = this.y;
    this.connectorX = 25;
    this.connectorY = -5;


}

Track.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Track.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Track.prototype.setFix = function (f) {
    this.fix = f;
    this.latitude = fixes[f].latitude;
    this.longitude = fixes[f].longitude;
}

Track.prototype.setAltitude = function (a) {
    this.altitude = a;
}

