import { NavaidType, Waypoint } from "../../src/core/entities"
import { Canvas } from "./graphic/canvas"

export const loadWaypoints = (waypoints: Record<string, Waypoint>, canvas: Canvas) => {
    void canvas
    console.log( `Received waypoints`)
    Object.entries(waypoints).forEach(([key, wp])  => {
        void key
        if (wp.navaidType == NavaidType.NAVAID_TYPE_VORDME) {
            canvas.addWaypoint(wp)
        }
    })
}