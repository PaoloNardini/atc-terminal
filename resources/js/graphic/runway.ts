import * as constants from '../../../src/core/constants'
import * as math from '../math/math'
import { Parameters } from '../../../src/core/entities/Parameters'

export class Runway extends createjs.Container {

    // this.Container_constructor();

    // General runway data
    // this.id = Math.floor(Math.random() * 999999);
    icao = '';
    name = '';         // Runway name
    label1 = '';       // Runway indicator on the screen (main direction)
    label2 = '';       // Runway indicator on the screen (opposite direction)
    type = 0;          // See const RWY_TYPE...
    heading = 0;       // Runway main orientation
    category = 0;      // See const RWY_CAT...
    strip_length = 0;        // Length in feet
    strip_width = 0;         // Width in feet
    runway_visible: boolean = true;
    centerline_visible: boolean = true;

    // Runway End
    latitude = 0;
    longitude = 0;
    x = 0;
    y = 0;

    latitude_end = 0;
    longitude_end = 0;

    zoom_min = -9999;  // Min. visible zoom
    zoom_max = 9999;   // Max. visible zoom

    // Runway status
    active = true;
    takeoff = true;
    landing = true;

    // Flight Director Data
    last_takeoff_time = 0;
    last_landing_time = 0;
    last_arrival_time = 0;

    // Graphic object
    // this.gDraw = new createjs.Container();
    cRunway: createjs.Container
    cCenterline: createjs.Container

    gRwy: createjs.Shape
    // this.gDraw.addChild(this.gRwy, this.gLabel1, this.gLabel2);
    // this.addChild(this.gRwy, this.gLabel1, this.gLabel2);

    gCenterLine: createjs.Shape


    constructor() {
        super()
        this.cRunway = new createjs.Container();
        this.cCenterline = new createjs.Container();
        this.gRwy = new createjs.Shape();
        this.gRwy.name = `${this.id}`;

        this.gRwy.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).moveTo(0,0).lineTo(1,1).endStroke();

        // this.cRunway.addChild(this.gLabel1, this.gLabel2, this.gRwy);
        this.cRunway.addChild(this.gRwy);
    
        this.gCenterLine = new createjs.Shape()
        this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).moveTo(0,0).lineTo(1,1).endStroke();

        this.cCenterline.addChild(this.gCenterLine);
    
        // this.cRunway.addChild(this.cRunway, this.cCenterline);
        this.addChild(this.cRunway, this.cCenterline);

        /*
        this.on("click", function(event: any) {
            // TEST ONLY
            alert('Runway Clicked:' + event.currentTarget.name + ' - ' + this.label1);
        })
        */
    }

    setX( x:number ) {
        this.x = x;
    }
    
    setY( y:number ) {
        this.y = y;
    }

    plotRunway(parameters: Parameters) {

        if (this.latitude_end == 0 || this.longitude_end == 0) {
            return;
        }
        var color;
        if (!this.active) {
            color = constants.RWY_INACTIVE_BODY_COLOR;
        }
        else if (this.landing && this.takeoff) {
            color = constants.RWY_BODY_COLOR;
        }
        else if (!this.landing && this.takeoff) {
            color = constants.RWY_TAKEOFF_BODY_COLOR;
        }
        else if (this.landing && !this.takeoff) {
            color = constants.RWY_LANDING_BODY_COLOR;
        }
        else {
            this.active = false;
            color = constants.RWY_INACTIVE_BODY_COLOR;
        }
    
        // var length_miles = math.feetToMiles(this.strip_length);
        var threshold1 = math.coordsToScreen( this.latitude, this.longitude, parameters);
        this.setX(threshold1.x);
        this.setY(threshold1.y);
        // var opposite =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, length_miles / 1);
        // var threshold2 = Math.coordsToScreen( opposite.lat, opposite.lon);
        var middle = math.middlePoint(this.latitude, this.longitude, this.latitude_end, this.longitude_end);
        var threshold2 = math.coordsToScreen( middle.lat, middle.lon, parameters);
        this.gRwy.graphics.clear();
        this.gRwy.graphics.setStrokeStyle(2).beginStroke(color).moveTo(0,0).lineTo(threshold2.x - threshold1.x,threshold2.y - threshold1.y).endStroke();
    }
    
    showRunway(visible: boolean) {
        this.runway_visible = visible;
        this.cRunway.visible = visible;
    }
    
    showCenterline(visible: boolean) {
        this.centerline_visible = visible;
        this.cCenterline.visible = visible;
    }
    
    /*
    landingEnable(onoff) {
        this.landing = onoff;
        this.plotRunway();
    }
    
    takeoffEnable(onoff) {
        this.takeoff = onoff;
        this.plotRunway();
    }
    
    runwayActive(onoff) {
        this.active = onoff;
        console.log('Runway ' + this.label1 + ' active =  ' + onoff);
        this.plotRunway();
    }
    */

    setScreenPosition(parameters: Parameters) {

        // var length_miles = math.feetToMiles(this.strip_length);
    
        var threshold1 = math.coordsToScreen( this.latitude, this.longitude, parameters);
    
        // this.setX(threshold1.x);
        // this.setY(threshold1.y);
    
        // var opposite =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, this.heading, length_miles);
        // var threshold2 = Math.coordsToScreen( opposite.lat, opposite.lon);
    
        // console.log(this.latitude, this.longitude, threshold1.lat, threshold1.lon);
    
        this.plotRunway(parameters);
        // this.gRwy.graphics.clear();
        // this.gRwy.graphics.setStrokeStyle(3).beginStroke(RWY_BODY_COLOR).moveTo(0,0).lineTo(threshold2.x - threshold1.x,threshold2.y - threshold1.y).endStroke();
    
        /*
        this.gLabel1.x = -10;
        this.gLabel1.y = -10;
    
        this.gLabel2.x = -10;
        this.gLabel2.y = -10;
        this.gLabel2.text = this.label2; // + '\n' + this.heading + '\n' + this.length; // + '('+ length_miles+')';
        */
    
        var centerline =  math.coordsFromCoarseDistance(this.latitude, this.longitude, math.inverseBearing(this.heading), constants.RWY_CENTERLINE_LENGTH);
        var centerlineXY = math.coordsToScreen( centerline.lat, centerline.lon, parameters);
        // var cl1Y = centerlineXY.y;
        // var cl1X = centerlineXY.x;
    
        // var cl1Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - cl1.lat)  * MILESFACT ));
        // var cl1X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - cl1.lon)  * MILESFACT ));
        // var cl2 =  Math.coordsFromCoarseDistance(this.latitude, this.longitude, (180 + this.heading) % 360, RWY_CENTERLINE_LENGTH);
        // var cl2Y = (SCREEN_CENTER_Y - ((LATITUDE_CENTER - cl2.lat)  * MILESFACT ));
        // var cl2X = (SCREEN_CENTER_X - ((LONGITUDE_CENTER - cl2.lon)  * MILESFACT ));
    
    
        this.gCenterLine.graphics.clear();
        // this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(RWY_CENTERLINE_COLOR).dashedLineTo(cl1X-th1X, cl1Y-th1Y, cl2X-th1X, cl2Y-th1Y, 3).endStroke();
        this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(constants.RWY_CENTERLINE_COLOR).setStrokeDash([5,5],0).moveTo(0,0).lineTo(centerlineXY.x - threshold1.x, centerlineXY.y - threshold1.y).endStroke();
        // this.gCenterLine.graphics.setStrokeStyle(1).beginStroke(RWY_CENTERLINE_COLOR).dashedLineTo(threshold1.x,threshold1.y, cl1X, cl1Y, 3).endStroke();
    }
    
    
}
// createjs.extend(Runway, createjs.Container);
// createjs.promote(Runway, "Container");



