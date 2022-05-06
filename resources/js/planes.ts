import { Plane } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"
// import { PlaneGraphic } from "./graphic/plane"
// import util from 'util'

export const addPlane = (plane: Plane, canvas: Canvas) => {
    // void canvas
    console.log( `Received plane: ${plane.callsign}`)
    canvas.addPlane(plane)

    /*
    const planeGr = new PlaneGraphic(plane)
    // planeGr.latitude = plane.coordinate?.latitude || 0
    // planeGr.longitude = plane.coordinate?.longitude || 0
    planeGr.setPosition(canvas.parameters)
    console.log(`Added plane at ${plane.coordinate?.latitude} - ${plane.coordinate?.longitude} - ${planeGr.x}/${planeGr.y}`)
    canvas.mainContainer.addChild(planeGr)
    */
}

export const updatePlane = (plane: Plane, canvas: Canvas) => {
    if (!plane.callsign) {
        // TODO
       return 
    }
    const localPlaneGraphic = canvas.findPlaneGraphicByCallsign(plane.callsign)
    if (localPlaneGraphic) {
        localPlaneGraphic.plane.latitude = plane.latitude
        localPlaneGraphic.plane.longitude = plane.longitude
        localPlaneGraphic.plane.heading = plane.heading
        localPlaneGraphic.plane.heading_target = plane.heading_target
        localPlaneGraphic.plane.speed = plane.speed
        localPlaneGraphic.plane.speed_target = plane.speed_target
        localPlaneGraphic.plane.fl = plane.fl
        localPlaneGraphic.plane.fl_final = plane.fl_final
        localPlaneGraphic.plane.fl_initial = plane.fl_initial
        localPlaneGraphic.plane.fl_cleared = plane.fl_cleared
        localPlaneGraphic.plane.climb = plane.climb
        localPlaneGraphic.plane.turn = plane.turn
        // TODO other 
    }
}