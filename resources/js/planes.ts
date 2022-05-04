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