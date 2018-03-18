/* The navaid object, representing a radio navigation aid */
function Navaid() {

    // General fix data
    this.name = '';         // Fix name
    this.label = '';        // Label on the screen
    this.type = 0;          // See const FIX_TYPE...
    this.release = false;   // Is it a release point to/from other ATC?
    this.altitude = -1;      // Cross altitude
    this.mea = -1;           // Minimum enroute altitude (in feet)
    this.min_speed = -1;     // Minimum speed
    this.max_speed = -1;     // Maximum speed
    this.freq = '';          // Navaid frequency
    this.visible = false;    // Default visibility

    // Navaid position
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Graphic object
    this.gDraw = new createjs.Container();
    this.gLabel = new createjs.Text("", "normal 12px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = 5 +(Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 12;

    this.gBox = new createjs.Shape();
    this.gDraw.addChild(this.gBox, this.gLabel);
}

Navaid.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Navaid.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Navaid.prototype.setScale = function( scale ) {
    scale = scale + 0.4 / 1.2;
    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;
    this.gBox.scaleX = scale;
    this.gBox.scaleY = scale;
}

Navaid.prototype.setScreenPosition = function() {
    this.gBox.graphics.clear();
    if (this.type == FIX_TYPE_NDB) {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
    }
    else if (this.type == FIX_TYPE_VORDMENDB) {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 7).beginFill(FIX_BODY_COLOR).moveTo(-4, 4).lineTo(0, -4).lineTo(4, 4).lineTo(-4, 4).endStroke();
    }
    else {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).beginFill(FIX_BODY_COLOR).moveTo(-2, 2).lineTo(0, -2).lineTo(2, 2).lineTo(-2, 2).endStroke();
    }
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);
}

Navaid.prototype.show = function(visible) {
    this.visible = visible;
    this.gDraw.visible = visible;
}

Navaid.prototype.showLabel = function(visible) {
    this.gLabel.visible = visible;
}