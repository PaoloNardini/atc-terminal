/* The runway object */
function Runway() {

    this.Container_constructor();

    // General runway data
    // this.id = Math.floor(Math.random() * 999999);
    this.icao = '';
    this.name = '';         // Runway name
    this.label1 = '';       // Runway indicator on the screen (main direction)
    this.label2 = '';       // Runway indicator on the screen (opposite direction)
    this.type = 0;          // See const RWY_TYPE...
    this.heading = 0;       // Runway main orientation
    this.category = 0;      // See const RWY_CAT...
    this.strip_length = 0;        // Length in feet
    this.strip_width = 0;         // Width in feet
    this.runway_visible = true;
    this.centerline_visible = true;

    // Runway End
    this.latitude = 0;
    this.longitude = 0;
    this.x = 0;
    this.y = 0;

    this.latitude_end = 0;
    this.longitude_end = 0;

    this.zoom_min = -9999;  // Min. visible zoom
    this.zoom_max = 9999;   // Max. visible zoom

    // Runway status
    this.active = true;
    this.takeoff = true;
    this.landing = true;

    // Flight Director Data
    this.last_takeoff_time = 0;
    this.last_landing_time = 0;
    this.last_arrival_time = 0;

    // Graphic object
    // this.gDraw = new createjs.Container();
    this.cRunway = new createjs.Container();
    this.cCenterline = new createjs.Container();

    /*
    this.gLabel1 = new createjs.Text("", "normal 10px Courier", RWY_TEXT_COLOR);
    this.gLabel1.x = 6;
    this.gLabel1.y = -5;
    this.gLabel1.lineHeight = 9;

    this.gLabel2 = new createjs.Text("", "normal 8px Courier", RWY_TEXT_COLOR);
    this.gLabel2.x = 6;
    this.gLabel2.y = -5;
    this.gLabel2.lineHeight = 9;
    */

    this.gRwy = new createjs.Shape();
    this.gRwy.name = this.id;
    this.gRwy.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(0,0).lineTo(1,1).endStroke();

    // this.cRunway.addChild(this.gLabel1, this.gLabel2, this.gRwy);
    this.cRunway.addChild(this.gRwy);

    // this.gDraw.addChild(this.gRwy, this.gLabel1, this.gLabel2);
    // this.addChild(this.gRwy, this.gLabel1, this.gLabel2);

    this.gCenterLine = new createjs.Shape();
    this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(FIX_BODY_COLOR).moveTo(0,0).lineTo(1,1).endStroke();

    this.cCenterline.addChild(this.gCenterLine);

    // this.cRunway.addChild(this.cRunway, this.cCenterline);
    this.addChild(this.cRunway, this.cCenterline);

    this.on("click", function(event) {
        // TEST ONLY
        alert('Runway Clicked:' + event.currentTarget.name + ' - ' + this.label1);
    })
}
createjs.extend(Runway, createjs.Container);
createjs.promote(Runway, "Container");


Runway.prototype.setX = function ( x ) {
    this.x = x;
}

Runway.prototype.setY = function ( y ) {
    this.y = y;
}

Runway.prototype.setScreenPosition = function() {

    var length_miles = Math.feetToMiles(this.strip_length);

    var threshold1 = Math.coordsToScreen( this.latitude, this.longitude);

    // this.setX(threshold1.x);
    // this.setY(threshold1.y);

    // var opposite =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, length_miles);
    // var threshold2 = Math.coordsToScreen( opposite.lat, opposite.lon);

    // console.log(this.latitude, this.longitude, threshold1.lat, threshold1.lon);

    this.plotRunway();
    // this.gRwy.graphics.clear();
    // this.gRwy.graphics.setStrokeStyle(3).beginStroke(RWY_BODY_COLOR).moveTo(0,0).lineTo(threshold2.x - threshold1.x,threshold2.y - threshold1.y).endStroke();

    /*
    this.gLabel1.x = -10;
    this.gLabel1.y = -10;

    this.gLabel2.x = -10;
    this.gLabel2.y = -10;
    this.gLabel2.text = this.label2; // + '\n' + this.heading + '\n' + this.length; // + '('+ length_miles+')';
    */

    var centerline =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, Math.inverseBearing(this.heading), RWY_CENTERLINE_LENGTH);
    centerlineXY = Math.coordsToScreen( centerline.lat, centerline.lon);
    var cl1Y = centerlineXY.y;
    var cl1X = centerlineXY.x;

    // var cl1Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - cl1.lat)  * MILESFACT ));
    // var cl1X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - cl1.lon)  * MILESFACT ));
    // var cl2 =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, (180 + this.heading) % 360, RWY_CENTERLINE_LENGTH);
    // var cl2Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - cl2.lat)  * MILESFACT ));
    // var cl2X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - cl2.lon)  * MILESFACT ));


    this.gCenterLine.graphics.clear();
    // this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(RWY_CENTERLINE_COLOR).dashedLineTo(cl1X-th1X, cl1Y-th1Y, cl2X-th1X, cl2Y-th1Y, 3).endStroke();
    this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(RWY_CENTERLINE_COLOR).setStrokeDash([5,5],0).moveTo(0,0).lineTo(centerlineXY.x - threshold1.x, centerlineXY.y - threshold1.y, 3).endStroke();
    // this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(RWY_CENTERLINE_COLOR).dashedLineTo(threshold1.x,threshold1.y, cl1X, cl1Y, 3).endStroke();
}

Runway.prototype.plotRunway = function() {

    if (this.latitude_end == 0 || this.longitude_end == 0) {
        return;
    }
    var color;
    if (!this.active) {
        color = RWY_INACTIVE_BODY_COLOR;
    }
    else if (this.landing && this.takeoff) {
        color = RWY_BODY_COLOR;
    }
    else if (!this.landing && this.takeoff) {
        color = RWY_TAKEOFF_BODY_COLOR;
    }
    else if (this.landing && !this.takeoff) {
        color = RWY_LANDING_BODY_COLOR;
    }
    else {
        this.active = false;
        color = RWY_INACTIVE_BODY_COLOR;
    }

    var length_miles = Math.feetToMiles(this.strip_length);
    var threshold1 = Math.coordsToScreen( this.latitude, this.longitude);
    this.setX(threshold1.x);
    this.setY(threshold1.y);
    // var opposite =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, length_miles / 1);
    // var threshold2 = Math.coordsToScreen( opposite.lat, opposite.lon);
    var middle = Math.middlePoint(this.latitude, this.longitude, this.latitude_end, this.longitude_end);
    var threshold2 = Math.coordsToScreen( middle.lat, middle.lon);
    this.gRwy.graphics.clear();
    this.gRwy.graphics.setStrokeStyle(2).beginStroke(color).moveTo(0,0).lineTo(threshold2.x - threshold1.x,threshold2.y - threshold1.y).endStroke();
}

Runway.prototype.showRunway = function(visible) {
    this.runway_visible = visible;
    this.cRunway.visible = visible;
}

/*
Runway.prototype.showLabels = function(visible) {
    this.gLabel1.visible = visible;
    this.gLabel2.visible = visible;
}
*/

Runway.prototype.showCenterline = function(visible) {
    this.centerline_visible = visible;
    this.cCenterline.visible = visible;
}

Runway.prototype.landingEnable = function (onoff) {
    this.landing = onoff;
    this.plotRunway();
}

Runway.prototype.takeoffEnable = function (onoff) {
    this.takeoff = onoff;
    this.plotRunway();
}

Runway.prototype.runwayActive = function (onoff) {
    this.active = onoff;
    console.log('Runway ' + this.label1 + ' active =  ' + onoff);
    this.plotRunway();
}
