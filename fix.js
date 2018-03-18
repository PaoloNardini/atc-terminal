/* The fix object, representing a navigation point */
function Fix() {

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
    this.visible = true;    // Default visibility

    // Fix position
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Graphic object
    this.gDraw = new createjs.Container();
    this.gLabel = new createjs.Text("", "normal 8px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 9;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.gDraw.addChild(this.gBox, this.gLabel);
}

Fix.prototype.setX = function ( x ) {
    this.x = x;
    this.gDraw.x = x;
}

Fix.prototype.setY = function ( y ) {
    this.y = y;
    this.gDraw.y = y;
}

Fix.prototype.setScreenPosition = function() {
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);
}

Fix.prototype.show = function(visible) {
    this.visible = visible;
    this.gDraw.visible = visible;
}

Fix.prototype.showLabel = function(visible) {
    this.gLabel.visible = visible;
}
