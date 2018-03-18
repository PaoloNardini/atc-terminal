/* The fix object, representing a navigation point */
function Fix() {

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
    this.visible = true;
    this.labelVisible = true;
    this.visibleTemp = false;
    this.labelVisibleTemp = false;

    // Fix position
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Graphic object
    this.gLabel = new createjs.Text("", "normal 8px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 9;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.addChild(this.gBox, this.gLabel);
}
createjs.extend(Fix, createjs.Container);
createjs.promote(Fix, "Container");

Fix.prototype.setX = function ( x ) {
    this.x = x;
}

Fix.prototype.setY = function ( y ) {
    this.y = y;
}

Fix.prototype.setScreenPosition = function() {
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);
}

Fix.prototype.show = function(visible, isTemporary) {
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

Fix.prototype.showLabel = function(visible, isTemporary) {
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
            this.labelVisible = false;
            this.labelVisibleTemp = isTemporary;
            this.gLabel.visible = false;
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
