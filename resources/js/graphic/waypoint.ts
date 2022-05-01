import * as constants from '../../../src/core/constants'
import { NavaidType, Parameters, Waypoint } from '../../../src/core/entities'
// import { Coordinate, Level, Speed } from '../../../src/core/valueObjects'
import * as geomath from '../../../src/helpers/geomath'

export class WaypointGraphic extends createjs.Container {

    waypoint: Waypoint
    /*
    type: WaypointType = WaypointType.WAYPOINT_TYPE_FIX
    name: string = ''
    label: string  = ''
    latitude: number = 0
    longitude: number = 0 
    coordinate?: Coordinate
    useCounter: number = 0

    visible: boolean = false 
    labelVisible: boolean = false
    visibleTemp: boolean = false
    labelVisibleTemp: boolean = false
    isNavaid: boolean = false
    isFix: boolean = false
    isWaypoint: boolean = false
    isRunway: boolean = false
    isAts: boolean = false
    isNavaidVisible: boolean = false
    isFixVisible: boolean = false
    isWaypointVisible: boolean = false
    isRunwayVisible: boolean = false
    isAtsVisible: boolean = false

    freq: number | undefined

    // Navaid specific attributes
    navaidType: NavaidType | undefined
    mea?: Level           // Minimum enroute altitude (in feet)
    min_speed?: Speed     // Minimum speed
    max_speed?: Speed     // Maximum speed
    // release: boolean = false  // Is it a release point to/from other ATC?
    // visible: boolean = false    // Default visibility
    altitude: number | undefined
    isRouteFix: boolean = false
    */
   

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

    setPosition(parameters: Parameters) {
        var coords = geomath.coordsToScreen(this.waypoint.latitude, this.waypoint.longitude, parameters)
        this.x = coords.y
        this.y = coords.x
    }

    display(parameters: Parameters ) {

        const scale = parameters.currentScale + 0.4 / 1.2;
        // scale = scale + 0.4;
        this.gBox.scaleX = scale; //  / 1.5;
        this.gBox.scaleY = scale; // / 1.5;
        this.gLabel.scaleX = scale;
        this.gLabel.scaleY = scale;
    
        this.gBox.graphics.clear();
        if (this.waypoint.isNavaid) {
            if (this.waypoint.navaidType == NavaidType.NAVAID_TYPE_NDB) {
                this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.FIX_BODY_COLOR).drawCircle(0, 0, 6).endStroke();
            }
            else if (this.waypoint.navaidType  == NavaidType.NAVAID_TYPE_VORDMENDB || this.waypoint.navaidType  == NavaidType.NAVAID_TYPE_VORDME) {
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
            this.gLabel.scaleX = scale * 0.8;
            this.gLabel.scaleY = scale * 0.8;
        }
        if (this.waypoint.labelVisibleTemp) {
            this.gLabel.color = "rgba(255,255,0,1)";
            this.gLabel.scaleX = scale * 1.5;
            this.gLabel.scaleY = scale * 1.5;
        }
        else {
            this.gLabel.color = constants.FIX_TEXT_COLOR;
        }
        this.setPosition(parameters);
    }    
}

