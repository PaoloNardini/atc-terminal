/// <reference path="../../../node_modules/@types/easeljs/index.d.ts" />
import * as socket from '../socket'
import * as constants from '../../../src/core/constants'
import { MouseMsg, NavaidType, Runway, SocketMsgType } from '../../../src/core/entities'
import { Parameters, Waypoint } from '../../../src/core/entities'
import { PlaneGraphic } from './plane'
import { RunwayGraphic } from './runway'
import { WaypointGraphic } from './waypoint'
import { Bearing, Coordinate } from '../../../src/core/valueObjects'
import { GridGraphic } from './grid'
// import * as geomath from '../math/geomath'
// import * as mouse from '../controls/mouse'

export class Canvas {

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
    
    init = (socketInstance: socket.SocketFactoryInterface) => {

        var hit = new createjs.Shape();
    	hit.graphics.beginFill("#808080").drawRect(0, 0, 10000, 10000);
    	this.mainContainer.hitArea = hit;
        this.mainContainer.addEventListener('click', function( event: any)  {
            console.log('click', event.stageX, event.stageY, event.delta);
            socketInstance.sendMessage(SocketMsgType.MSG_MOUSE, {
                e: MouseMsg.CLICK,
                x: event.stageX,
                y: event.stageY,
                delta: event.delta
            })
        })

        window.addEventListener('mousewheel', ( event: any ) => {
            console.log('mousewheel',event, event.deltaX, event.deltaY, event.delta);
            var oldScale: number = this.mainContainer.scaleX;
            const delta = (event.deltaY > 0) ? -0.1 : 0.1
            this.mainContainer.scaleX = this.mainContainer.scaleX + delta
            this.mainContainer.scaleY = this.mainContainer.scaleY + delta
            this.updateScale(oldScale)
            console.log('NEW SCALE = ' + oldScale);
            event.preventDefault();
            event.stopImmediatePropagation();
        })

        this.mainContainer.addEventListener('pressmove', ( e: any ) => {
            // console.log(`pressmove (${e.stageX}, ${e.stageY})`);
            // Move stage center position following the mouse
            if (e.stageX < this.parameters.mouseX) {
                this.mainContainer.regX = this.parameters.currentX - ((e.stageX - this.parameters.mouseX) * (1 / this.parameters.currentScale));
            } else {
                this.mainContainer.regX = this.parameters.currentX + ((this.parameters.mouseX - e.stageX) * (1 / this.parameters.currentScale));
            }
            if (e.stageY < this.parameters.mouseY) {
                this.mainContainer.regY = this.parameters.currentY - ((e.stageY - this.parameters.mouseY) * (1 / this.parameters.currentScale));
            } else {
                this.mainContainer.regY = this.parameters.currentY + ((this.parameters.mouseY - e.stageY) * (1 / this.parameters.currentScale));
            }
            console.log(`pressmove: regX:  ${this.mainContainer.regX} regY: ${this.mainContainer.regY}`)
            // updatePlanes(masterTimer);
            this.mainStage.update();

        })
    
        this.mainContainer.addEventListener('pressup', ( e: any ) => {
            console.log(`pressup (${e.stageX}, ${e.stageY})`);
        })
    
        this.mainContainer.addEventListener('mouseup', ( e: any ) => {
            console.log(`mouseup (${e.stageX}, ${e.stageY})`);
        })
    
        this.mainContainer.addEventListener('mousedown', ( e: any ) => {
            // Save current position
            this.parameters.mouseX = e.stageX
            this.parameters.mouseY = e.stageY
            this.parameters.currentX = this.mainContainer.regX
            this.parameters.currentY = this.mainContainer.regY
            console.log(`mousedown (${e.stageX}, ${e.stageY})`);
        })

        // mouse.mouseEventInit()

        this.parameters.latitudeCenter = 41.7
        this.parameters.longitudeCenter = 12.2
        this.parameters.currentScale = 1
        this.mainStage.addChild(this.mainContainer);


        this.addGrid()

        const planeGr = new PlaneGraphic()
        planeGr.latitude = 41.6
        planeGr.longitude = 12.1
        planeGr.setPosition(this.parameters)
        // planeGr.x = 100
        // planeGr.y = 100
        this.mainContainer.addChild(planeGr)

        /*
        const runwayGr = new RunwayGraphic()
        // R,16L,161,12802,197,1,108.100,161,41.845969,12.261494,14,3.00,56,1,0
        // R,34R,341,12802,197,1,111.550,341,41.812444,12.275525,6,3.00,57,1,0
        runwayGr.latitude = 41.845969
        runwayGr.longitude = 12.261494
        runwayGr.latitude_end = 41.812444
        runwayGr.longitude_end = 12.275525
        runwayGr.strip_length = 12802
        runwayGr.strip_width = 197
        runwayGr.heading = 161
        // console.log(`runway heading = ${runwayGr.heading}`)
        this.mainContainer.addChild(runwayGr)
        // runwayGr.plotRunway(this.parameters)
        runwayGr.display(this.parameters)
        */

        const wp = new Waypoint()
        wp.name = 'TEST'
        wp.label = 'TEST1'
        wp.latitude = 41.5
        wp.longitude = 12
        wp.navaidType = NavaidType.NAVAID_TYPE_VORDME
        wp.visible = true
        this.addWaypoint(wp)

        const wp2 = new Waypoint()
        wp2.name = 'TEST2'
        wp2.label = 'TEST2'
        wp2.latitude = 41.7
        wp2.longitude = 12.2
        wp2.navaidType = NavaidType.NAVAID_TYPE_VORDME
        wp2.visible = true
        this.addWaypoint(wp2)

        const rw = new Runway()
        rw.active = true
        rw.coordinate1 = new Coordinate(41.5,12)
        rw.coordinate2 = new Coordinate(41.7,12.2)
        rw.strip_length = 12802
        rw.strip_width = 197
        rw.heading = new Bearing(45)
        this.addRunway(rw)

        const rw1 = new Runway()
        rw1.active = false
        rw1.coordinate1 = new Coordinate(41.7,12.2)
        rw1.coordinate2 = new Coordinate(41.5,12)
        rw1.strip_length = 12802
        rw1.strip_width = 197
        rw1.heading = new Bearing(180+45)
        this.addRunway(rw1)


        createjs.Ticker.on("tick", this.tickFunction);
        createjs.Ticker.framerate = 1;
    }

    updateScale = (oldScale: number) => {
        // var scale = (1 / this.mainContainer.scaleX);
        console.log(`updateScale: scale: ${oldScale} currentScale: ${this.parameters.currentScale}`)
        const factor: number = (oldScale - this.parameters.currentScale) * 400
        this.mainContainer.regX = this.mainContainer.regX + factor
        this.mainContainer.regY = this.mainContainer.regY + factor
        console.log(`regX:  ${this.mainContainer.regX} regY: ${this.mainContainer.regY}`)
        this.parameters.currentScale = oldScale;
        // DEBUG
        // $('#scale').html( Math.round(mainContainer.scaleX * 100) + ' - ' + currentScale); //  + ' / ' + mainContainer.regX + ' - ' + mainContainer.regY);

        // updateWaypoints();
        // // updateFixes();
        // // updateNavaids();
        // updateRoutes();
        this.mainStage.update();
    }

    addRunway = (runway: Runway) => {
        const runwayGr = new RunwayGraphic()
        runwayGr.latitude = runway.coordinate1?.latitude || 0
        runwayGr.longitude = runway.coordinate1?.longitude || 0
        runwayGr.latitude_end = runway.coordinate2?.latitude || 0
        runwayGr.longitude_end = runway.coordinate2?.longitude || 0
        runwayGr.strip_length = runway.strip_length || 0
        runwayGr.strip_width = runway.strip_width || 0
        runwayGr.heading = runway.heading?.degrees || 0
        // console.log(`runway heading = ${runwayGr.heading}`)
        this.mainContainer.addChild(runwayGr)
        // runwayGr.plotRunway(this.parameters)
        runwayGr.display(this.parameters)
    }

    addWaypoint = (waypoint: Waypoint) => {
        const wp = new WaypointGraphic(waypoint)
        this.mainContainer.addChild(wp)
        console.log(`add waypoint at ${wp.latitude} / ${wp.longitude}`)
        wp.display(this.parameters)
    }

    addGrid = () => {
        const step = 0.2
        for(var lat=this.parameters.latitudeCenter -5; lat < this.parameters.latitudeCenter +5; lat += step) {
            for(var lon= this.parameters.longitudeCenter -5; lon < this.parameters.longitudeCenter +5; lon += step) {
                lat = Math.floor(lat * 10)/10;
                lon = Math.floor(lon * 10)/10;
                const grid = new GridGraphic();
                grid.p1_latitude = lat;
                grid.p1_longitude = lon;
                grid.p2_latitude = lat+step;
                grid.p2_longitude = lon;
                grid.setPosition(this.parameters);
                this.mainContainer.addChild(grid);
    
                const gridv = new GridGraphic();
                gridv.p1_latitude = lat;
                gridv.p1_longitude = lon;
                gridv.p2_latitude = lat;
                gridv.p2_longitude = lon+step;
                gridv.setPosition(this.parameters)
                this.mainContainer.addChild(gridv);
            }
        }
    }
}
