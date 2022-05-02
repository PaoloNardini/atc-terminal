import * as constants from '../../../src/core/constants'
import { Parameters } from '../../../src/core/entities'
import * as geomath from '../../../src/helpers/geomath'

export class GridGraphic extends createjs.Container {

    p1_latitude = 0;
    p1_longitude = 0;
    p2_latitude = 0;
    p2_longitude = 0;
    visible = true;

    // Graphic object
    gLabel: createjs.Text
    gLine: createjs.Shape

    constructor() {
        super()
        this.gLabel = new createjs.Text("", "normal 10px Courier", constants.RWY_TEXT_COLOR);
        this.gLabel.x = -20;
        this.gLabel.y = -10;
        this.gLabel.lineHeight = 9;
    
        this.gLine = new createjs.Shape();
        this.gLine.x = 0;
        this.gLine.y = 0;
    
        this.gLine.graphics.setStrokeStyle(1).beginStroke(constants.GRID_COLOR).moveTo(0,0).lineTo(1,1).endStroke();
        super.addChild(this.gLine, this.gLabel)
    }


    setPosition(parameters: Parameters) {
        var gridP1 = geomath.coordsToScreen(this.p1_latitude, this.p1_longitude, parameters)
        var gridP2 = geomath.coordsToScreen(this.p2_latitude, this.p2_longitude, parameters)

        this.x = gridP1.x;
        this.y = gridP1.y;

        this.gLine.graphics.clear();
        this.gLine.graphics.setStrokeStyle(3).beginStroke(constants.GRID_COLOR).moveTo(0,0).lineTo(gridP2.x - gridP1.x, gridP2.y - gridP1.y).endStroke();

        this.gLabel.text = `${this.p1_latitude} - ${this.p1_longitude}`
        this.gLabel.scaleX = this.gLabel.scaleY = 1.5
    }
}
