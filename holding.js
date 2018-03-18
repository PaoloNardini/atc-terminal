/* The holding object */
function Holding() {

    this.Container_constructor();

    // Holding points
    this.holding_fix = undefined;       // identifier of holding fix
    this.o_fix = undefined;             // fix object
    this.holding_radial = undefined;
    this.holding_leg_distance = undefined;
    this.holding_turn_direction = undefined;
    this.holding_points = [];


    this.gHolding = new createjs.Shape();

    this.addChild(this.gHolding);
    // this.setBounds(0,0,STRIP_WIDTH,STRIP_HEIGHT);
}
createjs.extend(Holding, createjs.Container);
createjs.promote(Holding, "Container");

Holding.prototype.setX = function ( x ) {
    this.x = x;
}

Holding.prototype.setY = function ( y ) {
    this.y = y;
}

Holding.prototype.setPattern = function(identifier, inbound_radial, leg_distance, turn_direction ) {

    this.o_fix  = findFixById(identifier);
    if (this.o_fix == undefined) {
        return false;
    }
    this.holding_fix  = identifier;
    this.holding_radial = inbound_radial;
    this.holding_leg_distance = leg_distance;
    this.holding_turn_direction = turn_direction;

    // Compute 4 points of holding
    var radial_perpendicular;
    if (this.holding_turn_direction == 2) {
        radial_perpendicular = inbound_radial - 90;
        if (radial_perpendicular < 0) {
            radial_perpendicular = 360 + radial_perpendicular;
        }
    }
    else {
        radial_perpendicular = (inbound_radial + 90) % 360;
    }
    console.log('HOLDING radial=' + inbound_radial + '  perpendicular=' + radial_perpendicular);
    var hp1 = new LatLon(this.o_fix.latitude, this.o_fix.longitude);
    var hp2 = Math.coordsFromCoarseDistance(hp1.lat, hp1.lon, radial_perpendicular, leg_distance / 2);
    var hp3 = Math.coordsFromCoarseDistance(hp2.lat, hp2.lon, inbound_radial, leg_distance);
    var hp4 = Math.coordsFromCoarseDistance(hp1.lat, hp1.lon, inbound_radial, leg_distance);
    this.holding_points[0] = hp1;
    this.holding_points[1] = hp2;
    this.holding_points[2] = hp3;
    this.holding_points[3] = hp4;

    // Compute holding on screen
    /*
    this.gHolding.graphics.clear();
    this.gHolding.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
    this.gHolding.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).beginFill(FIX_BODY_COLOR).moveTo(-6, 6).lineTo(0, -6).lineTo(6, 6).lineTo(-6, 6).endStroke();
    */

    var coords1 = Math.coordsToScreen( hp1.lat, hp1.lon);
    var coords2 = Math.coordsToScreen( hp2.lat, hp2.lon);
    var coords3 = Math.coordsToScreen( hp3.lat, hp3.lon);
    var coords4 = Math.coordsToScreen( hp4.lat, hp4.lon);

    var x1 = coords1.x;
    var y1 = coords1.y;

    var x2 = coords2.x - x1;
    var y2 = coords2.y - y1;

    var x3 = coords3.x - x1;
    var y3 = coords3.y - y1;

    var x4 = coords4.x - x1;
    var y4 = coords4.y - y1;

    this.setY(coords1.y);
    this.setX(coords1.x);

    this.gHolding.graphics.clear();
    this.gHolding.graphics.setStrokeStyle(1)
        .beginStroke(HOLDING_COLOR)
        .setStrokeDash([5,5],0)
        .arcTo(0,0,x2,y2,15)
        .arcTo(x2,y2,x3,y3,15)
        .arcTo(x3,y3,x4,y4,15)
        .arcTo(x4,y4,0,0,15)
        .arcTo(0,0,x2,y2,15)
        // .arcTo(x1,y1,x2,y2,15)
        .endStroke();

}

Holding.prototype.setScreenPosition = function() {
    this.gBox.graphics.clear();


    if (this.type == FIX_TYPE_NDB) {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
    }
    else {
        this.gBox.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).beginFill(FIX_BODY_COLOR).moveTo(-6, 6).lineTo(0, -6).lineTo(6, 6).lineTo(-6, 6).endStroke();
    }
    var coords = Math.coordsToScreen( this.latitude, this.longitude);
    this.setY(coords.y);
    this.setX(coords.x);


    var t1 = Math.coordsToScreen( this.from_latitude, this.from_longitude);

    this.setX(t1.x);
    this.setY(t1.y);

    var t2 = Math.coordsToScreen( this.to_latitude, this.to_longitude);

    this.to_x = t2.x - t1.x;
    this.to_y = t2.y - t1.y;

    this.gTrack.graphics.clear();
    this.gTrack.graphics.setStrokeStyle(2).beginStroke(PLANE_BODY_COLOR).setStrokeDash([5,5],0).moveTo(0,0).lineTo(this.to_x, this.to_y).endStroke();

}

Holding.prototype.show = function(visible) {
    this.visible = visible;
}
