/* The navaid object, representing a radio navigation aid */
function Navaid() {

    this.Container_constructor();

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
    this.labelVisible = false;
    this.visibleTemp = false;
    this.labelVisibleTemp = false;

    // Navaid position
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Graphic object
    this.gLabel = new createjs.Text("", "normal 12px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = 5 +(Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 12;

    this.gBox = new createjs.Shape();
    this.addChild(this.gBox, this.gLabel);
}
createjs.extend(Navaid, createjs.Container);
createjs.promote(Navaid, "Container");


Navaid.prototype.setX = function ( x ) {
    this.x = x;
}

Navaid.prototype.setY = function ( y ) {
    this.y = y;
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

Navaid.prototype.show = function(visible, isTemporary) {
    if (isTemporary == undefined) {
        isTemporary = false;
    }
    if (visible) {
        // Show fix
        if (this.visible && !this.visibleTemp) {
            // Fix always displayed
            return;
        }
        if (!this.visible) {
            this.visible = visible;
            this.visibleTemp = isTemporary;
        }
    }
    else {
        // Hide fix
        if (this.visible && ((isTemporary && this.visibleTemp) || !isTemporary)) {
            // Hide temporary
            this.visible = visible;
            this.visibleTemp = false;
        }
    }
}

Navaid.prototype.showLabel = function(visible, isTemporary) {
    if (isTemporary == undefined) {
        isTemporary = false;
    }
    if (visible) {
        // Show fix label
        if (this.labelVisible && !this.labelVisibleTemp) {
            // Fix label is always visible
            return;
        }
        if (!this.labelVisible) {
            this.labelVisible = true;
            this.labelVisibleTemp = isTemporary;
            this.gLabel.visible = true;
        }
    }
    else {
        // Hide fix label
        if (this.labelVisible && ((isTemporary && this.labelVisibleTemp) || !isTemporary)) {
            this.labelVisible = false;
            this.labelVisibleTemp = false;
            this.gLabel.visible = false;
        }

    }
}
