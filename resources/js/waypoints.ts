import { Waypoint } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"

export const loadWaypoints = (waypoints: Record<string, Waypoint>, canvas: Canvas) => {
    void canvas
    console.log( `Received waypoints`)
    Object.entries(waypoints).forEach(([key, wp])  => {
        void key
        canvas.addWaypoint(wp)
    })
}