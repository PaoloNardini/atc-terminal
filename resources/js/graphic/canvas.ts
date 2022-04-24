/// <reference path="../../../node_modules/@types/easeljs/index.d.ts" />
import * as constants from '../../../src/core/constants'
import { Parameters } from '../../../src/core/entities'
import { PlaneGraphic } from './plane'
import { Runway } from './runway'

export class Main {

    mainStage: createjs.Stage
    mainContainer: createjs.Container
    parameters: Parameters

    constructor() {
        void constants
        this.mainStage  = new createjs.Stage("mainCanvas");
        // const arrStage     = new createjs.Stage("arrStripsCanvas");
        // const depStage     = new createjs.Stage("depStripsCanvas");
        // const consoleStage = new createjs.Stage("consoleCanvas");

        // Main container
        this.mainContainer = new createjs.Container();
        // mainContainer.id = 'mainContainer';

        this.parameters = new Parameters

        // console.log(this.parameters.maxArrivals)

    }

    tickFunction = (event: any) => {
        void event
        // console.log('tick')
        this.mainStage.update()
    }
    
    init = () => {
        this.mainStage.addChild(this.mainContainer);
        const planeGr = new PlaneGraphic()
        planeGr.x = 100
        planeGr.y = 100
        this.mainContainer.addChild(planeGr)

        const runwayGr = new Runway()
        runwayGr.latitude = 10
        runwayGr.longitude = 10
        runwayGr.latitude_end = 12
        runwayGr.longitude_end = 12
        this.mainContainer.addChild(runwayGr)
        runwayGr.plotRunway(this.parameters)
    
        createjs.Ticker.on("tick", this.tickFunction);
        createjs.Ticker.framerate = 3;
    }
}
