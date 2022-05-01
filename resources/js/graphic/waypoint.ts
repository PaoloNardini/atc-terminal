import * as constants from '../../../src/core/constants'
import { NavaidType, Parameters, Waypoint } from '../../../src/core/entities'
// import { Coordinate, Level, Speed } from '../../../src/core/valueObjects'
import * as geomath from '../../../src/helpers/geomath'

export class WaypointGraphic extends createjs.Container {

    waypoint: Waypoint

    // Graphic object
    gBox: createjs.Shape
    gLabel: createjs.Text

    constructor(waypoint: Waypoint) {
        super()
        this.waypoint = waypoint
        this.gBox = new createjs.Shape()
        this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke()
        this.gLabel = new createjs.Text("", "normal 10px Courier", constants.FIX_TEXT_COLOR)
        super.addChild(this.gBox, this.gLabel)
    }

    /*
    setPosition(parameters: Parameters) {
        var coords = geomath.coordsToScreen(this.waypoint.latitude, this.waypoint.longitude, parameters)
        this.x = coords.y
        this.y = coords.x
    }
    */

    display(parameters: Parameters ) {

        const scale = parameters.currentScale + 0.4 / 1.2;
        this.gBox.scaleX = scale; //  / 1.5;
        this.gBox.scaleY = scale; // / 1.5;
        this.gLabel.scaleX = scale;
        this.gLabel.scaleY = scale;
    
        this.gBox.graphics.clear();
        this.gLabel.text = this.waypoint.label

        if (this.waypoint.isNavaid) {
            if (this.waypoint.navaidType == NavaidType.NAVAID_TYPE_NDB) {
                this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
            }
            else if (this.waypoint.navaidType  == NavaidType.NAVAID_TYPE_VORDMENDB || this.waypoint.navaidType  == NavaidType.NAVAID_TYPE_VORDME) {
                // console.log(`${this.waypoint.name}: ${this.waypoint.latitude} / ${this.waypoint.longitude}`)
                this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).drawCircle(0, 0, 7).beginFill(constants.FIX_BODY_COLOR).moveTo(-4, 4).lineTo(0, -4).lineTo(4, 4).lineTo(-4, 4).endStroke();
            }
            else {
                this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).beginFill(constants.FIX_BODY_COLOR).moveTo(-2, 2).lineTo(0, -2).lineTo(2, 2).lineTo(-2, 2).endStroke();
            }
        }
        else if (this.waypoint.isAts) {
            this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).beginFill(constants.FIX_BODY_COLOR).moveTo(-4,4).lineTo(0,-4).lineTo(4,4).lineTo(-4,4).endStroke();
        }
        else if (this.waypoint.isFix) {
            var c = this.waypoint.useCounter;
            if (c<4) c = 4;
            if (c>4) c = 5;
            this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).moveTo(-c,c).lineTo(0,-c).lineTo(c,c).lineTo(-c,c).endStroke();
        }
        else {
            this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).moveTo(-3,3).lineTo(0,-3).lineTo(3,3).lineTo(-3,3).endStroke();
            this.gLabel.scaleX = scale * 0.9;
            this.gLabel.scaleY = scale * 0.9;
        }
        if (this.waypoint.labelVisibleTemp) {
            this.gLabel.color = "rgba(255,255,0,1)";
            this.gLabel.scaleX = scale * 1.5;
            this.gLabel.scaleY = scale * 1.5;
        }
        else {
            this.gLabel.color = constants.FIX_TEXT_COLOR;
        }
        var coords = geomath.coordsToScreen(this.waypoint.latitude, this.waypoint.longitude, parameters)
        this.x = coords.y
        this.y = coords.x
        // this.setPosition(parameters);
    }    
}

