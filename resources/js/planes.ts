import { Plane } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"
import { PlaneGraphic } from "./graphic/plane"

export const loadPlanes = (planes: Plane[], canvas: Canvas) => {
    void canvas
    console.log( `Received planes: ${planes.length}`)

    planes.map(plane => {
        const planeGr = new PlaneGraphic()
        planeGr.latitude = plane.coordinate?.latitude || 0
        planeGr.longitude = plane.coordinate?.longitude || 0
        planeGr.setPosition(canvas.parameters)
        console.log(`Added plane at ${plane.coordinate?.latitude} - ${plane.coordinate?.longitude}`)
        canvas.mainContainer.addChild(planeGr)
    })
}