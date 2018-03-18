/* The airport object */
function Airport() {

    // General fix data
    this.name = '';         // Airport commercial name
    this.icao = '';         // Airport ICAO code
    // this.runways = [];      // Runways in airport

    // Airport Center
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    // Graphic object
    this.gDraw = new createjs.Container();

    this.gLabel1 = new createjs.Text("", "normal 10px Courier", RWY_TEXT_COLOR);
    this.gLabel1.x = 0;
    this.gLabel1.y = 0;
    this.gLabel1.lineHeight = 9;

    this.gDraw.addChild(this.gRwy, this.gLabel1);
}

Airport.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Airport.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Airport.prototype.setScreenPosition = function() {
}


