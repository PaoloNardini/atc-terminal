import * as constants from '../../../src/core/constants'
import { Parameters } from '../../../src/core/entities'
import * as geomath from '../math/geomath'

export class PlaneGraphic extends createjs.Container {

    latitude: number = 0
    longitude: number = 0

    gBox: createjs.Shape
    gTail: createjs.Shape
    gLabel: createjs.Text
    gLabelConnector: createjs.Shape

    // Graphic data
    // x: number = (Math.random() * 1000);
    // y: number = (Math.random() * 500);
    connectorX: number = 25;
    connectorY: number = -5;
    connectorDeg: number = 45;     // Degrees of label connector

    constructor() {
        super()
        this.gBox = new createjs.Shape()
        this.gTail = new createjs.Shape()
        this.gBox.graphics.setStrokeStyle(1).beginStroke(constants.PLANE_BODY_COLOR).dr(0,0,6,6);
        this.gLabel = new createjs.Text("TEST", "normal 10px Courier", constants.PLANE_TEXT_COLOR)
        this.gLabelConnector = new createjs.Shape()
        super.addChild(this.gBox, this.gTail, this.gLabel, this.gLabelConnector);
    }

    setPosition(parameters: Parameters) {
        var coords = geomath.coordsToScreen(this.latitude, this.longitude, parameters)
        this.x = coords.y
        this.y = coords.x
    }
    
}
// createjs.extend(Plane, createjs.Container);
// createjs.promote(Plane, "Container");

