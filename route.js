/* The Route object */
function Route() {

    this.Container_constructor();

    // Identification
    this.icao = '';     // airport
    this.name = '';
    this.name2 = '';
    this.type_number = 0;
    this.type = '';     // SID / STAR /APPTR / FINAL / ATS
    this.label = '';
    this.finalFix = '';
    this.mapFix = '';   // Missed Approach Fix
    this.runway = '';   // runway dep/arr indicator

    // Graphic objects
    /*
    this.gLabel = new createjs.Text("", "normal 13px Courier", ROUTE_TEXT_COLOR);
    this.gLabel.x = 3;
    this.gLabel.y = 0;
    this.gLabel.lineHeight = 14

    this.gBox = new createjs.Shape();
    var w = 50;
    var h = 14;
    this.gBox.graphics.setStrokeStyle(1).beginStroke(ROUTE_BOX_COLOR).beginFill(ROUTE_BOX_COLOR).moveTo(0,0).lineTo(0,h).lineTo(w,h).lineTo(w,0).lineTo(0,0).endStroke();

    this.addChild(this.gBox, this.gLabel);
    */

    // Route data
    this.legs = [];
    this.tracks = [];
    this.fix_next = -1;
    this.labels = [];
}
createjs.extend(Route, createjs.Container);
createjs.promote(Route, "Container");

Route.prototype.setX = function ( x ) {
    this.x = x;
}

Route.prototype.setY = function ( y ) {
    this.y = y;
}


Route.prototype.setScreenPosition = function(scale) {

    if (this.legs.length < 2) {
        this.visible = false;
        return;
    }
    this.visible = true;
    for (var leg=0; leg < this.legs.length; leg += 2) {
        var heading;
        var rotation;
        // var half = Math.floor(this.legs.length / 2)-1;
        if (leg+1 >= this.legs.length) {
            return;
        }
        var middle = Math.middlePoint(this.legs[leg].latitude, this.legs[leg].longitude, this.legs[leg + 1].latitude, this.legs[leg + 1].longitude);
        var t1 = Math.coordsToScreen(middle.lat, middle.lon);
        heading = this.legs[leg].heading;
        if (heading > 0 && heading <= 90) {
            rotation = heading + 274;
        }
        else if (heading > 90 && heading <= 180) {
            rotation = heading - 93;
        }
        else if (heading > 180 && heading <= 270) {
            rotation = heading + 92;
        }
        else if (heading > 270 && heading <= 360) {
            rotation = heading - 274
        }
        else {
            rotation = heading;
        }

        var label = new RouteLabel();
        label.setScale(scale);
        label.setRotation(rotation);
        if (heading > 180) {
            label.setLabel(this.name + ' >');
            label.setPosition(t1.x, t1.y - 17)
        }
        else {
            label.setLabel('< ' + this.name);
            label.setPosition(t1.x, t1.y + 7)
        }

        this.labels[this.labels.length] = label;
        this.addChild(label);
    }
}

Route.prototype.setScale = function(scale) {
    for (l=0; l<this.labels.length; l++) {
        this.labels[l].setScale(scale);
    }
}

Route.prototype.showLabels = function(onoff) {
    for (var l=0; l < this.labels.length; l++) {
        if (onoff) {
            this.labels[l].visible = true;
        }
        else {
            this.labels[l].visible = false;
        }
    }
}

Route.prototype.clear = function() {
    this.tracks = [];
    this.legs = [];
    this.labels = [];
}

Route.prototype.getLegs = function() {
    return this.legs;
}

Route.prototype.getLegsNumber = function() {
    return this.legs.length;
}

Route.prototype.getLeg = function(num) {
    if (num <= this.legs.length) {
        return this.legs[num];
    }
    else {
        return undefined;
    }
}

Route.prototype.addFix = function(fix) {
    var w = new Track();
    w.setFix(fix);
    this.tracks[this.tracks.length] = w;
}

Route.prototype.addFixTrack = function(fix_from, fix_to) {
    if (fix_from != this.tracks[this.tracks.length-1].fix) {
        var w_from = new Track();
        w_from.setfix(fix_from);
        this.tracks[this.tracks.length] = w_from;
    }
    var w_to = new Track();
    w_to.setFix(fix_to);
    this.tracks[this.tracks.length] = w_to;
}

Route.prototype.addFreeTrack = function(heading, distance) {

}

Route.prototype.addLeg = function(o_step) {
    var s = this.legs.length;
    this.legs[s] = o_step;
}

Route.prototype.newTrack = function(fix) {
    this.tracks = [];
    this.tracks[0] = fix;
    this.refreshRoute();
    this.goTo(fix);
}


Route.prototype.addTrack = function(fix) {
    this.tracks[this.tracks.length] = fix;
    this.refreshRoute();
}

Route.prototype.refreshRoute = function() {
    this.route = [];
    for (var w=0; w<this.tracks.length; w++) {
        this.route[w] = fixes[this.tracks[w]].label;
    }
}

/* Check distance of plane from a fix */
Route.prototype.checkFixDistance = function(fix) {
    var newCoords = new LatLon(this.latitude, this.longitude);
    var nextFixCoords = new LatLon(fixes[this.fix_next].latitude, fixes[this.fix_next].longitude);
    return Math.metersToMiles(newCoords.distanceTo(nextFixCoords));
}

/* Check if plane is near a fix (less than 1 mile) */
Route.prototype.checkNearFix = function(fix) {
    return (this.checkFixDistance(fix) < 1);
}

Route.prototype.showRoute = function() {

}

Route.prototype.hideRoute = function() {

}


function RouteLabel() {

    this.Container_constructor();

    // Graphic objects
    this.gLabel = new createjs.Text("", "normal 13px Courier", ROUTE_TEXT_COLOR);
    this.gLabel.x = 3;
    this.gLabel.y = 0;
    this.gLabel.lineHeight = 14

    this.gBox = new createjs.Shape();
    var w = 60;
    var h = 14;
    this.gBox.graphics.setStrokeStyle(1).beginStroke(ROUTE_BOX_COLOR).beginFill(ROUTE_BOX_COLOR).moveTo(0,0).lineTo(0,h).lineTo(w,h).lineTo(w,0).lineTo(0,0).endStroke();

    this.addChild(this.gBox, this.gLabel);

}
createjs.extend(RouteLabel, createjs.Container);
createjs.promote(RouteLabel, "Container");


RouteLabel.prototype.setPosition = function(x,y) {
    this.x = x; // + ((Math.random() * 50) - 100);
    this.y = y;
}

RouteLabel.prototype.setLabel = function(label) {
    this.gLabel.text = label;
}

RouteLabel.prototype.setScale = function(scale) {
    if (scale < 2.5) {
        scale = scale * 1.2;
    }
    else {
        scale = scale * 0.9;
    }
    this.scaleX = scale;
    this.scaleY = scale;
}

RouteLabel.prototype.setRotation = function(rotation) {
    this.rotation = rotation;
}
