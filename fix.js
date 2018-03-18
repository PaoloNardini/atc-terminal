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
    this.visible = false;
    this.labelVisible = false;
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
    this.gLabel = new createjs.Text("", "normal 10px Courier", FIX_TEXT_COLOR);
    this.gLabel.x = (Math.random() * 30);
    this.gLabel.y = (Math.random() * -30);
    this.gLabel.lineHeight = 9;

    this.gBox = new createjs.Shape();
    this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
    this.addChild(this.gBox, this.gLabel);
}
createjs.extend(Fix, createjs.Container);
createjs.promote(Fix, "Container");

Fix.prototype.getDisplayData = function( scale ) {
    // scale = scale + 0.4;
    scale = scale + 0.4 / 1.2;
    this.gLabel.scaleX = scale;
    this.gLabel.scaleY = scale;
    this.gBox.scaleX = scale; //  / 1.5;
    this.gBox.scaleY = scale; // / 1.5;
    this.setScreenPosition();
}

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

function addFix(name, label, latitude, longitude) {
    var o_fix = new Fix();
    o_fix.name = name.toUpperCase();
    o_fix.gLabel.text = o_fix.name;
    o_fix.latitude = latitude;
    o_fix.longitude = longitude;
    o_fix.setScreenPosition();
    o_fix.show(true, false);
    o_fix.showLabel(true, false);
    var f = fixes.length;
    fixes[f] = o_fix;
    return o_fix;
}

function updateFixes() {
    for (f=0; f < fixes.length; f++) {
        fixes[f].getDisplayData(currentScale);
    }
}
