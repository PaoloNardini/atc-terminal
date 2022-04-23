/// <reference path="../../../node_modules/@types/easeljs/index.d.ts" />
import * as constants from '../../../src/core/constants'


export class Main {

    mainStage: createjs.Stage
    mainContainer: createjs.Container

    constructor() {
        this.mainStage  = new createjs.Stage("mainCanvas");
        // const arrStage     = new createjs.Stage("arrStripsCanvas");
        // const depStage     = new createjs.Stage("depStripsCanvas");
        // const consoleStage = new createjs.Stage("consoleCanvas");

        // Main container
        this.mainContainer = new createjs.Container();
        // mainContainer.id = 'mainContainer';

    }

    tickFunction = (event: any) => {
        void event
        console.log('tick')
        this.mainStage.update()
    }
    
    init = () => {
        this.mainStage.addChild(this.mainContainer);
        const planeGr = new PlaneGraphic()
        planeGr.x = 100
        planeGr.y = 100
        this.mainContainer.addChild(planeGr)
    
        createjs.Ticker.on("tick", this.tickFunction);
        createjs.Ticker.framerate = 3;
    }
}


export class PlaneGraphic extends createjs.Container {

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
}
// createjs.extend(Plane, createjs.Container);
// createjs.promote(Plane, "Container");

